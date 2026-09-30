// api/discord-digest.js — Vercel Serverless Function, rulată de Vercel Cron
// (vezi vercel.json: la fiecare două ore, la fix) sau manual din browser.
//
// Ce face: ia aplicațiile NOI (is_read = false și încă netrimise pe Discord),
// trimite câte un mesaj (embed) pentru fiecare pe webhook-ul canalului
// #applications-hiring și apoi le marchează CITITE în admin
// (is_read = true, discord_notified_at = acum). Statusul (nou / acceptat /
// respins) nu se atinge — asta rămâne decizia omului, din admin.
//
// Ordinea e „trimite, apoi marchează", dinadins: dacă funcția pică între cele
// două, cel mult apare de două ori un mesaj (cu id-ul în subsol), niciodată nu
// se pierde în tăcere o aplicație. „Marchează necitit" din admin NU retrimite
// pe Discord (discord_notified_at rămâne pus).
//
// Variabile de mediu (Vercel → Settings → Environment Variables, Production):
//   CRON_SECRET          — obligatoriu; Vercel Cron trimite singur
//                          „Authorization: Bearer <CRON_SECRET>"; manual: ?secret=
//   DISCORD_WEBHOOK_URL  — webhook-ul canalului (Discord → canal → Integrations → Webhooks)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY — aceleași ca la api/notify.js
//   ADMIN_URL (opțional, implicit https://www.wejobs.ro/admin.html)
//   DISCORD_MAX_PER_RUN (opțional, implicit 30, maxim 100)
//
// Probă fără efecte: GET /api/discord-digest?secret=<CRON_SECRET>&dry=1
// → arată ce s-ar trimite, fără să posteze și fără să marcheze nimic.

const crypto = require("crypto");

// `vercel env add` din PowerShell poate lipi un BOM (U+FEFF) în față — îl scoatem.
const env = (name, fallback) => String(process.env[name] || fallback || "").replace(/^﻿/, "").trim();

const SITE = "https://www.wejobs.ro";
const COLOR = 0xc9962e; // auriul site-ului
const SELECT = "id,name,phone,email,job_title,job_id,source,country,birth_date,city,experience,last_job,licenses,lang_de,lang_en,available_from,needs_housing,message,status,created_at";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function sameSecret(given, expected) {
  if (!given || !expected) return false;
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

function authorized(req, url, secret) {
  const header = String(req.headers["authorization"] || "");
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return sameSecret(bearer, secret) || sameSecret(url.searchParams.get("secret"), secret);
}

// ---- text helpers ----
const clip = (s, n) => { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
// Textul candidatului nu are voie să devină formatare Discord (bold, linkuri, @).
const plain = (s) => String(s == null ? "" : s).replace(/[*_~`|>@#\[\]]/g, (c) => "\\" + c).replace(/\s+/g, " ").trim();
const dash = (s) => (s == null || String(s).trim() === "" ? "—" : plain(s));

function fmtDate(v) {
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : plain(v);
}
// Vârsta, ca în admin.html (varsta(birth_date)).
function age(birth) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(birth || ""));
  if (!m) return null;
  const b = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getUTCFullYear() - b.getUTCFullYear();
  const before = now.getUTCMonth() < b.getUTCMonth() || (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate());
  if (before) a -= 1;
  return a >= 14 && a <= 90 ? a : null;
}
function berlin(iso) {
  try {
    return new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return String(iso || ""); }
}

// Un embed per aplicație — aceleași grupe ca fișa din admin (Date personale,
// Profil profesional, Permis, Limbi, Disponibilitate, Mesaj).
function embedFor(a, adminUrl) {
  const yrs = age(a.birth_date);
  const title = clip(`Aplicație nouă — ${plain(a.name) || "fără nume"}${yrs ? ` (${yrs} ani)` : ""}`, 256);
  const fields = [];
  const add = (name, value, inline) => { const v = clip(String(value || "").trim(), 1024); if (v && v !== "—") fields.push({ name, value: v, inline: Boolean(inline) }); };
  add("Telefon", dash(a.phone), true);
  add("Email", dash(a.email), true);
  add("Post dorit", dash(a.job_title), true);
  add("Date personale", [a.birth_date ? `Născut: ${fmtDate(a.birth_date)}` : "", a.city ? `Localitate: ${plain(a.city)}` : "", a.country ? `Țară: ${plain(a.country)}` : ""].filter(Boolean).join(" · "));
  add("Profil profesional", [a.experience ? `Experiență: ${plain(a.experience)}` : "", a.last_job ? `Ultimul loc: ${plain(a.last_job)}` : ""].filter(Boolean).join(" · "));
  add("Permis de conducere", a.licenses ? String(a.licenses).split(",").map((x) => plain(x)).filter(Boolean).join(", ") : "");
  add("Limbi străine", [a.lang_de ? `Germană: ${plain(a.lang_de)}` : "", a.lang_en ? `Engleză: ${plain(a.lang_en)}` : ""].filter(Boolean).join(" · "));
  add("Disponibilitate", [a.available_from ? `De la: ${fmtDate(a.available_from)}` : "", a.needs_housing ? `Cazare: ${plain(a.needs_housing)}` : ""].filter(Boolean).join(" · "));
  add("Mesaj", a.message ? clip(plain(a.message), 1000) : "");
  const embed = {
    title,
    url: a.job_id ? `${SITE}/job?id=${encodeURIComponent(a.job_id)}` : adminUrl,
    description: clip([plain(a.source), a.status && a.status !== "nou" ? `Status: ${plain(a.status)}` : ""].filter(Boolean).join(" · "), 4096) || undefined,
    color: COLOR,
    fields: fields.slice(0, 25),
    footer: { text: clip(`Aplicat ${berlin(a.created_at)} · id ${String(a.id || "").slice(0, 8)} · Admin: ${adminUrl}`, 2048) },
    timestamp: a.created_at || undefined,
  };
  // Limita totală Discord: 6000 de caractere pe embed.
  let total = (embed.title || "").length + (embed.description || "").length + embed.footer.text.length + fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
  while (total > 5900 && embed.fields.length) { const f = embed.fields.pop(); total -= f.name.length + f.value.length; }
  return embed;
}

async function supabase(base, key, path, init) {
  const r = await fetch(base + "/rest/v1/" + path, {
    ...init,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(init && init.headers ? init.headers : {}) },
  });
  return r;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postDiscord(webhook, payload) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch(webhook + (webhook.includes("?") ? "&" : "?") + "wait=true", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (r.status === 200 || r.status === 204) return { ok: true };
    if (r.status === 429 && attempt === 0) {
      let wait = 1500;
      try { const j = await r.json(); if (j && j.retry_after) wait = Math.min(10000, Math.ceil(Number(j.retry_after) * 1000) + 250); } catch {}
      await sleep(wait);
      continue;
    }
    const text = await r.text().catch(() => "");
    return { ok: false, error: `Discord HTTP ${r.status} ${clip(text, 200)}` };
  }
  return { ok: false, error: "Discord: prea multe cereri" };
}

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });
  const secret = env("CRON_SECRET");
  if (!secret) return json(res, 503, { ok: false, error: "CRON_SECRET lipsește din Vercel" });
  const url = new URL(req.url || "/", "http://localhost");
  if (!authorized(req, url, secret)) return json(res, 401, { ok: false, error: "Unauthorized" });

  const SUPABASE_URL = env("SUPABASE_URL").replace(/\/+$/, "");
  const SERVICE_KEY = env("SUPABASE_SERVICE_KEY");
  const WEBHOOK = env("DISCORD_WEBHOOK_URL");
  const ADMIN_URL = env("ADMIN_URL", "https://www.wejobs.ro/admin.html");
  const MAX = Math.min(100, Math.max(1, parseInt(env("DISCORD_MAX_PER_RUN", "30"), 10) || 30));
  const dry = url.searchParams.get("dry") === "1";

  const missing = [["SUPABASE_URL", SUPABASE_URL], ["SUPABASE_SERVICE_KEY", SERVICE_KEY], ["DISCORD_WEBHOOK_URL", WEBHOOK]].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length && !(dry && missing.length === 1 && missing[0] === "DISCORD_WEBHOOK_URL")) {
    return json(res, 200, { ok: false, error: "Config missing", variabile_lipsa: missing });
  }
  if (!/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\//.test(WEBHOOK) && !dry) {
    return json(res, 200, { ok: false, error: "DISCORD_WEBHOOK_URL nu arată ca un webhook Discord" });
  }

  // Aplicațiile noi, netrimise încă — cele mai vechi primele.
  const q = `applications?select=${SELECT}&is_read=eq.false&discord_notified_at=is.null&order=created_at.asc&limit=${MAX}`;
  const list = await supabase(SUPABASE_URL, SERVICE_KEY, q, { method: "GET" });
  if (!list.ok) {
    const text = await list.text().catch(() => "");
    const hint = list.status === 401 || list.status === 403 ? "cheia service_role e greșită" : /discord_notified_at/.test(text) ? "rulează sql/0001_discord_notified.sql" : "";
    return json(res, 200, { ok: false, error: `Supabase HTTP ${list.status}${hint ? " — " + hint : ""}`, detail: clip(text, 300) });
  }
  const rows = await list.json();
  const pending = rows.map((a) => ({ id: a.id, name: a.name, job_title: a.job_title, created_at: a.created_at }));
  if (dry) return json(res, 200, { ok: true, dry: true, pending: pending.length, aplicatii: pending });

  let posted = 0, marked = 0;
  const errors = [];
  for (const a of rows) {
    // Rulează din două locuri (cronul Vercel la fix, agentul Yuma Sync la și
    // jumătate, plus „Rulează acum"): întâi se REVENDICĂ aplicația (doar cine
    // găsește discord_notified_at încă gol o ia), apoi se postează. Dacă
    // postarea pică, revendicarea se retrage și rămâne pentru rularea următoare.
    const claim = await supabase(SUPABASE_URL, SERVICE_KEY, `applications?id=eq.${encodeURIComponent(a.id)}&discord_notified_at=is.null&select=id`, {
      method: "PATCH", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ discord_notified_at: new Date().toISOString() }),
    });
    const won = claim.ok ? await claim.json().then((r) => Array.isArray(r) && r.length > 0).catch(() => false) : false;
    if (!won) continue;                                               // a luat-o deja cealaltă rulare
    const sent = await postDiscord(WEBHOOK, { username: "WeJobs.ro", embeds: [embedFor(a, ADMIN_URL)], allowed_mentions: { parse: [] } });
    if (!sent.ok) {
      await supabase(SUPABASE_URL, SERVICE_KEY, `applications?id=eq.${encodeURIComponent(a.id)}`, {
        method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ discord_notified_at: null }),
      });
      errors.push(`${a.id}: ${sent.error}`); break;                     // nu insistăm: se reia la ora următoare
    }
    posted += 1;
    const patch = await supabase(SUPABASE_URL, SERVICE_KEY, `applications?id=eq.${encodeURIComponent(a.id)}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ is_read: true }),
    });
    if (patch.ok) marked += 1; else errors.push(`${a.id}: marcare eșuată (HTTP ${patch.status})`);
    await sleep(400);
  }
  console.log(`[discord-digest] pending=${rows.length} posted=${posted} marked=${marked} errors=${errors.length}`);
  return json(res, 200, { ok: errors.length === 0, pending: rows.length, posted, marked, errors });
};
