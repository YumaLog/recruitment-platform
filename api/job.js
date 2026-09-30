// api/job.js  —  Vercel Serverless Function (Node)
// Randează pagina jobului PE SERVER, direct din Supabase.
// Astfel Google vede tot conținutul + JobPosting fără să ruleze JavaScript.
// Orice job adăugat din admin (în Supabase) apare automat, fără rebuild.

const SUPABASE_URL = "https://cmpagnbvympkrtcjnefz.supabase.co";
const SUPABASE_KEY = "sb_publishable_B66wSpD1Xd2a7PkCUAZBQQ_qYY6650Q";
const SITE = "https://wejobs.ro";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

const CSS = ":root{\n  --black:#08080a;--graphite:#0e0e11;--surface:#131317;--card:#16161b;--card-hi:#1d1d23;\n  --line:rgba(255,255,255,.08);--line-2:rgba(255,255,255,.05);--line-gold:rgba(201,150,46,.34);\n  --gold:#c9962e;--gold-2:#e7c876;--gold-3:#f5e3aa;--white:#f4f3ef;--gray:#a3a3ab;--gray-d:#6d6d76;\n}\n*{box-sizing:border-box;margin:0;padding:0}\nhtml{scroll-behavior:smooth}\nbody{font-family:\"Manrope\",system-ui,sans-serif;background:var(--black);color:var(--white);line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}\nbody::before{content:\"\";position:fixed;inset:0;z-index:-2;background:radial-gradient(900px 600px at 82% -8%,rgba(201,150,46,.14),transparent 60%),radial-gradient(700px 700px at -10% 30%,rgba(201,150,46,.06),transparent 60%),linear-gradient(180deg,#08080a,#0b0b0e 40%,#08080a)}\nbody::after{content:\"\";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.05;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")}\na{text-decoration:none;color:inherit}\nimg{max-width:100%;display:block}\n.container{width:min(1200px,92%);margin:auto}\n.gold-text{background:linear-gradient(100deg,#9a7322,#e7c876 34%,#f8eecb 50%,#c9962e 68%,#8a6418);-webkit-background-clip:text;background-clip:text;color:transparent}\n.eyebrow{font-family:\"Archivo\",sans-serif;text-transform:uppercase;letter-spacing:.32em;font-size:12px;font-weight:700;color:var(--gold-2);display:inline-flex;align-items:center;gap:12px}\n.eyebrow::before{content:\"\";width:34px;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}\n\nheader{position:sticky;top:0;z-index:100;background:rgba(8,8,10,.72);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}\n.nav{height:84px;display:flex;align-items:center;justify-content:space-between;gap:20px}\n.brand{display:flex;align-items:center;gap:13px}\n.brand img{width:46px;height:46px;object-fit:contain}\n.brand-name{font-family:\"Archivo\",sans-serif;font-weight:900;font-size:22px;letter-spacing:-.5px}\n.brand-name .ro{font-size:14px;color:var(--gold-2);font-weight:700;vertical-align:super}\n.navlinks{display:flex;gap:34px;font-family:\"Archivo\",sans-serif;font-weight:600;font-size:14.5px}\n.navlinks a{color:#d7d7dc;position:relative;padding:4px 0}\n.navlinks a::after{content:\"\";position:absolute;left:0;bottom:-2px;height:1.5px;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-2));transition:width .3s}\n.navlinks a:hover{color:#fff}.navlinks a:hover::after{width:100%}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:\"Archivo\",sans-serif;font-weight:700;font-size:14.5px;border:0;cursor:pointer;border-radius:12px;padding:14px 24px;transition:transform .25s,box-shadow .25s,background .25s}\n.btn.gold{background:linear-gradient(135deg,#e7c876,#c9962e 55%,#a9781f);color:#10100a;box-shadow:0 10px 30px rgba(201,150,46,.28)}\n.btn.gold:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(201,150,46,.4)}\n.btn.ghost{background:transparent;color:var(--white);border:1px solid rgba(255,255,255,.18)}\n.btn.ghost:hover{border-color:var(--gold);color:var(--gold-2);transform:translateY(-3px)}\n.btn.wa{background:#1f2a24;color:#eafff2;border:1px solid rgba(37,211,102,.4)}\n.btn.wa:hover{background:#25382e;transform:translateY(-3px)}\n.btn.wa svg{width:18px;height:18px;fill:#37e08a}\n\n.job-hero{position:relative;overflow:hidden;border-bottom:1px solid var(--line)}\n.job-hero .bg{position:absolute;inset:0;z-index:-1;background:radial-gradient(120% 120% at 75% 0%,rgba(201,150,46,.18),transparent 55%),linear-gradient(160deg,#16161b,#0b0b0e)}\n.job-hero .bg img{width:100%;height:100%;object-fit:cover;filter:brightness(.4) contrast(1.05)}\n.job-hero .bg::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,8,10,.94),rgba(8,8,10,.72) 55%,rgba(8,8,10,.5))}\n.job-hero-inner{padding:84px 0}\n.back-btn{margin-bottom:20px;padding:10px 18px;font-size:13.5px}\n.breadcrumb{font-family:\"Archivo\";font-size:13px;color:var(--gray);margin-bottom:22px;letter-spacing:.04em}\n.breadcrumb a:hover{color:var(--gold-2)}\n.job-hero .cat{display:inline-block;font-family:\"Archivo\";font-weight:700;font-size:12px;letter-spacing:.12em;text-transform:uppercase;background:rgba(201,150,46,.13);border:1px solid var(--line-gold);color:var(--gold-2);padding:8px 15px;border-radius:999px;margin-bottom:18px}\n.job-hero h1{font-family:\"Archivo\",sans-serif;font-weight:900;font-size:clamp(38px,5.4vw,68px);line-height:.97;letter-spacing:-2px;max-width:780px}\n.job-hero .salary-big{font-family:\"Archivo\";font-weight:800;font-size:clamp(26px,3.4vw,40px);margin-top:18px}\n.job-hero .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:30px}\n\n.job-layout{display:grid;grid-template-columns:1fr 380px;gap:42px;padding:80px 0;align-items:start}\n.prose h2{font-family:\"Archivo\",sans-serif;font-weight:800;font-size:30px;letter-spacing:-1px;margin:0 0 18px}\n.prose .block{margin-bottom:42px}\n.prose p{color:#d4d4da;font-size:16.5px;margin-bottom:8px}\n.checklist{list-style:none;display:grid;gap:12px;margin-top:6px}\n.checklist li{display:flex;gap:13px;align-items:flex-start;color:#dcdce1;font-size:16px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:14px 16px}\n.checklist li svg{flex:none;width:20px;height:20px;margin-top:1px;fill:none;stroke:var(--gold-2);stroke-width:2.4}\n.facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-2);border:1px solid var(--line-2);border-radius:16px;overflow:hidden;margin-bottom:38px}\n.facts .f{background:var(--card);padding:18px 18px}\n.facts .f b{display:block;font-family:\"Archivo\";font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gray-d);margin-bottom:5px}\n.facts .f span{font-size:16px;font-weight:600;color:#ececf0}\n\n.sidebar{position:sticky;top:104px;display:grid;gap:18px}\n.apply-card{background:linear-gradient(180deg,var(--card-hi),var(--card));border:1px solid var(--line-gold);border-radius:22px;padding:26px;box-shadow:0 30px 70px rgba(0,0,0,.45)}\n.apply-card h3{font-family:\"Archivo\";font-weight:800;font-size:20px;margin-bottom:6px}\n.apply-card .sub{color:var(--gray);font-size:14px;margin-bottom:20px}\n.apply-card .row{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line-2);font-size:14.5px}\n.apply-card .row:last-of-type{border-bottom:0}\n.apply-card .row span{color:var(--gray)}\n.apply-card .row b{font-family:\"Archivo\";font-weight:700}\n.apply-card .acts{display:grid;gap:11px;margin-top:20px}\n.apply-card .btn{width:100%}\n\n.apply-section{padding:30px 0 96px}\n.form-wrap{background:linear-gradient(180deg,var(--card-hi),var(--card));border:1px solid var(--line);border-radius:24px;padding:38px;max-width:760px;margin:auto;box-shadow:0 30px 70px rgba(0,0,0,.4)}\n.form-wrap .eyebrow{margin-bottom:14px}\n.form-wrap h2{font-family:\"Archivo\";font-weight:800;font-size:clamp(26px,3vw,36px);letter-spacing:-1px;margin-bottom:8px}\n.form-wrap > p{color:var(--gray);margin-bottom:26px}\n.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}\nlabel{display:block;font-family:\"Archivo\";font-weight:600;font-size:13px;margin-bottom:8px;color:#dadadf}\ninput,select,textarea{width:100%;background:var(--black);border:1px solid var(--line);color:var(--white);border-radius:12px;padding:14px 15px;margin-bottom:18px;font-size:15px;font-family:\"Manrope\";transition:border-color .2s,box-shadow .2s}\ninput::placeholder,textarea::placeholder{color:#5d5d66}\ninput:focus,select:focus,textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,150,46,.13)}\nselect{appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23c9962e'%3E%3Cpath d='M7 10L2 4h10z'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 16px center}\ntextarea{min-height:120px;resize:vertical}\n.readonly-field{background:rgba(201,150,46,.07);border-color:var(--line-gold);color:var(--gold-2);font-weight:600}\n.form-note{font-size:12.5px;color:var(--gray-d);margin-top:4px}\n.consent{display:flex;gap:10px;align-items:flex-start;font-family:\"Manrope\";font-weight:500;font-size:13px;color:var(--gray);margin:0 0 18px}\n.consent input{width:auto;margin:3px 0 0}\n.consent a{color:var(--gold-2);text-decoration:underline}\n\nfooter{border-top:1px solid var(--line);padding:64px 0 32px;background:var(--graphite)}\n.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:36px}\n.footer-grid p{color:var(--gray);font-size:15px;max-width:320px}\n.footer-grid .slogan{font-family:\"Fraunces\",serif;font-style:italic;color:var(--gold-2);margin-top:10px}\nfooter h4{font-family:\"Archivo\";font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:16px}\nfooter .fl{display:grid;gap:10px}\nfooter .fl a,footer .fl span{color:var(--gray);font-size:15px;transition:color .2s}\nfooter .fl a:hover{color:var(--gold-2)}\n.socials{display:flex;gap:12px;margin-top:18px}\n.socials a{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:var(--card);border:1px solid var(--line);transition:.2s}\n.socials a:hover{border-color:var(--gold);transform:translateY(-2px)}\n.socials svg{width:20px;height:20px;fill:var(--gold-2)}\n.copy{margin-top:46px;padding-top:24px;border-top:1px solid var(--line-2);text-align:center;color:var(--gray-d);font-size:13px}\n\n.floating-wa{position:fixed;right:22px;bottom:22px;z-index:999;width:60px;height:60px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 14px 36px rgba(37,211,102,.4);transition:transform .25s}\n.floating-wa:hover{transform:scale(1.08)}.floating-wa svg{width:30px;height:30px;fill:#fff}\n.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}\n.reveal.in{opacity:1;transform:none}\n.notfound{padding:140px 0;text-align:center}\n.notfound h1{font-family:\"Archivo\";font-weight:900;font-size:clamp(34px,5vw,56px);letter-spacing:-1.5px;margin-bottom:14px}\n.notfound p{color:var(--gray);font-size:17px;margin-bottom:28px}\n\n@media(max-width:980px){.navlinks{display:none}.job-layout{grid-template-columns:1fr;gap:34px}.sidebar{position:static}.footer-grid{grid-template-columns:1fr}.nav{height:72px}}\n@media(max-width:520px){\n  .form-row{grid-template-columns:1fr}\n  .job-hero-inner{padding:38px 0 42px}\n  .job-hero h1{font-size:26px;letter-spacing:-1px;line-height:1.06}\n  .job-hero .salary-big{font-size:22px;margin-top:12px}\n  .job-hero .cat{margin-bottom:12px;font-size:11px;padding:6px 12px}\n  .back-btn{margin-bottom:14px}\n  .breadcrumb{margin-bottom:14px;font-size:12px}\n  .facts{display:flex;grid-template-columns:none;gap:10px;background:transparent;border:0;border-radius:0;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-bottom:30px;padding-bottom:4px}\n  .facts::-webkit-scrollbar{display:none}\n  .facts .f{flex:0 0 56%;scroll-snap-align:start;border:1px solid var(--line-2);border-radius:14px;padding:13px 15px}\n  .facts .f span{font-size:15px}\n}\n.btn.is-disabled{background:rgba(255,255,255,.05);color:var(--gray);border:1px solid var(--line);cursor:not-allowed;box-shadow:none;pointer-events:none}\n.closed-wrap{text-align:center;max-width:620px;margin:auto;background:linear-gradient(180deg,var(--card-hi),var(--card));border:1px solid var(--line-gold);border-radius:24px;padding:44px 34px;box-shadow:0 30px 70px rgba(0,0,0,.4)}\n.closed-wrap .ico{width:62px;height:62px;border-radius:50%;border:1.5px solid var(--line-gold);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;background:rgba(201,150,46,.08);color:var(--gold-2)}\n.closed-wrap .ico svg{width:28px;height:28px}\n.closed-wrap .eyebrow{margin-bottom:12px}\n.closed-wrap h2{font-family:\\\"Archivo\\\",sans-serif;font-weight:900;font-size:clamp(24px,4vw,34px);letter-spacing:-1px;line-height:1.1;margin-bottom:14px}\n.closed-wrap p{color:var(--gray);font-size:16px;line-height:1.65;margin-bottom:26px}\n.phone-group{display:grid;grid-template-columns:118px 1fr;gap:8px;align-items:start}\n.cv-more{border:1px solid var(--line);border-radius:14px;margin:4px 0 18px;overflow:hidden}\n.cv-more>summary{list-style:none;cursor:pointer;padding:14px 16px;font-family:\"Archivo\",sans-serif;font-weight:700;font-size:14.5px;color:var(--gold-2);display:flex;align-items:center;justify-content:space-between;gap:10px}\n.cv-more>summary::-webkit-details-marker{display:none}\n.cv-more>summary span{font-family:\"Manrope\",sans-serif;font-weight:400;font-size:12.5px;color:var(--gray-d)}\n.cv-more>summary::after{content:\"+\";font-size:20px;color:var(--gold-2);flex:none}\n.cv-more[open]>summary::after{content:\"\u2013\"}\n.cv-more .inner{padding:2px 16px 16px}\n.chk-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}\n.chk-row label{display:inline-flex;align-items:center;gap:7px;margin:0;font-size:13.5px;color:#cfcfd6;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 13px;cursor:pointer}\n.chk-row input{width:auto;margin:0}\n.phone-group select{margin-bottom:18px;padding-left:12px;padding-right:26px;background-position:right 10px center;font-size:14.5px}\n.phone-group input{margin-bottom:18px}\n.form-ok{background:rgba(55,224,138,.1);border:1px solid rgba(55,224,138,.4);color:#9af5c9;border-radius:12px;padding:14px 16px;font-size:14.5px;margin-top:10px}\n.form-err{background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.4);color:#ff9d9d;border-radius:12px;padding:14px 16px;font-size:14.5px;margin-top:10px}\n.wj-thanks{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:18px}\n.wj-thanks.open{display:flex}\n.wj-thanks .bg{position:absolute;inset:0;background:rgba(4,4,6,.8);backdrop-filter:blur(8px)}\n.wj-thanks .card{position:relative;width:100%;max-width:440px;text-align:center;padding:42px 32px 34px;border-radius:24px;background:linear-gradient(180deg,#1c1c22,#141419);border:1px solid var(--line-gold);box-shadow:0 34px 90px rgba(0,0,0,.75)}\n.wj-thanks .tick{width:78px;height:78px;margin:0 auto 20px;border-radius:50%;display:grid;place-items:center;background:rgba(55,224,138,.1);border:1.5px solid rgba(55,224,138,.45)}\n.wj-thanks .tick svg{width:38px;height:38px;fill:none;stroke:#5ee6a0;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}\n.wj-thanks h3{font-family:\"Archivo\",sans-serif;font-weight:900;font-size:clamp(22px,4.4vw,28px);letter-spacing:-.8px;line-height:1.15;margin-bottom:12px}\n.wj-thanks p{color:var(--gray);font-size:15.5px;line-height:1.65;margin-bottom:18px}\n.wj-thanks .when{display:flex;align-items:center;gap:11px;text-align:left;background:rgba(201,150,46,.08);border:1px solid var(--line-gold);border-radius:14px;padding:13px 15px;margin-bottom:22px}\n.wj-thanks .when svg{flex:none;width:21px;height:21px;fill:none;stroke:var(--gold-2);stroke-width:2}\n.wj-thanks .when b{display:block;font-family:\"Archivo\",sans-serif;font-size:14px;color:var(--gold-2);margin-bottom:1px}\n.wj-thanks .when span{font-size:13px;color:var(--gray);line-height:1.45}\n.wj-thanks .ok{width:100%;justify-content:center}";

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';

async function supa(path) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
  });
  if (!r.ok) throw new Error("Supabase " + r.status);
  return r.json();
}

function salaryToSchema(salary) {
  if (!salary) return null;
  const nums = (salary.match(/\d[\d.\s]*/g) || []).map(n => parseInt(n.replace(/[.\s]/g,""),10)).filter(n=>!isNaN(n));
  if (!nums.length) return null;
  const v = nums.length >= 2
    ? { "@type":"QuantitativeValue", minValue: nums[0], maxValue: nums[1], unitText: "MONTH" }
    : { "@type":"QuantitativeValue", value: nums[0], unitText: "MONTH" };
  return { "@type":"MonetaryAmount", currency:"EUR", value:v };
}

function head(title, desc, canonical, image, jsonld) {
  return `<!DOCTYPE html><html lang="ro"><head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="${esc(canonical)}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="WeJobs.ro"/>
<meta property="og:locale" content="ro_RO"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" href="/favicon.ico" sizes="any"/>
<link rel="icon" type="image/png" sizes="48x48" href="/assets/images/favicon-48.png"/>
<link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon-192.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@1,9..144,400..600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
${jsonld ? '<script type="application/ld+json">' + jsonld + '</script>' : ''}
<style>${CSS}</style></head>`;
}

const HEADER = `<body>
<header><div class="container nav">
  <a href="/" class="brand"><span class="brand-name" translate="no"><b>WE</b><span class="gold-text">JOBS</span><span class="ro">.RO</span></span></a>
  <nav class="navlinks"><a href="/">Acasă</a><a href="/#joburi">Joburi</a><a href="/#aplica">Aplică</a><a href="/#intrebari">Întrebări</a></nav>
  <a class="btn gold" href="#aplica">Aplică acum</a>
</div></header>`;

function footer(jobLinks) {
  return `<footer><div class="container"><div class="footer-grid">
  <div>
    <a href="/" class="brand" style="margin-bottom:6px;"><span class="brand-name" translate="no"><b>WE</b><span class="gold-text">JOBS</span><span class="ro">.RO</span></span></a>
    <p class="slogan">Jobul potrivit începe aici.</p>
    <p style="margin-top:14px;">Agenție de recrutare pentru candidați din România, cu locuri de muncă verificate în Uniunea Europeană.</p>
    <div class="socials">
      <a href="https://www.facebook.com/profile.php?id=61584767938916" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z"/></svg></a>
      <a href="https://www.tiktok.com/@wejobs.ro" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M16.5 5.5a4.5 4.5 0 003.5 1.7v3a7.5 7.5 0 01-3.8-1.04v6.3a5.46 5.46 0 11-5.46-5.46c.2 0 .4.01.6.04v3.06a2.5 2.5 0 102.36 2.5V2h2.8a4.5 4.5 0 00.4 3.5z"/></svg></a>
    </div>
  </div>
  <div><h4>Navigare</h4><div class="fl">${jobLinks}</div></div>
  <div><h4>Contact</h4><div class="fl">
    <a href="/#companii">Pentru companii</a>
    <a href="/legal#impressum">Impressum</a>
    <a href="/legal">Confidențialitate (GDPR)</a>
    <span>Răspundem prompt la aplicări</span>
  </div></div>
</div>
<div class="copy">© 2026 WeJobs.ro. Toate drepturile rezervate. · <a href="/legal#impressum" style="color:inherit">Impressum</a> · <a href="/legal" style="color:inherit">Confidențialitate (GDPR)</a></div>
</div></footer></body></html>`;
}

function notFound(jobLinks) {
  return head(
    "Job indisponibil | WeJobs.ro",
    "Această ofertă nu mai este activă. Vezi joburile disponibile acum pe WeJobs.ro.",
    SITE + "/", SITE + "/assets/images/hero-soferi-germania.webp.png", null
  ) + HEADER + `<main><div class="container"><div class="notfound">
    <span class="eyebrow">Ofertă indisponibilă</span>
    <h1>Acest job nu <span class="gold-text">există</span> sau nu mai este activ</h1>
    <p>Poate a fost ocupat. Vezi joburile disponibile acum.</p>
    <a class="btn gold" href="/#joburi">Vezi joburile disponibile</a>
  </div></div></main>` + footer(jobLinks);
}

module.exports = async (req, res) => {
  const url = new URL(req.url, SITE);
  const id = url.searchParams.get("id");

  let all = [];
  try { all = await supa("jobs?active=eq.true&select=*&order=sort.asc,created_at.desc"); }
  catch (e) { console.error(e); }

  const jobLinks = '<a href="/">Acasă</a>'
    + '<a href="/#joburi">Joburi disponibile</a>'
    + '<a href="/#aplica">Aplică online</a>'
    + '<a href="/#companii">Pentru companii</a>'
    + '<a href="/#intrebari">Întrebări frecvente</a>';

  const job = all.find(j => j.id === id) || null;

  if (!job) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    return res.end(notFound(jobLinks));
  }

  const f = job.facts || {};
  const canonical = SITE + "/job?id=" + encodeURIComponent(job.id);
  const image = job.image
    ? (job.image.startsWith("http") ? job.image : SITE + "/" + job.image.replace(/^\//,""))
    : SITE + "/assets/images/hero-soferi-germania.webp.png";
  const desc = (job.intro || `${job.title} – ${job.salary||""}. Aplică online prin WeJobs.ro.`).replace(/\s+/g," ").trim().slice(0,160);
  const title = job.title + (job.salary ? " – " + job.salary : "") + " | WeJobs.ro";

  const jp = {
    "@context":"https://schema.org","@type":"JobPosting",
    title: job.title,
    description: "<p>" + esc(job.intro || job.title) + "</p>",
    datePosted: (job.created_at || new Date().toISOString()).slice(0,10),
    validThrough: new Date(Date.now()+60*864e5).toISOString().slice(0,10),
    employmentType: "FULL_TIME",
    hiringOrganization: { "@type":"Organization", name:"WeJobs.ro", sameAs:SITE, logo: SITE+"/assets/images/logo-wejobs-header.png" },
    jobLocation: { "@type":"Place", address:{ "@type":"PostalAddress", addressLocality: f.locatii || "Germania", addressCountry:"DE" } },
    directApply: true
  };
  const bs = salaryToSchema(job.salary);
  if (bs) jp.baseSalary = bs;

  const unavailable = job.unavailable === true;
  const PAUSE = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;fill:currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  const factCells = [["Locații",f.locatii],["Permis",f.permis],["Tip job",f.tip],["Țară",f.tara]]
    .filter(c=>c[1]).map(c=>`<div class="f"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join("");

  const list = (t,arr) => (arr&&arr.length)
    ? `<div class="block"><h2>${esc(t)}</h2><ul class="checklist">${arr.map(x=>`<li>${CHECK}${esc(x)}</li>`).join("")}</ul></div>` : "";
  const intro = job.intro ? `<div class="block"><h2>Despre acest job</h2><p>${esc(job.intro)}</p></div>` : "";

  const sideRows = [["Salariu",job.salary],["Locații",f.locatii],["Permis",f.permis],["Tip job",f.tip]]
    .filter(r=>r[1]).map((r,i)=>`<div class="row"><span>${esc(r[0])}</span><b ${i===0?'class="gold-text"':""}>${esc(r[1])}</b></div>`).join("");

  const heroBg = job.image ? `<img src="${esc(image)}" alt="${esc(job.title)}" onerror="this.style.display='none'">` : "";

  const body = HEADER + `<main>
  <section class="job-hero">
    <div class="bg">${heroBg}</div>
    <div class="container job-hero-inner">
      <a href="/#joburi" class="btn ghost back-btn">← Înapoi la joburi</a>
      <div class="breadcrumb"><a href="/">Acasă</a> / <a href="/#joburi">Joburi</a> / ${esc(job.title)}</div>
      ${job.category?`<span class="cat">${esc(job.category)}</span>`:""}
      <h1>${esc(job.title)}</h1>
      ${job.salary?`<div class="salary-big gold-text">${esc(job.salary)}</div>`:""}
      <div class="hero-actions">${unavailable
        ? `<span class="btn is-disabled">${PAUSE} Post indisponibil momentan</span>`
        : `<a href="#aplica" class="btn gold">Aplică acum</a>`}</div>
    </div>
  </section>
  <div class="container"><div class="job-layout">
    <div class="prose">
      ${factCells?`<div class="facts">${factCells}</div>`:""}
      ${intro}
      ${list("Responsabilități", job.responsibilities)}
      ${list("Cerințe", job.requirements)}
      ${list("Ce oferim", job.offer)}
    </div>
    <aside class="sidebar"><div class="apply-card">
      <h3>${unavailable ? 'Aplicări închise' : 'Aplică acum'}</h3>
      <p class="sub">${unavailable ? 'Acest post nu mai primește aplicări momentan.' : 'Angajatorul te sună în 48 de ore. Gratuit.'}</p>
      ${sideRows}
      <div class="acts">${unavailable
        ? `<span class="btn is-disabled">${PAUSE} Indisponibil momentan</span>
        <a class="btn ghost" href="/#joburi">Vezi alte joburi</a>`
        : `<a href="#aplica" class="btn gold">Aplică prin formular</a>`}
      </div>
    </div></aside>
  </div></div>
  <section id="aplica" class="apply-section"><div class="container">${unavailable
    ? `<div class="closed-wrap">
    <div class="ico">${PAUSE}</div>
    <span class="eyebrow">Aplicări închise</span>
    <h2>Acest job este <span class="gold-text">indisponibil momentan</span></h2>
    <p>Momentan nu se mai primesc aplicări pentru <b>${esc(job.title)}</b>. Postul rămâne vizibil, iar când redevine disponibil vei putea aplica din nou de aici.</p>
    <a class="btn gold" href="/#joburi">Vezi joburile disponibile</a>
  </div>`
    : `<div class="form-wrap">
    <span class="eyebrow">Aplicare</span>
    <h2>Aplică pentru <span class="gold-text">${esc(job.title)}</span></h2>
    <p>Aplicația ajunge direct la angajator. El te sună în maximum 48 de ore lucrătoare. Nu plătești nimic.</p>
    <form id="apply-form">
      <div class="form-row">
        <div><label for="nume">Nume complet</label><input id="nume" type="text" required placeholder="Ex: Popescu Ion"></div>
        <div><label for="telefon">Telefon</label>
          <div class="phone-group">
            <select id="phone-prefix" aria-label="Prefix țară"></select>
            <input id="telefon" type="tel" required inputmode="tel" placeholder="7XX XXX XXX">
          </div>
        </div>
      </div>
      <label for="email">Email</label><input id="email" type="email" required placeholder="email@exemplu.com">
      <label for="post">Post dorit</label><input id="post" class="readonly-field" type="text" value="${esc(job.title)}" readonly>
      <div class="form-row">
        <div><label for="nastere">Data nașterii</label><input id="nastere" type="text" inputmode="numeric" autocomplete="bday" placeholder="ZZ.LL.AAAA" maxlength="10" required></div>
        <div><label for="exp">Experiență</label>
          <select id="exp" required><option value="">Alege experiența</option><option>Fără experiență</option><option>Sub 1 an</option><option>1-2 ani</option><option>2-5 ani</option><option>Peste 5 ani</option></select>
        </div>
      </div>
      <details class="cv-more"><summary>Completează profilul <span>opțional · crește șansele de a fi sunat</span></summary><div class="inner">
        <label for="oras">Localitate / județ</label><input id="oras" type="text" placeholder="Ex: Cluj-Napoca, Cluj">
        <label>Permis de conducere</label>
        <div class="chk-row" id="permise">
          <label><input type="checkbox" value="B"> Categoria B</label>
          <label><input type="checkbox" value="C"> Categoria C</label>
          <label><input type="checkbox" value="C+E"> Categoria C+E</label>
          <label><input type="checkbox" value="D"> Categoria D</label>
          <label><input type="checkbox" value="Nu am"> Nu am permis</label>
        </div>
        <label for="ultim-job">Ultimul loc de muncă</label><input id="ultim-job" type="text" placeholder="Ex: Șofer livrări la Firma X, 2 ani">
        <div class="form-row">
          <div><label for="lang-de">Germană</label><select id="lang-de"><option value="">Alege nivelul</option><option>Deloc</option><option>Începător</option><option>Conversațional</option><option>Bine</option><option>Fluent</option></select></div>
          <div><label for="lang-en">Engleză</label><select id="lang-en"><option value="">Alege nivelul</option><option>Deloc</option><option>Începător</option><option>Conversațional</option><option>Bine</option><option>Fluent</option></select></div>
        </div>
        <div class="form-row">
          <div><label for="disponibil">Disponibil de la</label><input id="disponibil" type="date"></div>
          <div><label for="cazare">Ai nevoie de cazare?</label><select id="cazare"><option value="">Alege</option><option>Da</option><option>Nu</option><option>Nu contează</option></select></div>
        </div>
      </div></details>
      <label for="mesaj">Mesaj</label><textarea id="mesaj" placeholder="Scrie câteva detalii despre tine..."></textarea>
      <label class="consent"><input type="checkbox" id="consimtamant" required> Sunt de acord cu prelucrarea datelor mele conform <a href="/legal" target="_blank">Politicii de confidențialitate</a>.</label>
      <button class="btn gold" type="submit" style="width:100%;">Trimite aplicația</button>
      <p class="form-note">Aplicare 100% gratuită. Nu îți cerem comision, taxe sau date bancare.</p>
      <div id="apply-status"></div>
    </form>
  </div>`}</div></section>
  </main>
  ${unavailable ? '' : `
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
  <script src="/config.js"><\/script>
  <script src="/db.js"><\/script>
  <script>
  (function(){
    var COUNTRIES=[["RO","+40","\u{1F1F7}\u{1F1F4}"],["DE","+49","\u{1F1E9}\u{1F1EA}"],["HU","+36","\u{1F1ED}\u{1F1FA}"],["MD","+373","\u{1F1F2}\u{1F1E9}"],["IT","+39","\u{1F1EE}\u{1F1F9}"],["ES","+34","\u{1F1EA}\u{1F1F8}"],["FR","+33","\u{1F1EB}\u{1F1F7}"],["GB","+44","\u{1F1EC}\u{1F1E7}"],["AT","+43","\u{1F1E6}\u{1F1F9}"],["BE","+32","\u{1F1E7}\u{1F1EA}"],["NL","+31","\u{1F1F3}\u{1F1F1}"],["PL","+48","\u{1F1F5}\u{1F1F1}"],["BG","+359","\u{1F1E7}\u{1F1EC}"],["CZ","+420","\u{1F1E8}\u{1F1FF}"],["SK","+421","\u{1F1F8}\u{1F1F0}"],["PT","+351","\u{1F1F5}\u{1F1F9}"],["GR","+30","\u{1F1EC}\u{1F1F7}"],["CH","+41","\u{1F1E8}\u{1F1ED}"],["IE","+353","\u{1F1EE}\u{1F1EA}"],["DK","+45","\u{1F1E9}\u{1F1F0}"],["SE","+46","\u{1F1F8}\u{1F1EA}"],["NO","+47","\u{1F1F3}\u{1F1F4}"],["FI","+358","\u{1F1EB}\u{1F1EE}"],["HR","+385","\u{1F1ED}\u{1F1F7}"],["RS","+381","\u{1F1F7}\u{1F1F8}"],["UA","+380","\u{1F1FA}\u{1F1E6}"]];
    var sel=document.getElementById('phone-prefix');
    if(sel){ COUNTRIES.forEach(function(x){var o=document.createElement('option');o.value=x[1];o.dataset.cc=x[0];o.textContent=x[2]+' '+x[1];sel.appendChild(o);}); sel.value='+40'; }

    function showThanks(nume){
      var pre=String(nume||'').trim().split(' ')[0]||'';
      var el=document.getElementById('wj-thanks');
      if(!el){
        el=document.createElement('div'); el.className='wj-thanks'; el.id='wj-thanks';
        el.innerHTML='<div class="bg"></div><div class="card" role="dialog" aria-modal="true">'
         +'<div class="tick"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></div>'
         +'<h3 id="wj-thanks-title"></h3>'
         +'<p>Aplicația ta a ajuns la angajator.</p>'
         +'<div class="when"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
         +'<div><b>Angajatorul te sună în 48 de ore</b><span>În zilele lucrătoare. Dacă aplici vineri sau în weekend, te sună la începutul săptămânii. Nu plătești nimic.</span></div></div>'
         +'<button type="button" class="btn gold ok">Am înțeles</button></div>';
        document.body.appendChild(el);
        var inchide=function(){el.classList.remove('open');document.body.style.overflow='';};
        el.querySelector('.bg').addEventListener('click',inchide);
        el.querySelector('.ok').addEventListener('click',inchide);
        document.addEventListener('keydown',function(e){if(e.key==='Escape')inchide();});
      }
      document.getElementById('wj-thanks-title').textContent = pre?('Mulțumim, '+pre+'!'):'Mulțumim pentru aplicare!';
      el.classList.add('open'); document.body.style.overflow='hidden';
    }

    // Data nașterii scrisă de mână (ZZ.LL.AAAA), cu punctele puse singure; se trimite ISO.
    function isoNastere(v){
      var d=String(v||'').replace(/[^0-9]/g,''); if(d.length!==8) return '';
      var zi=+d.slice(0,2), luna=+d.slice(2,4), an=+d.slice(4,8);
      if(an<1900||an>2100||luna<1||luna>12||zi<1||zi>31) return '';
      var t=new Date(Date.UTC(an,luna-1,zi)); if(t.getUTCDate()!==zi||t.getUTCMonth()!==luna-1) return '';
      return an+'-'+('0'+luna).slice(-2)+'-'+('0'+zi).slice(-2);
    }
    var nasterEl=document.getElementById('nastere');
    if(nasterEl) nasterEl.addEventListener('input',function(){
      var d=nasterEl.value.replace(/[^0-9]/g,'').slice(0,8); var out=d.slice(0,2);
      if(d.length>2) out+='.'+d.slice(2,4); if(d.length>4) out+='.'+d.slice(4,8);
      if(nasterEl.value!==out) nasterEl.value=out;
    });
    var form=document.getElementById('apply-form');
    if(!form) return;
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var st=document.getElementById('apply-status');
      var btn=form.querySelector('button[type="submit"]');
      var name=document.getElementById('nume').value.trim();
      var local=document.getElementById('telefon').value.trim();
      var prefix=sel?sel.value:'';
      var cc=sel?(sel.options[sel.selectedIndex].dataset.cc||''):'';
      var email=document.getElementById('email').value.trim();
      var exp=document.getElementById('exp').value.trim();
      var message=document.getElementById('mesaj').value.trim();
      var nastereScris=(document.getElementById('nastere')||{}).value||'';
      var nastere=isoNastere(nastereScris);
      if(nastereScris&&!nastere){ st.className='form-err'; st.textContent='Scrie data nașterii ca ZZ.LL.AAAA (de exemplu 04.09.2005).'; return; }
      var oras=((document.getElementById('oras')||{}).value||'').trim();
      var ultimJob=((document.getElementById('ultim-job')||{}).value||'').trim();
      var langDe=(document.getElementById('lang-de')||{}).value||'';
      var langEn=(document.getElementById('lang-en')||{}).value||'';
      var disponibil=(document.getElementById('disponibil')||{}).value||'';
      var cazare=(document.getElementById('cazare')||{}).value||'';
      var permise=Array.prototype.slice.call(document.querySelectorAll('#permise input:checked')).map(function(x){return x.value;}).join(', ');
      var vst=(function(d){if(!d)return 0;var b=new Date(d),t=new Date(),a=t.getFullYear()-b.getFullYear(),m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return a;})(nastere);
      var consent=document.getElementById('consimtamant').checked;
      if(!name||!local||!email||!exp||!nastere){ st.className='form-err'; st.textContent='Completează toate câmpurile obligatorii.'; return; }
      if(vst<18){ st.className='form-err'; st.textContent='Trebuie să ai cel puțin 18 ani ca să aplici.'; return; }
      if(vst>75){ st.className='form-err'; st.textContent='Verifică data nașterii — pare greșită.'; return; }
      if(!consent){ st.className='form-err'; st.textContent='Bifează acordul pentru prelucrarea datelor.'; return; }
      var d=local.replace(/[^0-9]/g,''); var pd=prefix.replace(/[^0-9]/g,'');
      if(pd){ if(d.indexOf('00'+pd)===0) d=d.slice(2+pd.length); else if(d.indexOf(pd)===0 && d.length>pd.length+5) d=d.slice(pd.length); }
      var phone=prefix+d.replace(/^0+/,'');
      btn.disabled=true; var ob=btn.textContent; btn.textContent='Se trimite...';
      try{
        await WeJobs.submitApplication({
          name:name, phone:phone, email:email,
          job_title:${JSON.stringify(job.title)}, job_id:${JSON.stringify(job.id)},
          experience:exp, message:message,
          source:'Pagina jobului', country:cc,
          birth_date:nastere||null, city:oras||null, licenses:permise||null,
          last_job:ultimJob||null, lang_de:langDe||null, lang_en:langEn||null,
          available_from:disponibil||null, needs_housing:cazare||null
        });
        try{ await fetch('/api/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,job:${JSON.stringify(job.title)},phone:phone})}); }catch(_){}
        form.reset(); if(sel) sel.value='+40';
        st.className='form-ok'; st.textContent='\u2713 Aplicația a ajuns la angajator. Te sună în maximum 48 de ore lucrătoare.';
        showThanks(name);
      }catch(err){
        st.className='form-err'; st.textContent='Nu am putut trimite aplicația. Încearcă din nou sau scrie-ne la support@wejobs.ro.';
      }finally{ btn.disabled=false; btn.textContent=ob; }
    });
  })();
  <\/script>`}`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.end(head(title, desc, canonical, image, JSON.stringify(jp)) + body + footer(jobLinks));
};
