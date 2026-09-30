# WeJobs.ro — platforma de recrutare

Site static + funcții Vercel (`api/`), date în Supabase (proiectul „wejobs").
Deploy: Vercel `yuma18/recruitment-platform` (domeniul www.wejobs.ro).

## Notificări la aplicații noi

- **Push pe telefon (imediat):** `api/notify.js`, apelat de browserul candidatului
  după trimitere. Diagnostic fără secrete: `GET https://www.wejobs.ro/api/notify`
  arată ce variabile lipsesc și câte telefoane sunt abonate. Are nevoie de
  `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
- **Discord, la fiecare oră:** `api/discord-digest.js`, pornit de Vercel Cron
  (`vercel.json`, la fix) și de agentul Yuma Sync (la și jumătate). Ia aplicațiile
  NOI (necitite și netrimise), le revendică una câte una (fără dubluri), postează
  câte un mesaj pe webhook-ul canalului de recrutare și le marchează citite
  (`is_read`, `discord_notified_at`). Statusul (nou/acceptat/respins) nu se atinge;
  „Marchează necitit" din admin nu retrimite.
  - o dată: rulează `sql/0001_discord_notified.sql` în Supabase;
  - variabile (Vercel → Settings → Environment Variables → Production):
    `CRON_SECRET` (pus deja), `DISCORD_WEBHOOK_URL` (webhook-ul canalului),
    opțional `ADMIN_URL`, `DISCORD_MAX_PER_RUN` (implicit 30);
  - probă fără efecte: `https://www.wejobs.ro/api/discord-digest?secret=<CRON_SECRET>&dry=1`;
  - rulare manuală: același link fără `&dry=1`.

Secretele se pun din interfața Vercel (nu prin PowerShell — adaugă un BOM în valoare).
