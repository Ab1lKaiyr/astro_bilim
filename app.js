{
const S = window.SITE, L = window.LAB, app = document.getElementById('app');
{ let r = 11, d = ''; const rnd = () => (r = r * 16807 % 2147483647) / 2147483647; for (let i = 0; i < 90; i++) { const x = (rnd() * 640).toFixed(1), y = (rnd() * 320).toFixed(1), s = (0.4 + rnd() * rnd() * 1.4).toFixed(2), o = (0.35 + rnd() * 0.6).toFixed(2); d += `<circle cx='${x}' cy='${y}' r='${s}' fill='%23eaf4f7' fill-opacity='${o}'/>`; } document.documentElement.style.setProperty('--stars', `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='320'>${d}</svg>")`); }
const byN = n => S.lessons.find(l => l.n === n);
const modOf = l => S.modules.find(m => m.id === l.mod);
const num = L.num;

/* ---------- сақтау ---------- */
const KEY = 'astro_bilim_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } };

/* ---------- мәзір ---------- */
const NAV = [
  { t: 'Басты бет', h: 'home' },
  { t: 'Бағдарлама', items: [['Бағдарлама туралы', 'about'], ['Күнтізбелік-тақырыптық жоспар', 'plan'], ['Бағалау жүйесі', 'assess'], ['Әдістер, рефлексия, сергіту', 'methods'], ['Пайдаланылған әдебиеттер', 'refs']] },
  { t: 'Сабақтар', items: [['Барлық сабақтар', 'lessons']].concat(...S.modules.map(m => [['§' + m.n, null]].concat(m.lessons.map(n => { const l = byN(n); return [l.code + '. ' + l.title, 'lesson-' + n]; })))) },
  { t: 'Цифрлық зертхана', items: [['Барлық модельдер', 'lab']].concat(L.MODELS.map(m => [m.t, 'lab-' + m.id]), [['§Құралдар', null], ['Telegram-бот', 'bot'], ['ЖИ және комикстер', 'comics']]) },
  { t: 'Оқушыға', items: [['Ойындар мен тесттер', 'games'], ['Менің нәтижелерім', 'results'], ['Глоссарий', 'glossary']] }
];
const nav = document.getElementById('nav');
nav.innerHTML = NAV.map((g, i) => g.h ? `<div class="dd" data-g="${i}"><a href="#${g.h}">${g.t}</a></div>` :
  `<div class="dd" data-g="${i}"><button type="button" aria-expanded="false">${g.t}</button><div class="menu">${g.items.map(([t, h]) => h ? `<a href="#${h}">${t}</a>` : `<div class="grp">${t.slice(1)}</div>`).join('')}</div></div>`).join('');
const closeAll = () => nav.querySelectorAll('.dd.open').forEach(d => { d.classList.remove('open'); d.querySelector('button')?.setAttribute('aria-expanded', 'false'); });
nav.querySelectorAll('.dd>button').forEach(b => b.onclick = e => { e.stopPropagation(); const d = b.parentElement, o = d.classList.contains('open'); closeAll(); if (!o) { d.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } });
document.addEventListener('click', e => { if (!nav.contains(e.target)) closeAll(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); lb.classList.remove('show'); } });
const burger = document.getElementById('burger');
burger.onclick = () => { const s = nav.classList.toggle('show'); burger.setAttribute('aria-expanded', s); };
const groupOf = r => r === 'home' ? 0 : /^(about|plan|assess|methods|refs)$/.test(r) ? 1 : /^lesson/.test(r) ? 2 : /^(lab|bot|comics)/.test(r) ? 3 : 4;

/* ---------- көмекшілер ---------- */
const banner = (title, lead = '', crumb = '') => `<section class="banner"><div class="wrap">${crumb ? `<div class="crumb">${crumb}</div>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;
const ticks = a => `<ul class="ticks">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const kindOf = u => /youtu/.test(u) ? ['vid', 'Бейне'] : /wordwall|educaplay|wayground/.test(u) ? ['game', 'Ойын'] : /chatgpt|gamma/.test(u) ? ['ai', 'ЖИ'] : /^#/.test(u) ? ['sim', 'Модель'] : ['sim', 'Симуляция'];
const res = (t, u, sub) => { const [k, w] = kindOf(u); return `<a href="${u}"${u[0] === '#' ? '' : ' target="_blank" rel="noopener"'}><i class="k-${k}">${k === 'vid' ? '▶' : k === 'game' ? 'Ой' : k === 'ai' ? 'ЖИ' : '◎'}</i><span>${t}<small>${sub || w}</small></span></a>`; };

/* ---------- жылжымалы жұлдыз картасы (ЖАЖК) ---------- */
function planisphere() {
  const st = {
    dubhe: [11.062, 61.75, 1.8], merak: [11.031, 56.38, 2.4], phecda: [11.897, 53.69, 2.4], megrez: [12.257, 57.03, 3.3], alioth: [12.900, 55.96, 1.8], mizar: [13.399, 54.93, 2.2], alkaid: [13.792, 49.31, 1.9],
    polaris: [2.53, 89.26, 2.0], yildun: [17.537, 86.59, 4.4], epsU: [16.766, 82.04, 4.2], zetU: [15.734, 77.79, 4.3], etaU: [16.292, 75.76, 4.9], kochab: [14.845, 74.16, 2.1], pherkad: [15.345, 71.83, 3.0],
    caph: [0.153, 59.15, 2.3], schedar: [0.675, 56.54, 2.2], gamC: [0.945, 60.72, 2.4], ruchbah: [1.430, 60.24, 2.7], segin: [1.907, 63.67, 3.4],
    deneb: [20.690, 45.28, 1.3], sadr: [20.370, 40.26, 2.2], gienah: [20.770, 33.97, 2.5], delC: [19.750, 45.13, 2.9], albireo: [19.512, 27.96, 3.1],
    vega: [18.616, 38.78, 0.0], zetL: [18.746, 37.61, 4.3], sheliak: [18.835, 33.36, 3.5], sulafat: [18.982, 32.69, 3.3], delL: [18.908, 36.90, 4.3],
    altair: [19.846, 8.87, 0.8], tarazed: [19.771, 10.61, 2.7], alshain: [19.922, 6.41, 3.7],
    betel: [5.919, 7.41, 0.5], rigel: [5.242, -8.20, 0.1], bellatrix: [5.419, 6.35, 1.6], mintaka: [5.533, -0.30, 2.2], alnilam: [5.604, -1.20, 1.7], alnitak: [5.679, -1.94, 1.8], saiph: [5.796, -9.67, 2.1],
    sirius: [6.752, -16.72, -1.4], aldebaran: [4.599, 16.51, 0.9], capella: [5.278, 46.0, 0.1], menk: [5.992, 44.95, 1.9], thetaA: [5.995, 37.21, 2.6], alnath: [5.438, 28.61, 1.7], hass: [4.950, 33.17, 2.7],
    castor: [7.577, 31.89, 1.6], pollux: [7.755, 28.03, 1.1], procyon: [7.655, 5.22, 0.4],
    regulus: [10.140, 11.97, 1.4], algieba: [10.333, 19.84, 2.0], zosma: [11.235, 20.52, 2.6], denebola: [11.818, 14.57, 2.1], chertan: [11.237, 15.43, 3.3],
    arcturus: [14.261, 19.18, 0.0], spica: [13.420, -11.16, 1.0], antares: [16.490, -26.43, 1.0],
    markab: [23.079, 15.21, 2.5], scheat: [23.063, 28.08, 2.4], algenib: [0.220, 15.18, 2.8], alpheratz: [0.140, 29.09, 2.1], mirach: [1.162, 35.62, 2.1], almach: [2.065, 42.33, 2.1],
    mirfak: [3.405, 49.86, 1.8], algol: [3.136, 40.96, 2.1]
  };
  const lines = 'dubhe-merak merak-phecda phecda-megrez megrez-dubhe megrez-alioth alioth-mizar mizar-alkaid polaris-yildun yildun-epsU epsU-zetU zetU-kochab kochab-pherkad pherkad-etaU etaU-zetU caph-schedar schedar-gamC gamC-ruchbah ruchbah-segin deneb-sadr sadr-albireo delC-sadr sadr-gienah vega-zetL zetL-sheliak sheliak-sulafat sulafat-delL delL-zetL tarazed-altair altair-alshain betel-bellatrix betel-alnitak bellatrix-mintaka mintaka-alnilam alnilam-alnitak alnitak-saiph mintaka-rigel capella-menk menk-thetaA thetaA-alnath alnath-hass hass-capella castor-pollux regulus-algieba algieba-zosma zosma-denebola denebola-chertan chertan-regulus markab-scheat scheat-alpheratz alpheratz-algenib algenib-markab alpheratz-mirach mirach-almach mirfak-algol'.split(' ').map(s => s.split('-'));
  const names = [['polaris', 'Темірқазық', 0, -12], ['megrez', 'Жетіқарақшы', 0, -14], ['sirius', 'Сүмбіле', 0, 22], ['vega', 'Вега', 12, 4], ['capella', 'Капелла', 12, 4], ['arcturus', 'Арктур', 12, 4], ['schedar', 'Кассиопея', 0, 22], ['deneb', 'Аққу', 12, -6], ['altair', 'Альтаир', 12, 4], ['aldebaran', 'Альдебаран', 12, 4]];
  const cx = 400, cy = 400, R = 330, k = R / 135, phi = 50.28 * Math.PI / 180;
  const P = (ra, de) => { const a = ra * 15 * Math.PI / 180, r = k * (90 - de); return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  const f = v => v.toFixed(1);
  let g = '';
  [60, 30, 0, -30].forEach(d => g += `<circle cx="${cx}" cy="${cy}" r="${f(k * (90 - d))}" fill="none" stroke="#38c3e2" stroke-opacity="${d === 0 ? .35 : .14}" ${d === 0 ? '' : 'stroke-dasharray="3 6"'}/>`);
  for (let h = 0; h < 24; h += 2) { const [x, y] = P(h, -45); g += `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}" stroke="#38c3e2" stroke-opacity=".1"/>`; }
  let ec = ''; for (let i = 0; i <= 72; i++) { const Lm = i * 5 * Math.PI / 180, e = 23.44 * Math.PI / 180; const ra = Math.atan2(Math.sin(Lm) * Math.cos(e), Math.cos(Lm)) * 12 / Math.PI, de = Math.asin(Math.sin(e) * Math.sin(Lm)) * 180 / Math.PI; const [x, y] = P((ra + 24) % 24, de); ec += (i ? 'L' : 'M') + f(x) + ' ' + f(y); }
  g += `<path d="${ec}" fill="none" stroke="#f4c84a" stroke-opacity=".55" stroke-dasharray="6 5"/>`;
  lines.forEach(([a, b]) => { const [x1, y1] = P(st[a][0], st[a][1]), [x2, y2] = P(st[b][0], st[b][1]); g += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#7ad9ee" stroke-opacity=".55" stroke-width="1.2"/>`; });
  Object.values(st).forEach(([ra, de, m]) => { const [x, y] = P(ra, de); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(1.3, 4.6 - m * 0.95))}" fill="${m < 0.6 ? '#fff6d8' : '#eaf4f7'}"/>`; });
  [[3.79, 24.1], [3.75, 24.4], [3.82, 23.9], [3.77, 23.6], [3.71, 24.2], [3.80, 24.6]].forEach(([ra, de]) => { const [x, y] = P(ra, de); g += `<circle cx="${f(x)}" cy="${f(y)}" r="1.4" fill="#dff"/>`; });
  const [ux, uy] = P(3.79, 24.1); g += `<text x="${f(ux)}" y="${f(uy - 10)}" text-anchor="middle" font-size="15" fill="#cfe3ea">Үркер</text>`;
  names.forEach(([id, t, dx, dy]) => { const [x, y] = P(st[id][0], st[id][1]); g += `<text x="${f(x + dx)}" y="${f(y + dy)}" text-anchor="${dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle'}" font-size="15" fill="#cfe3ea">${t}</text>`; });
  let ring = `<circle cx="${cx}" cy="${cy}" r="${R + 42}" fill="#0e3345"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#skyg)"/>`;
  for (let h = 0; h < 24; h++) { const a = h * 15 * Math.PI / 180, r1 = R + 3, r2 = R + 12, x = cx + (R + 27) * Math.sin(a), y = cy - (R + 27) * Math.cos(a); ring += `<line x1="${f(cx + r1 * Math.sin(a))}" y1="${f(cy - r1 * Math.cos(a))}" x2="${f(cx + r2 * Math.sin(a))}" y2="${f(cy - r2 * Math.cos(a))}" stroke="#7ad9ee"/><text x="${f(x)}" y="${f(y + 5)}" text-anchor="middle" font-size="15" fill="#a3bfca">${h}ʰ</text>`; }
  let hz = ''; for (let i = 0; i <= 120; i++) { const A = i * 3 * Math.PI / 180; const de = Math.asin(Math.cos(phi) * Math.cos(A)) * 180 / Math.PI; const H = Math.atan2(-Math.sin(A), -Math.sin(phi) * Math.cos(A)); const al = Math.PI - H, r = k * (90 - de); hz += (i ? 'L' : 'M') + f(cx + r * Math.sin(al)) + ' ' + f(cy - r * Math.cos(al)); }
  const cover = `<path d="M${cx - R - 1} ${cy}a${R + 1} ${R + 1} 0 1 0 ${2 * R + 2} 0a${R + 1} ${R + 1} 0 1 0 ${-2 * R - 2} 0Z${hz}Z" fill="#0b2a38" fill-opacity=".86" fill-rule="evenodd"/><path d="${hz}Z" fill="none" stroke="#38c3e2" stroke-width="2"/>`;
  const comp = [['Солтүстік', 0, 0.5], ['Оңтүстік', 180, 1], ['Шығыс', 90, 1], ['Батыс', 270, 1]].map(([t, A]) => { const Ar = A * Math.PI / 180, de = Math.asin(Math.cos(phi) * Math.cos(Ar)) * 180 / Math.PI, H = Math.atan2(-Math.sin(Ar), -Math.sin(phi) * Math.cos(Ar)), al = Math.PI - H, r = k * (90 - de) + (A === 0 ? -20 : 22); return `<text x="${f(cx + r * Math.sin(al))}" y="${f(cy - r * Math.cos(al) + 5)}" text-anchor="middle" font-size="16" font-weight="600" fill="#7ad9ee" paint-order="stroke" stroke="#0b2a38" stroke-width="5">${t}</text>`; }).join('');
  return `<svg viewBox="0 0 800 800" role="img" aria-label="Жұлдызды аспанның жылжымалы картасы: Ақтөбе ендігі үшін көкжиек терезесі, шоқжұлдыздар баяу айналады"><defs><radialGradient id="skyg"><stop offset="0" stop-color="#0d3a4f"/><stop offset="1" stop-color="#051720"/></radialGradient></defs>
  <g class="spin" font-family="Golos Text, sans-serif">${ring}${g}</g>${cover}${comp}</svg>`;
}

/* ---------- беттер ---------- */
const P = {};
P.home = () => `
<section class="hero"><div class="wrap">
  <div>
    <h1>Астрономия негіздерін оқытудағы жаңа әдістер</h1>
    <p class="lead">Комикс, Telegram-бот және жасанды интеллект мүмкіндіктері. 9-сынып оқушыларына арналған авторлық бағдарламаның цифрлық платформасы: 17 сабақ, интерактивті модельдер, ойындар мен тесттер.</p>
    <div class="btns"><a class="btn" href="#lessons">Сабақтарға өту</a><a class="btn ghost" href="#lab">Цифрлық зертхана</a></div>
    <div class="who">Құрастырушы автор: <b>Сулейманов Бегдулла Жалгасбайулы</b>, «Ақбөбек лицейі» физика пәні мұғалімі, Ақтөбе қаласы. Аптасына 1 сағат, жылына 34 сағат.</div>
  </div>
  <figure class="sky" style="margin:0">${planisphere()}<figcaption>Жұлдызды аспанның жылжымалы картасы, Ақтөбе ендігі (φ ≈ 50°)</figcaption></figure>
</div></section>
<section class="band"><div class="wrap intro">
  <div><h2>Құрметті әріптестер мен оқушылар!</h2>
  <p>Astro_bilim – «Астрономия негіздерін оқытудағы жаңа әдістер: комикс, телеграм-бот және жасанды интеллект мүмкіндіктері» авторлық бағдарламасының сайты. Бағдарлама астрономия заңдарын Python тіліндегі модельдер, Telegram-бот, ЖИ элементтері және комикс арқылы көрнекі әрі ойын түрінде түсіндіруге арналған.</p>
  <p>Платформада:</p>
  ${ticks(['17 сабақтың мақсаты, барысы, тапсырмалары және үй жұмысы', 'ЖИ көмегімен жасалған астрономиялық комикстер', 'Telegram-боттың интерактивті демо-нұсқасы және Python коды', 'Кеплер, тартылыс, параллакс, уақыт есептеріне арналған 9 интерактивті модель', 'Wordwall, Educaplay, Wayground ойындары және әр сабаққа өзін-өзі тексеру тесті', 'Функционалдық сауаттылық және ЕБҚ тапсырмалары, бағалау критерийлері'])}
  </div>
  <div class="card"><h3>Бағдарлама кімге арналған</h3><p>9-сынып оқушыларына – сабақта алған білімін толықтыру, тереңдету және астрономиядан теориялық, практикалық дайындық үшін.</p><p>Физика пәні мұғалімдеріне – заманауи цифрлық технологияларды (ЖИ, Telegram-бот, комикс пен анимация) оқу процесіне енгізуге арналған әдістемелік құрал ретінде.</p><p class="small muted" style="margin:0">«Ақбөбек лицейі» педагогикалық кеңесінің шешімімен ұсынылды (2025 ж. 29 тамыз, №1 хаттама).</p></div>
</div></section>
<section class="band alt"><div class="wrap"><h2>Бөлімдер</h2><div class="grid g4" style="margin-top:16px">
  <a class="tile" href="#lessons"><div class="pic"><img src="img/comic-l03.jpg" alt="Ньютон заңдары туралы комикс"></div><div class="t"><b>Сабақтар</b><span>Кіріспе және үш модуль, 34 сағат</span></div></a>
  <a class="tile" href="#lab"><div class="pic"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="42" ry="26" fill="none" stroke="#7ad9ee" stroke-width="1.5"/><circle cx="62" cy="50" r="7" fill="#f4c84a"/><path d="M62 50L84 33L92 50Z" fill="#38c3e2" opacity=".35"/><path d="M62 50L20 70L12 52Z" fill="#38c3e2" opacity=".35"/><circle cx="84" cy="33" r="3.5" fill="#38c3e2"/></svg></div><div class="t"><b>Цифрлық зертхана</b><span>Python-модельдер, интерактивті симуляциялар</span></div></a>
  <a class="tile" href="#bot"><div class="pic"><img src="img/l01-cover.jpg" alt="Астрономия ботының мұқабасы"></div><div class="t"><b>Telegram-бот</b><span>Демо-нұсқа, мүмкіндіктер, код</span></div></a>
  <a class="tile" href="#comics"><div class="pic"><img src="img/comic-l14.jpg" alt="Параллакс туралы комикс"></div><div class="t"><b>ЖИ және комикстер</b><span>Галерея және комикс жасау жолы</span></div></a>
</div></div></section>
<section class="band"><div class="wrap"><h2>Бағдарлама құрылымы</h2><p class="muted">Әр сабақ 2 сағат: 1 сағат теория, 1 сағат практика.</p>
  <div class="mods">${S.modules.map(m => `<a href="#lesson-${m.lessons[0]}"><div class="h">${m.hours}<small>сағат</small></div><div class="small muted" style="margin-top:10px">${m.n}</div><b>${m.name}</b></a>`).join('')}</div>
</div></section>`;

P.about = () => banner('Бағдарлама туралы', 'Түсінік хат, мақсаты мен міндеттері, жүзеге асыру формалары және күтілетін нәтиже.', '<a href="#home">Басты бет</a> / Бағдарлама') + `
<section class="band"><div class="wrap intro">
<div>
<h2>Өзектілігі</h2><p>Жас ұрпақтың білімге қызығушылығын арттыру үшін дәстүрлі оқытуды инновациялық әдістермен ұштастыру қажет. Астрономия сияқты күрделі ғылымды түсіндіру үшін Python тілінде математикалық модельдер құру, Telegram-бот арқылы жедел ақпарат беру, жасанды интеллект арқылы оқу процесін дараландыру және комикс арқылы ғылыми ұғымдарды көрнекі, ойын түрінде жеткізу оқушылардың танымдық белсенділігін арттырады.</p>
<p>Бағдарлама оқу жоспарының вариативті бөлігінің элективті курсы ретінде ҚР «Білім туралы» Заңына сәйкес әзірленді. Жүктеме – аптасына 1 сағат, жылына 34 сағат. Бүгін STEM бағытында оқыту, оқушыларда зерттеу дағдыларын қалыптастыру – білім сапасын арттырудың стратегиялық маңызды бағыты.</p>
<h2>Мақсаты</h2><p>Астрономияның негізгі заңдарын (Кеплер заңдары, Ньютонның бүкіләлемдік тартылыс заңы, ғаламшарлардың қозғалысы және т.б.) заманауи цифрлық технологиялар – Python, Telegram-бот, жасанды интеллект элементтері және комикс арқылы оқушыларға қолжетімді, қызықты әрі интерактивті түрде түсіндіру.</p>
<h2>Міндеттері</h2>${ticks(['Астрономия заңдарын Python бағдарламалау тілінде модельдеу', 'Telegram-бот арқылы астрономиядан викториналар, есептер, фактілер ұсыну', 'Жасанды интеллект элементтері (чат-бот, мәтін генерациясы, сурет салу) арқылы оқу процесін дараландыру', 'Астрономиялық тақырыптарды жеңіл әрі қызықты түсіндіретін цифрлық комикстер жасау', 'Ғылым мен цифрлық технологияны ұштастырып, оқушылардың шығармашылық қабілетін дамыту'])}
</div>
<div><div class="card"><h3>Пікір берушілер</h3><p><b>Бекешев А.З.</b> – Қ. Жұбанов атындағы Ақтөбе өңірлік университеті физика кафедрасының доценті, физика-математика ғылымдарының кандидаты, профессор.</p><p><b>Кадирова З.</b> – Өскемен қаласы білім бөлімінің «№47 жалпы білім беретін мектебі» физика пәні мұғалімі, педагог-шебер.</p><h3 style="margin-top:18px">Құрастырушы автор</h3><p style="margin:0"><b>Сулейманов Бегдулла Жалгасбайулы</b> – «Ақбөбек лицейі» физика пәні мұғалімі, Ақтөбе қаласы.</p></div>
<div class="card" style="margin-top:16px"><h3>Ғылыми-әдістемелік деңгейі</h3><p>Бағдарлама жаңартылған білім мазмұны талаптарына сай, типтік оқу бағдарламасының мақсаттары мен міндеттеріне сүйеніп құрастырылды.</p><p><b>Ерекшелігі</b> – астрономия негіздерін оқытуда ЖИ, комикс, Telegram-бот және анимация элементтерін кіріктіру арқылы танымдық белсенділікті арттыру.</p><p style="margin:0"><b>Жаңашылдығы</b> – дәстүрлі түсініктерді сақтай отырып, оларды жаңа әдістермен, заманауи цифрлық құралдар көмегімен оқушыға қолжетімді форматта ұсыну.</p></div></div>
</div></section>
<section class="band alt"><div class="wrap"><h2>Жүзеге асыру формалары</h2><div class="grid g4" style="margin-top:14px">
${[['Дәріс-сабақтар', 'Астрономия заңдарын (Кеплер, Ньютон) түсіндіру; Python-да модельдеу принциптері.'], ['Практикалық сабақтар', 'Python арқылы орбита қозғалысын, тартылыс күшін модельдеу; анимация мен графиктер.'], ['Telegram-ботпен жұмыс', 'Викторина, Ай фазалары, ғарыш жаңалықтары, чат-ботпен интерактивті әңгіме.'], ['ЖИ элементтері', 'Ғаламшарлар мен комикс кейіпкерлерінің суреттері, деңгейлік жеке тапсырмалар, тілдік модельдерден анықтама.'], ['Комикс және мультимедиа', 'Астрономия заңдарын комикс пен инфографика арқылы бейнелеу.'], ['Жобалық жұмыс', 'Шағын зерттеу жобаларын, Python-модельдерді, бот прототипін қорғау.'], ['Онлайн-платформа', 'Google Colab, Jupyter Notebook; Telegram арқылы тапсырмаларды қадағалау.'], ['Шығармашылық байқаулар', '«Астрономия комиксі», «Ең үздік Telegram-бот», «Python моделіндегі ғаламшар қозғалысы».']].map(([t, d]) => `<div class="card"><h3>${t}</h3><p class="small" style="margin:0">${d}</p></div>`).join('')}
</div></div></section>
<section class="band"><div class="wrap intro"><div><h2>Күтілетін нәтиже</h2>${ticks(['Оқушылар астрономия заңдарын теория жүзінде ғана емес, Python бағдарламасы арқылы тәжірибеде меңгереді', 'Telegram-бот астрономия бойынша қолжетімді цифрлық көмекшіге айналады', 'Жасанды интеллект элементтері оқушының жеке деңгейіне бейімделген тапсырмалар ұсынады', 'Комикстер мен анимациялар ғылымды жеңіл әрі қызықты қабылдауға көмектеседі', 'Цифрлық білім беру ортасы қалыптасып, оқушылардың ғылыми дүниетанымы кеңейеді'])}</div>
<div><h2>Қорытынды</h2><p>Бағдарлама оқушылардың білімін тереңдетіп қана қоймай, заманауи технологияларды меңгеру қабілетін арттырады, ғылыми дүниетанымын кеңейтеді және астрономияға деген қызығушылығын күшейтеді. Оның мазмұны оқу-тәрбие процесін жетілдіруге және оқушылардың жан-жақты дамуына ықпал етеді.</p><div class="btns"><a class="btn" href="#plan">Тақырыптық жоспар</a><a class="btn ghost" href="#assess">Бағалау жүйесі</a></div></div></div></section>`;

P.plan = () => banner('Күнтізбелік-тақырыптық жоспар', 'Аптасына 1 сағат, барлығы 34 сағат: 17 сағат теория, 17 сағат практика.', '<a href="#about">Бағдарлама</a> / Жоспар') + `
<section class="band"><div class="wrap"><div class="scroll"><table class="stack"><thead><tr><th class="n">№</th><th>Тақырып</th><th class="n">Сағат</th><th class="n">Теория</th><th class="n">Практика</th></tr></thead><tbody>
${S.modules.map(m => `<tr class="mod"><td colspan="5">${m.n}. ${m.name} (${m.hours} сағ) – ${m.part}</td></tr>` + m.lessons.map(n => { const l = byN(n); return `<tr><td class="n" data-l="№">${n}${l.code.includes('.') ? ' (' + l.code + ')' : ''}</td><td data-l="Тақырып"><a href="#lesson-${n}">${l.title}</a></td><td class="n" data-l="Сағат">2</td><td class="n" data-l="Теория">1</td><td class="n" data-l="Практика">1</td></tr>`; }).join('')).join('')}
</tbody><tfoot><tr><td></td><td>Барлығы</td><td class="n">34</td><td class="n">17</td><td class="n">17</td></tr></tfoot></table></div></div></section>`;

P.assess = () => banner('Бағалау жүйесі', 'Бағалау формалары, критерийлер және жоба қорғау шкаласы.', '<a href="#about">Бағдарлама</a> / Бағалау') + `
<section class="band"><div class="wrap"><h2>Бағалау формалары</h2><div class="scroll"><table class="stack"><thead><tr><th>Форма</th><th>Құралдар</th><th>Критерий</th></tr></thead><tbody>
${[['Тест, викторина', 'Wordwall, Quizizz (Wayground), Educaplay, QR-код арқылы жедел тест', 'Дұрыс жауап пайызы: ≥ 70% – жақсы деңгей'], ['Практикалық жұмыс', 'Python-модель, код, ЖИ құралы', 'Дұрыстығы, нәтижесі, түсіндіруі'], ['Жоба қорғау', 'Бот, комикс, ЖИ – топтық жұмыс', 'Мазмұн, құралды қолдану, қорғау сапасы'], ['Шығармашылық жұмыс', 'Комикс, постер: Canva, Pixton, қолмен салу', 'Креатив, мазмұн, эстетика'], ['Өзін-өзі және топтық бағалау', '«Екі жұлдыз, бір тілек», Padlet', 'Әділдік, рефлексия сапасы'], ['Э-портфолио', 'Google Sites, Notion, Padlet', 'Толықтық, құрылым, шығармашылық']].map(r => `<tr><td data-l="Форма"><b>${r[0]}</b></td><td data-l="Құралдар">${r[1]}</td><td data-l="Критерий">${r[2]}</td></tr>`).join('')}
</tbody></table></div></div></section>
<section class="band alt"><div class="wrap intro"><div><h2>Шығармашылық жобаны қорғау: 40 балл</h2>${critTable()}</div>
<div class="card"><h3>Сабақтағы бағалау</h3><p>Әр тапсырманың дискрипторы бар және 1–5 балмен бағаланады (мысалы, ЖИ тапсырмасы – 2 балл, бот жасау – 5 балл).</p><p>Сабақ соңында оқушы жұмыс парағында өзін-өзі бағалайды, кері байланыс стикерін қалдырады. Мұғалім мақтау-мадақтау арқылы ынталандырады.</p><p style="margin:0">Сайттағы әр сабақтың «Өзіңді тексер» тесті нәтижесі <a href="#results">Менің нәтижелерім</a> бетінде жиналады.</p></div></div></section>`;
const critTable = () => `<div class="scroll"><table><thead><tr><th>Критерий</th><th>Сипаттамасы</th><th class="n">Балл</th></tr></thead><tbody>${S.criteria.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="n">${c[2]}</td></tr>`).join('')}</tbody><tfoot><tr><td>Барлығы</td><td></td><td class="n">40</td></tr></tfoot></table></div>`;

P.methods = () => banner('Әдістер, рефлексия және сергіту', 'Сабақтарда қолданылатын бағалау, рефлексия әдістері, нейрожаттығулар және «Адал азамат» құндылықтары.', '<a href="#about">Бағдарлама</a> / Әдістер') + `
<section class="band"><div class="wrap"><h2>Бағалау әдістері</h2><div class="grid g3" style="margin-top:14px">
${[['«Смайлик» әдісі', 'Сабақ басында оқушылар көңіл күйін смайликпен білдіреді; жағымды ахуал орнатылады.'], ['Дискриптор және балл', 'Әр тапсырманың орындалу белгілері алдын ала айтылады, 1–5 балл қойылады.'], ['«Екі жұлдыз, бір тілек»', 'Екі жетістік және бір жетілдіретін тұс аталады – өзін-өзі және өзара бағалау.'], ['«2+1» кері байланыс', 'Жоба қорғауда әр топқа екі артықшылық және бір ұсыныс айтылады.'], ['Жедел тест', 'Wordwall, Educaplay, Wayground, QR-код арқылы; 70% және одан жоғары – жақсы деңгей.'], ['Кері байланыс стикерлері', 'Сабақ соңында оқушы стикерге сабақ туралы бір ой жазып, тақтаға жапсырады.']].map(([t, d]) => `<div class="card"><h3>${t}</h3><p class="small" style="margin:0">${d}</p></div>`).join('')}
</div></div></section>
<section class="band alt"><div class="wrap"><h2>Рефлексия</h2><div class="grid g3" style="margin-top:14px">
<div class="card"><h3>Поэтикалық рефлексия</h3><p style="margin:0">«Күш әсерін қостым бүгін,<br>Үдеуім де табылды.<br>Ньютон заңын жаттап алдым,<br>Қозғалысым анықталды!»</p></div>
<div class="card"><h3>«Жұлдыздар тілімен»</h3><p style="margin:0">Мен – Зенит, төбемде биіктеп тұрмын. Мен – Надир, аяғымның астында жатырмын. Мен – Темірқазық, жол көрсетуші нұсқаушымын. Ал мен – оқушымын, енді аспанды ғылыми тұрғыда да, халық даналығымен де түсіне аламын!</p></div>
<div class="card"><h3>«Үш заң – үш ой»</h3><p>Оқушы үш ұғым жазып, әрқайсысына өз ойын қосады.</p><img class="comic" src="img/reflect-3laws.jpg" alt="«Үш заң – үш ой» рефлексия парағы" data-zoom></div>
</div></div></section>
<section class="band"><div class="wrap intro"><div><h2>Сергіту: нейрожаттығулар (3 минут)</h2>
<div class="task"><h3>«Оң қол, сол қол»</h3><p style="margin:0">Оң қолмен сол құлақтың ұшын, сол қолмен мұрынның ұшын ұстаңдар. Алақанды бір рет соғып, қолдардың орнын ауыстырыңдар. 8–10 рет қайталап, қарқынды біртіндеп арттырыңдар.</p></div>
<div class="task"><h3>«Жұдырық – қыр – алақан»</h3><p style="margin:0">Қолды үстелге кезекпен жұдырық, алақанның қыры, алақан күйінде қойыңдар. Алдымен оң қолмен, сосын сол қолмен, соңында екі қолмен бірге орындаңдар.</p></div>
<div class="task"><h3>«Жатқан сегіздік»</h3><p style="margin:0">Қолды алға созып, ауада жатқан сегіздік (∞) сызыңдар, көзбен саусақтың ұшын қадағалаңдар. Оң қол, сол қол, екі қол бірге – әрқайсысы 3 рет.</p></div>
<p class="small muted">Бағдарламада «Оң қол, сол қол» жаттығуы қолданылады; сипаттамасы – оның кең таралған нұсқасы.</p></div>
<div><h2>«Адал азамат» құндылықтары</h2><p>Оқыту процесінде ұйымдастыру кезеңінен бастап, әр сабақтың барлық кезеңінде құндылықтарға баулу жүргізіледі.</p>
${ticks(['<b>Ынтымақ және бірлік</b> – командамен тапсырма орындап, бірлескен жұмыс нәтижесін қорғау', '<b>Жасампаздық және жаңашылдық</b> – қарапайым өлшеулер жүргізу, практикалық есептерді шешуге арналған құралдармен жұмыс', '<b>Білім</b> – жаратылыстану салаларындағы тәжірибені бақылау, жүйелеу, түсіну дағдылары', '<b>Еңбекқорлық және кәсіби біліктілік</b> – түрлі мамандықтарға қызығушылық, өзіне-өзі қызмет көрсетуге үйрену'])}</div></div></section>`;

P.refs = () => banner('Пайдаланылған әдебиеттер', '', '<a href="#about">Бағдарлама</a> / Әдебиеттер') + `<section class="band"><div class="wrap"><ol style="max-width:860px;line-height:1.7">${S.refs.map(r => `<li style="margin:6px 0">${r}</li>`).join('')}</ol></div></section>`;

P.lessons = () => banner('Сабақтар', 'Кіріспе және үш модуль. Әр сабақтың мақсаты, барысы, ресурстары, тапсырмалары және өзін-өзі тексеру тесті.', '<a href="#home">Басты бет</a> / Сабақтар') +
  S.modules.map((m, i) => `<section class="band${i % 2 ? ' alt' : ''}"><div class="wrap"><div class="muted small">${m.n} · ${m.hours} сағат</div><h2>${m.name}</h2><p class="muted">${m.part}</p>
  <div class="grid g3" style="margin-top:12px">${m.lessons.map(n => { const l = byN(n), sc = load().scores?.[n]; return `<a class="tile" href="#lesson-${n}">${l.img ? `<div class="pic" style="aspect-ratio:16/9"><img src="${l.img}" alt="" loading="lazy"></div>` : ''}<div class="t"><span>${n}-сабақ${l.code.includes('.') ? ' · ' + l.code : ''}${sc ? ' · тест: ' + sc.s + '/' + sc.t : ''}</span><b style="margin-top:4px">${l.title}</b></div></a>`; }).join('')}</div></div></section>`).join('');

const stageText = l => {
  const a = x => x ? `<a href="${x.u}" target="_blank" rel="noopener">${x.t.replace(/^.*?: /, '')}</a>` : '';
  if (l.project) return ['Сәлемдесу, бағалау критерийлерімен және шығармашылық топтармен таныстыру.', 'Бейнеролик, топтардың жоба қорғауы, «2+1» кері байланыс.', '', 'Үздік жобаларды марапаттау, ұжымдық фото не бейнеролик.'];
  return ['Амандасу, түгелдеу, «Смайлик» әдісімен ахуал орнату.' + (l.start ? ' Үй тапсырмасын тексеру: ' + a(l.start) + '.' : ''), 'Жаңа сабақ (бейнеролик), симуляциямен зерттеу, ЖИ комиксіндегі тапсырма, топтық және жұптық жұмыс.', '«Оң қол, сол қол» нейрожаттығуы.', (l.end ? 'Бекіту: ' + a(l.end) + '. ' : '') + 'Рефлексия, бағалау, үй тапсырмасы.'];
};
const taskCard = t => `<div class="task"><h3>${t.h}${t.pts ? `<small>${t.pts}</small>` : ''}</h3>${t.p ? `<p>${t.p}</p>` : ''}${t.list ? `<ul>${t.list.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}${t.ol ? `<ol>${t.ol.map(x => `<li>${x}</li>`).join('')}</ol>` : ''}${t.ans ? `<details><summary>Жауаптар</summary><p style="margin:6px 0 0">${t.ans}</p></details>` : ''}</div>`;
const quizHTML = l => `<div class="card quiz" id="quiz" data-n="${l.n}"><h2 style="font-size:20px">Өзіңді тексер</h2><p class="small muted">Әр сұраққа бір жауап таңда. Нәтиже осы браузерде сақталады.</p>
${l.quiz.map((q, i) => `<div data-q="${i}"><div class="q">${i + 1}. ${q.q}</div><div class="opts">${q.o.map((o, j) => `<button type="button" class="o" data-j="${j}">${o}</button>`).join('')}</div><div class="ex" hidden></div></div>`).join('')}
<div class="score"><span id="qz-s">0 / ${l.quiz.length}</span><div class="meter"><i id="qz-m" style="width:0"></i></div><button type="button" class="btn ghost" id="qz-r">Қайта бастау</button></div></div>`;

P.lesson = n => {
  const l = byN(n); if (!l) return P.home();
  const m = modOf(l), fl = l.flow, st = stageText(l), names = ['Сабақтың басы', 'Сабақтың ортасы', 'Сергіту', 'Сабақтың соңы'];
  const resources = [l.start && res(l.start.t, l.start.u, 'Сабақтың басы')].concat(l.video.map(v => res(v.t, v.u)), l.sims.map(s => res(s.t, s.u)), [l.end && res(l.end.t, l.end.u, 'Сабақтың соңы')], (n === 1 || n === 2) ? [res('ChatGPT – иллюстрация мен сценарий', 'https://chatgpt.com/'), res('Gamma – анимациялық комикс', 'https://gamma.app/ru')] : []).filter(Boolean);
  return banner(`${l.code.includes('.') ? l.code + '. ' : ''}${l.title}`, '', `<a href="#lessons">Сабақтар</a> / ${m.n}: ${m.name}`).replace('</h1>', `</h1><div class="chips"><span class="chip">${n}-сабақ</span><span class="chip">9-сынып</span><span class="chip">2 сағат: 1 теория, 1 практика</span>${l.obj.map(o => `<span class="chip">${o.split(' – ')[0]}</span>`).join('')}</div>`) + `
<section class="band"><div class="wrap lesson"><div>
  <div class="sec"><h2>Сабақтың мақсаты</h2>${ticks(l.goals)}${l.obj.length ? `<p class="small muted" style="margin-top:-4px">Оқу бағдарламасына сәйкес оқыту мақсаттары:</p><ul class="small" style="margin-top:0">${l.obj.map(o => `<li>${o}</li>`).join('')}</ul>` : ''}</div>
  <div class="sec"><h2>Сабақ барысы</h2><div class="flow">${fl.map((t, i) => t ? `<div><b>${t} мин</b><span>${names[i]}</span></div>` : '').join('')}</div>
  <div style="margin-top:12px">${fl.map((t, i) => t && st[i] ? `<p><b>${names[i]}.</b> ${st[i]}</p>` : '').join('')}</div></div>
  <div class="sec"><h2>Тапсырмалар</h2>${l.tasks.map(taskCard).join('')}${l.criteria ? `<div class="task"><h3>Бағалау критерийлері</h3>${critTable()}</div>` : ''}</div>
  ${l.fl ? `<div class="sec">${taskCard({ h: l.fl.h, p: l.fl.p, ol: l.fl.ol, ans: l.fl.ans })}</div>` : ''}
  <div class="sec grid g2">
    <div class="task" style="margin:0"><h3>Рефлексия: ${l.reflect.h}</h3><p>${l.reflect.p}</p>${l.reflect.img ? `<img class="comic" src="${l.reflect.img}" alt="Рефлексия парағы" data-zoom style="max-width:260px">` : ''}</div>
    <div class="task" style="margin:0"><h3>Үй тапсырмасы</h3><p>${l.home}</p>${l.homeImg ? `<img class="comic" src="${l.homeImg}" alt="Бұрыш өлшейтін қарапайым құралдар" data-zoom style="max-width:300px">` : ''}</div>
  </div>
  ${l.quiz ? quizHTML(l) : ''}
  <div class="pager">${n > 1 ? `<a class="btn ghost" href="#lesson-${n - 1}">← ${n - 1}-сабақ</a>` : '<span></span>'}${n < 17 ? `<a class="btn" href="#lesson-${n + 1}">${n + 1}-сабақ →</a>` : `<a class="btn" href="#results">Нәтижелерім →</a>`}</div>
</div>
<aside class="side">
  <div class="card res"><h3>Ресурстар</h3>${resources.join('') || '<p class="small muted">Бұл сабақ топтық жұмысқа негізделген.</p>'}</div>
  ${(l.comics || []).length ? `<div class="card"><h3>ЖИ комиксі</h3><div class="grid" style="gap:10px">${l.comics.map(c => `<img class="comic" src="${c}" alt="Сабақ тақырыбына ЖИ көмегімен жасалған комикс" data-zoom loading="lazy">`).join('')}</div><p class="small muted" style="margin:8px 0 0">Үлкейту үшін басыңыз.</p></div>` : ''}
</aside></div></section>`;
};

P.lab = () => banner('Цифрлық зертхана', 'Астрономия заңдарының интерактивті модельдері. Әр модельдің астында Google Colab-та іске қосуға болатын Python коды бар.', '<a href="#home">Басты бет</a> / Цифрлық зертхана') +
  `<section class="band" style="padding-bottom:0"><div class="wrap"><div class="chips">${L.MODELS.map(m => `<a class="chip" href="#lab-${m.id}">${m.t}</a>`).join('')}</div>
  <p class="small muted" style="margin-top:12px">Python кодын іске қосу: <a href="https://colab.research.google.com/" target="_blank" rel="noopener">colab.research.google.com</a> → жаңа блокнот → кодты қойып, «Іске қосу» батырмасы.</p></div></section>` +
  L.MODELS.map((m, i) => `<section class="band${i % 2 ? ' alt' : ''}" id="lab-${m.id}"><div class="wrap"><div class="row" style="justify-content:space-between;align-items:baseline"><h2>${m.t}</h2><span class="small muted">${m.l.map(n => `<a href="#lesson-${n}">${n}-сабақ</a>`).join(', ')}</span></div><p class="muted">${m.d}</p><div data-model="${m.id}"></div></div></section>`).join('');

/* ---------- Telegram-бот ---------- */
const FACTS = ['Күннен шыққан жарық Жерге шамамен 8 минут 20 секундта жетеді.', 'Шолпан өз осінен 243 тәулікте бір айналады, ал Күнді 225 тәулікте айналып шығады: оның «тәулігі» жылынан ұзақ.', 'Күн массасы бүкіл Күн жүйесі массасының шамамен 99,86%-ын құрайды.', 'Ай Жерден жыл сайын шамамен 3,8 см алыстап барады.', 'Марстағы Олимп тауы – Күн жүйесіндегі ең биік жанартау, биіктігі шамамен 22 км.', '1961 жылғы 12 сәуірде Юрий Гагарин Байқоңырдан ұшып, ғарышқа шыққан алғашқы адам болды.', 'Тоқтар Әубәкіров – ғарышқа ұшқан тұңғыш қазақ (1991 ж.).', 'Талғат Мұсабаев ғарышқа үш рет ұшқан (1994, 1998, 2001).', 'Айдын Айымбетов 2015 жылы Халықаралық ғарыш станциясына ұшты.', 'ХҒС Жерді шамамен 90 минутта бір айналады, жылдамдығы ≈ 7,7 км/с.', 'Сатурнның орташа тығыздығы судан аз – шамамен 0,69 г/см³.', 'Юпитердегі Үлкен қызыл дақ – Жерден үлкен алып дауыл.', 'Бетельгейзе – қызыл алып жұлдыз, радиусы Күннен шамамен 700 есе үлкен.', 'Байқоңыр – әлемдегі тұңғыш және ең ірі ғарыш айлақтарының бірі.', 'Жарық бір жылда шамамен 9,46 трлн км жол жүреді – бұл 1 жарық жылы.'];
const PL = [['Меркурий', '0,39 а.б.', '4 879 км', '88 тәулік', '59 тәулік', '−173…+427 °C'], ['Шолпан', '0,72 а.б.', '12 104 км', '225 тәулік', '243 тәулік (кері бағытта)', '≈ +465 °C'], ['Жер', '1 а.б.', '12 742 км', '365,25 тәулік', '23 сағ 56 мин', 'орташа +15 °C'], ['Марс', '1,52 а.б.', '6 779 км', '687 тәулік', '24 сағ 37 мин', 'орташа −63 °C'], ['Юпитер', '5,2 а.б.', '139 820 км', '11,9 жыл', '9 сағ 56 мин', '≈ −110 °C (бұлттар)'], ['Сатурн', '9,5 а.б.', '116 460 км', '29,5 жыл', '10 сағ 33 мин', '≈ −140 °C'], ['Уран', '19,2 а.б.', '50 724 км', '84 жыл', '17 сағ 14 мин', '≈ −195 °C'], ['Нептун', '30,1 а.б.', '49 244 км', '165 жыл', '16 сағ 6 мин', '≈ −200 °C']];
const QZ = [['Күн жүйесіндегі ең үлкен ғаламшар қайсы?', ['Марс', 'Юпитер', 'Сатурн', 'Нептун'], 1], ['Күнге ең жақын ғаламшар?', ['Шолпан', 'Меркурий', 'Марс', 'Жер'], 1], ['«Қызыл ғаламшар» деп қайсысын атайды?', ['Марс', 'Юпитер', 'Шолпан', 'Уран'], 0], ['Жерге ең жақын жұлдыз?', ['Сириус', 'Күн', 'Темірқазық', 'Вега'], 1], ['Темірқазық қай шоқжұлдызда?', ['Үлкен аю', 'Кіші аю', 'Орион', 'Кассиопея'], 1], ['Сақиналары ең айқын көрінетін ғаламшар?', ['Сатурн', 'Марс', 'Меркурий', 'Жер'], 0], ['Күн жарығы Жерге шамамен қанша уақытта жетеді?', ['8 секунд', '8 минут', '1 сағат', '1 тәулік'], 1], ['Ай Жерді шамамен неше тәулікте бір айналады (жұлдыздық ай)?', ['7', '27,3', '365', '1'], 1], ['Ең ыстық ғаламшар?', ['Меркурий', 'Шолпан', 'Марс', 'Юпитер'], 1], ['Ю. Гагарин қай ғарыш айлағынан ұшты?', ['Байқоңыр', 'Канаверал', 'Плесецк', 'Восточный'], 0]];
const ECL = [['2027-02-06', 'Сақиналы Күн тұтылуы', 'Оңтүстік Америка, Атлант мұхиты'], ['2027-02-20', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2027-07-18', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2027-08-02', 'Толық Күн тұтылуы', 'Испания, Солтүстік Африка, Египет, Арабия түбегі'], ['2027-08-17', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2028-01-12', 'Ішінара Ай тұтылуы', ''], ['2028-01-26', 'Сақиналы Күн тұтылуы', 'Эквадор, Перу, Бразилия, Португалия, Испания'], ['2028-07-06', 'Ішінара Ай тұтылуы', ''], ['2028-07-22', 'Толық Күн тұтылуы', 'Австралия, Жаңа Зеландия'], ['2028-12-31', 'Толық Ай тұтылуы', '']];
const BOTC = ['Астана', 'Алматы', 'Шымкент', 'Қарағанды', 'Ақтөбе', 'Тараз', 'Павлодар', 'Өскемен', 'Семей', 'Атырау', 'Қостанай', 'Орал', 'Петропавл', 'Ақтау', 'Түркістан'];
function sun(lat, lon, d = new Date()) {
  const rad = Math.PI / 180, jd = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7) / 864e5 + 2440587.5;
  const n = Math.ceil(jd - 2451545 + 0.0008), Js = n - lon / 360, M = (357.5291 + 0.98560028 * Js) % 360;
  const Cc = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad), lam = (M + Cc + 282.9372) % 360;
  const Jt = 2451545 + Js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad), sd = Math.sin(lam * rad) * Math.sin(23.4397 * rad), cd = Math.cos(Math.asin(sd));
  const cw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sd) / (Math.cos(lat * rad) * cd);
  const t = j => { const x = new Date((j - 2440587.5) * 864e5 + 5 * 36e5); return String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0'); };
  if (cw < -1 || cw > 1) return null;
  const w = Math.acos(cw) / rad / 360;
  return { rise: t(Jt - w), set: t(Jt + w), noon: t(Jt), len: Math.floor(w * 48) + ' сағ ' + Math.round((w * 48 % 1) * 60) + ' мин' };
}
P.bot = () => banner('Telegram-бот', 'Астрономия бойынша цифрлық көмекші: Күннің шығуы мен батуы, ХҒС орны, қызықты фактілер, ғаламшарлар, формулалар, тест және тұтылулар.', '<a href="#lab">Цифрлық зертхана</a> / Telegram-бот') + `
<section class="band"><div class="wrap intro"><div>
  <div class="phone" id="phone"><div class="ph"><i>A</i><div><b>Астрономия боты</b><small>демо-нұсқа · бот</small></div></div><div class="chat" id="chat" aria-live="polite"></div><div class="kb" id="kb"></div></div>
  <p class="small muted" style="text-align:center;margin-top:10px">Сайттағы демо интернетке сұраныс жібере алмайды: ХҒС пен Марс деректері – мысал. Күннің шығуы мен батуы бүгінгі күнге нақты есептеледі.</p>
</div><div>
  <h2>Бот не істейді</h2><p>Боттың басты мақсаты – оқушылардың физика мен астрономияға қызығушылығын ояту. Ол оқушыны ыңғайлы, еркін ортада ойын түрінде білім алуға шақырады: әр бала кез келген уақытта өз қарқынымен үйрене алады.</p>
  ${ticks(['Кез келген қаладағы Күннің шығуы мен батуы', 'Астрономия туралы кездейсоқ және күнделікті фактілер', 'Ғаламшарлар туралы анықтама', 'Негізгі астрономиялық формулалар', '10 сұрақтық астрономиялық тест', 'Келесі Күн және Ай тұтылулары', 'Марстағы ауа райы, ХҒС-ның ағымдағы орны, 3D Күн жүйесі'])}
  <h2 style="margin-top:22px">Ботты қалай жасауға болады</h2>
  <div class="task"><h3>1. Ботты тіркеу</h3><p style="margin:0">Telegram-да <b>@BotFather</b> ботына /newbot командасын жіберіп, ат беріңіз. Ол берген <b>токенді</b> ешкімге көрсетпеңіз.</p></div>
  <div class="task"><h3>2. Кодты жазу</h3><p style="margin:0">Python орнатып, <code>pip install pyTelegramBotAPI requests</code> командасын орындаңыз. Төмендегі кодты ЖИ көмегімен толықтыруға болады: «Ботқа Күн шығу уақытын есептейтін батырма қос» деп сұраңыз.</p></div>
  <div class="task"><h3>3. Іске қосу және сынау</h3><p style="margin:0">Кодты компьютерде, бұлттық ортада немесе Replit-те іске қосып, ботқа /start жіберіңіз. Сыныппен бірге тексеріп, жаңа батырмалар қосыңыз.</p></div>
  <div class="task"><h3>Кодсыз жол: n8n</h3><p style="margin:0">Сабақта «Telegram Trigger → AI Agent» сызбасы да көрсетілді: Telegram хабарламасы ЖИ агентіне жіберіліп, жауап қайтадан чатқа түседі. Мұндай боттың білімін тексеріп отыру керек – ЖИ қателесуі мүмкін.</p></div>
</div></div></section>
<section class="band alt"><div class="wrap"><h2>Боттың Python коды</h2><p class="muted">pyTelegramBotAPI кітапханасы. ХҒС координатасы open-notify API арқылы алынады.</p>${L.code(`# pip install pyTelegramBotAPI requests
import random
import requests
import telebot
from telebot import types

bot = telebot.TeleBot("СІЗДІҢ_ТОКЕН")        # @BotFather берген токен

FACTS = [
    "Күннен шыққан жарық Жерге шамамен 8 минут 20 секундта жетеді.",
    "Шолпанның өз осінен айналуы (243 тәулік) оның жылынан (225 тәулік) ұзақ.",
    "ХҒС Жерді шамамен 90 минутта бір рет айналады.",
]
QUIZ = [
    ("Күн жүйесіндегі ең үлкен ғаламшар?", ["Марс", "Юпитер", "Сатурн", "Нептун"], 1),
    ("Күнге ең жақын ғаламшар?", ["Шолпан", "Меркурий", "Марс", "Жер"], 1),
]

def menu():
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    kb.add("🛰 ХҒС орны", "✨ Факт", "📝 Тест")
    return kb

@bot.message_handler(commands=["start"])
def start(m):
    bot.send_message(m.chat.id, "Сәлем! Мен – астрономия көмекшісімін.", reply_markup=menu())

@bot.message_handler(func=lambda m: m.text == "🛰 ХҒС орны")
def iss(m):
    data = requests.get("http://api.open-notify.org/iss-now.json", timeout=10).json()
    pos = data["iss_position"]
    bot.send_message(m.chat.id, f"ХҒС қазір:\\nЕндік: {pos['latitude']}\\nБойлық: {pos['longitude']}")

@bot.message_handler(func=lambda m: m.text == "✨ Факт")
def fact(m):
    bot.send_message(m.chat.id, random.choice(FACTS))

@bot.message_handler(func=lambda m: m.text == "📝 Тест")
def quiz(m):
    i = random.randrange(len(QUIZ))
    question, options, _ = QUIZ[i]
    kb = types.InlineKeyboardMarkup()
    for j, text in enumerate(options):
        kb.add(types.InlineKeyboardButton(text, callback_data=f"q{i}_{j}"))
    bot.send_message(m.chat.id, question, reply_markup=kb)

@bot.callback_query_handler(func=lambda c: c.data.startswith("q"))
def answer(c):
    i, j = map(int, c.data[1:].split("_"))
    ok = j == QUIZ[i][2]
    bot.answer_callback_query(c.id, "Дұрыс! ✅" if ok else "Қате ❌")

bot.infinity_polling()`, 'Кодты ашу')}</div></section>`;

function botInit() {
  const chat = document.getElementById('chat'), kb = document.getElementById('kb'); if (!chat) return;
  const MAIN = ['🛰 ХҒС орны', '📈 Астрономия туралы факт', '🪐 Ғаламшарлар туралы ақпарат', '📘 Астрономия формулалары', '✏️ Астрономиялық тест', '🌒 Келесі тұтылу', '🔴 Марстағы ауа райы', '🌅 Күн шығуы/Батуы', '🌌 3D Күн жүйесі'];
  let lastFact = null, qi = 0, qs = 0;
  const say = (t, who = 'b') => { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = t; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
  const keys = (arr, wide = []) => { kb.innerHTML = arr.map(b => `<button type="button" class="${wide.includes(b) || arr.length === 1 ? 'w' : ''}">${b}</button>`).join(''); kb.querySelectorAll('button').forEach(b => b.onclick = () => press(b.textContent)); };
  const main = () => keys(MAIN, ['🌌 3D Күн жүйесі']);
  const back = '⬅️ Артқа';
  const ask = () => { const q = QZ[qi]; say(`❓ ${qi + 1}/10\n${q[0]}`); keys(q[1]); };
  let mode = 'main';
  const press = t => {
    say(t, 'u');
    if (t === back || t === '🏠 Мәзір') { mode = 'main'; say('Негізгі мәзір:'); return main(); }
    if (mode === 'quiz') { const q = QZ[qi], j = q[1].indexOf(t); if (j === q[2]) { qs++; say('Дұрыс! ✅'); } else say('Қате ❌ Дұрыс жауап: ' + q[1][q[2]]); qi++; if (qi < QZ.length) return ask(); mode = 'main'; say(`Тест аяқталды: ${qs} / ${QZ.length} 🎉`); return keys(['✏️ Астрономиялық тест', back]); }
    if (mode === 'city' && BOTC.includes(t)) { const c = L.CITIES.find(x => x[0] === t), r = sun(c[1], c[2]); const d = new Date(Date.now() + 5 * 36e5); say(r ? `🌅 ${t}, ${d.getUTCDate()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()} (UTC+5)\nКүн шығуы: <b>${r.rise}</b>\nКүн батуы: <b>${r.set}</b>\nКүн ұзақтығы: ${r.len}\nКүн меридианда: ${r.noon}` : 'Бүгін бұл қалада Күн батпайды не шықпайды.'); return; }
    if (mode === 'planet') { const p = PL.find(x => x[0] === t); if (p) { say(`🪐 <b>${p[0]}</b>\nКүннен қашықтығы: ${p[1]}\nДиаметрі: ${p[2]}\nКүнді айналу периоды: ${p[3]}\nӨз осінен айналуы: ${p[4]}\nТемпературасы: ${p[5]}`); return; } }
    if (mode === 'fact') {
      if (t === '🎲 Кездейсоқ факт') { lastFact = FACTS[Math.floor(Math.random() * FACTS.length)]; return say('💡 ' + lastFact); }
      if (t === '📅 Күнделікті факт') { const d = Math.floor(Date.now() / 864e5); lastFact = FACTS[d % FACTS.length]; return say('📅 Бүгінгі факт:\n' + lastFact); }
      if (t === '🔁 Соңғы фактіні қайталау') return say(lastFact ? '🔁 ' + lastFact : 'Әлі факт сұралған жоқ.');
    }
    switch (t) {
      case '🛰 ХҒС орны': return say('🛰 Халықаралық ғарыш станциясы (ХҒС)\n📍 Ағымдағы орны (мысал):\nЕндік: 50.0778\nБойлық: 35.0896\nНақты бот бұл деректі open-notify API-ден алады. Тірі картасы: <a href="https://wheretheiss.at/" target="_blank" rel="noopener">wheretheiss.at</a>');
      case '📈 Астрономия туралы факт': mode = 'fact'; say('Факт түрін таңдаңыз:'); return keys(['🎲 Кездейсоқ факт', '📅 Күнделікті факт', '🔁 Соңғы фактіні қайталау', back], ['🔁 Соңғы фактіні қайталау', back]);
      case '🪐 Ғаламшарлар туралы ақпарат': mode = 'planet'; say('Ғаламшарды таңдаңыз:'); return keys(PL.map(p => p[0]).concat(back), [back]);
      case '📘 Астрономия формулалары': return say('📘 Негізгі формулалар\nF = G·m₁·m₂ / r²\nv₁ = √(GM/R),  v₂ = √2·v₁\nT₁² / T₂² = a₁³ / a₂³\nD = R⊕ / sin p\nr (пк) = 1 / π″\nM = m + 5 − 5·lg r\nh = 90° − φ + δ\nT_жерг = UT + λ/15°');
      case '✏️ Астрономиялық тест': mode = 'quiz'; qi = 0; qs = 0; return ask();
      case '🌒 Келесі тұтылу': { const today = new Date().toISOString().slice(0, 10), next = ECL.filter(e => e[0] >= today).slice(0, 3); return say(next.length ? '🌒 Келесі тұтылулар:\n' + next.map(e => `• ${e[0].split('-').reverse().join('.')} – ${e[1]}${e[2] ? ' (' + e[2] + ')' : ''}`).join('\n') : 'Тізім жаңартуды қажет етеді.'); }
      case '🔴 Марстағы ауа райы': return say('🔴 Марстағы ауа райы (Perseverance марсоходынан алынған мәліметтер, имитация):\n🌡 Температура: −80 °C-ден −20 °C-ге дейін (күндіз)\n💨 Жел: 40 км/сағ-қа дейін\n🧭 Қысым: ≈ 750 Па (Жердегіден 0,75%)\n👁 Көрінуі: шаң салдарынан жиі төмендейді');
      case '🌅 Күн шығуы/Батуы': mode = 'city'; say('Қазақстандағы қаланы таңдаңыз:'); return keys(BOTC.concat(back), [back]);
      case '🌌 3D Күн жүйесі': { const m = say('🌌 3D Күн жүйесі: ғаламшарлар нақты периодтармен айналады.'); const f = document.createElement('div'); f.style.cssText = 'position:relative;height:220px;margin-top:6px;border-radius:10px;overflow:hidden;background:#04131a'; m.appendChild(f); L.solarScene(f, { tilt: 65, speed: 60, labels: false }); say('Толық модель: <a href="#lab-solar">Цифрлық зертхана</a>'); return; }
    }
    say('Мәзірдегі батырмаларды қолданыңыз 🙂');
  };
  say('/start', 'u'); say('Сәлем! 👋 Мен – астрономия көмекшісімін.\nТөмендегі мәзірден бөлімді таңдаңыз.'); main();
}

P.comics = () => banner('ЖИ және комикстер', 'Астрономия заңдарын ЖИ көмегімен жасалған комикс арқылы түсіндіру. Галерея және өз комиксіңді жасау жолы.', '<a href="#lab">Цифрлық зертхана</a> / Комикстер') + `
<section class="band"><div class="wrap"><div class="gal">
${S.lessons.flatMap(l => (l.comics || []).map(c => `<figure><img src="${c}" alt="${l.title} – ЖИ комиксі" data-zoom loading="lazy"><figcaption><a href="#lesson-${l.n}">${l.code.includes('.') ? l.code + '. ' : ''}${l.title}</a></figcaption></figure>`)).join('')}
</div><p class="small muted">Суреттер авторлық бағдарламадан алынды. Үлкейту үшін басыңыз.</p></div></section>
<section class="band alt"><div class="wrap intro"><div><h2>Комиксті қалай жасаймыз</h2>
<div class="task"><h3>1. Тақырып таңдау</h3><p style="margin:0">Астрономия бастамасы, Күн жүйесіндегі ғаламшарлар, Күн – біздің жұлдызымыз, ғарыштық жылдамдықтар, Ньютон заңдары.</p></div>
<div class="task"><h3>2. Сценарий жазу</h3><p style="margin:0">Тақырыпқа қызықты оқиға ойлап, 4–6 кадрлық сценарий жазыңыз. ChatGPT көмегімен жетілдіріңіз; ғылыми фактілерді оқулықпен тексеріңіз.</p></div>
<div class="task"><h3>3. Иллюстрация</h3><p style="margin:0">Әр кадрдың суретін ЖИ арқылы жасаңыз (<a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>, DALL·E, Stable Diffusion). Мәтінді суретке емес, кейін сөз бұлттарына жазған дұрыс.</p></div>
<div class="task"><h3>4. Құрастыру және анимация</h3><p style="margin:0"><a href="https://gamma.app/ru" target="_blank" rel="noopener">Gamma</a>, Canva, Pixton немесе ComicStrip Creator-да кадрларды жинап, сөз бұлттарын қосыңыз. Соңғы кадрға оқушыға сұрақ немесе тапсырма қойыңыз.</p></div>
</div><div><h2>Дайын промпттар</h2><p class="muted">Көшіріп, тақырыпты ауыстырыңыз.</p>
${L.code('Сен 9-сынып оқушыларына арналған астрономия комиксінің сценаристісің. Тақырып: «Кеплердің екінші заңы». 6 кадрлық сценарий жаз: әр кадрда сахна сипаттамасы және кейіпкерлердің қысқа сөздері (қазақ тілінде, 15 сөзден аспасын). Ғылыми дұрыс бол. Соңғы кадрда оқушыға бір есеп немесе сұрақ қой.', 'Сценарий промпты')}
${L.code('Мультфильм стиліндегі комикс кадры: қазақ мектеп оқушысы мен мұғалім телескоп жанында түнгі аспанға қарап тұр, аспанда Жетіқарақшы мен Темірқазық анық көрінеді. Жарқын түстер, жұмсақ жарық, 16:9, суретте мәтін болмасын.', 'Сурет промпты')}
</div></div></section>`;

P.games = () => banner('Ойындар мен тесттер', 'Әр сабақтың басында үй тапсырмасын тексеретін және соңында бекітетін ойындар, симуляциялар мен бейнероликтер.', '<a href="#home">Басты бет</a> / Ойындар мен тесттер') + `
<section class="band"><div class="wrap"><div class="scroll"><table class="stack"><thead><tr><th>Сабақ</th><th>Сабақ басында</th><th>Бекіту</th><th>Бейне және симуляциялар</th><th>Сайттағы тест</th></tr></thead><tbody>
${S.lessons.map(l => { const sc = load().scores?.[l.n], a = x => x ? `<a href="${x.u}" target="_blank" rel="noopener">${x.t.replace(/^.*?: /, '')}</a>` : '–'; return `<tr><td data-l="Сабақ"><a href="#lesson-${l.n}"><b>${l.n}.</b> ${l.title}</a></td><td data-l="Басында">${a(l.start)}</td><td data-l="Бекіту">${a(l.end)}</td><td data-l="Ресурстар">${l.video.concat(l.sims).map((v, i) => `<a href="${v.u}"${v.u[0] === '#' ? '' : ' target="_blank" rel="noopener"'}>${/youtu/.test(v.u) ? 'Бейне' : /^#/.test(v.u) ? 'Модель' : 'Симуляция'}${i ? ' ' + (i + 1) : ''}</a>`).join(', ') || '–'}</td><td data-l="Тест">${l.quiz ? `<a href="#lesson-${l.n}">${sc ? sc.s + ' / ' + sc.t : '4 сұрақ'}</a>` : 'жоба'}</td></tr>`; }).join('')}
</tbody></table></div><p class="small muted">Wordwall, Educaplay, Wayground және vascak.cz симуляциялары жаңа бетте ашылады.</p></div></section>`;

P.glossary = () => banner('Глоссарий', 'Бағдарламада қолданылатын негізгі ұғымдар, қысқартулар және астрономиялық тұрақтылар.', '<a href="#home">Басты бет</a> / Глоссарий') + `
<section class="band"><div class="wrap"><label class="small muted" for="gq">Іздеу</label><input type="text" id="gq" placeholder="мысалы, параллакс" style="max-width:420px;margin:6px 0 16px">
<div class="glo" id="glo">${S.glossary.map(g => `<div data-k="${(g[0] + ' ' + g[1]).toLowerCase()}"><b>${g[0]}</b> – ${g[1]}</div>`).join('')}</div><p id="gno" class="muted" hidden>Ештеңе табылмады.</p></div></section>
<section class="band alt"><div class="wrap intro"><div><h2>Астрономиялық тұрақтылар</h2><div class="scroll"><table><thead><tr><th>Белгі</th><th>Шама</th><th class="n">Мәні</th></tr></thead><tbody>${S.constants.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="n">${c[2]}</td></tr>`).join('')}</tbody></table></div></div>
<div><h2>Қысқартулар</h2>${S.abbr.map(a => `<p><b>${a[0]}</b> – ${a[1]}</p>`).join('')}</div></div></section>`;

P.results = () => {
  const d = load(), sc = d.scores || {}, qs = S.lessons.filter(l => l.quiz), done = qs.filter(l => sc[l.n]);
  const tot = done.reduce((a, l) => a + sc[l.n].s, 0), max = done.reduce((a, l) => a + sc[l.n].t, 0);
  return banner('Менің нәтижелерім', 'Сабақтардағы «Өзіңді тексер» тесттерінің нәтижелері. Деректер тек осы браузерде сақталады.', '<a href="#games">Оқушыға</a> / Нәтижелер') + `
<section class="band"><div class="wrap intro"><div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Тесттер</h3><span class="small muted">${done.length} / ${qs.length} сабақ</span></div>
${qs.map(l => { const r = sc[l.n], p = r ? Math.round(r.s / r.t * 100) : 0; return `<div class="row" style="flex-wrap:nowrap;margin:10px 0;gap:10px"><a href="#lesson-${l.n}" class="small" style="width:46%;flex:none">${l.n}. ${l.title}</a><div class="meter"><i style="width:${p}%;background:${p >= 70 ? 'var(--ok)' : 'var(--sky)'}"></i></div><span class="small" style="width:3.2em;flex:none;text-align:right">${r ? r.s + '/' + r.t : '–'}</span></div>`; }).join('')}</div>
<div><div class="card"><label class="small muted" for="rn">Оқушының аты-жөні</label><input type="text" id="rn" value="${(d.name || '').replace(/"/g, '&quot;')}" placeholder="Аты-жөніңізді жазыңыз" style="margin:6px 0 14px">
<div class="out"><div><small>Жалпы нәтиже</small><b>${max ? Math.round(tot / max * 100) + '%' : '–'}</b></div><div><small>Дұрыс жауаптар</small><b>${tot} / ${max}</b></div></div>
<p class="small muted" style="margin-top:12px">70% және одан жоғары – жақсы деңгей. Нәтижені мұғалімге скриншот арқылы көрсетіңіз.</p><button class="btn ghost" type="button" id="rclr">Нәтижелерді тазалау</button></div></div></div></section>`;
};

/* ---------- маршрут ---------- */
const lb = document.getElementById('lb');
lb.onclick = () => lb.classList.remove('show');
function after(route) {
  app.querySelectorAll('[data-zoom]').forEach(i => i.onclick = () => { lb.querySelector('img').src = i.src; lb.querySelector('img').alt = i.alt; lb.classList.add('show'); });
  app.querySelectorAll('[data-model]').forEach(h => { const m = L.MODELS.find(x => x.id === h.dataset.model); try { m.f(h); } catch (e) { h.innerHTML = '<p class="muted">Модельді жүктеу мүмкін болмады.</p>'; console.error(e); } });
  app.querySelectorAll('.copy').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.nextElementSibling.textContent); b.textContent = 'Көшірілді'; } catch (e) { const r = document.createRange(); r.selectNodeContents(b.nextElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Белгіленді: Ctrl+C'; } setTimeout(() => b.textContent = 'Көшіру', 2000); });
  if (route === 'bot') botInit();
  const qz = document.getElementById('quiz');
  if (qz) {
    const n = +qz.dataset.n, l = byN(n), ans = {};
    const upd = () => { const s = Object.values(ans).filter(Boolean).length, t = l.quiz.length, k = Object.keys(ans).length; qz.querySelector('#qz-s').textContent = `${s} / ${t}`; qz.querySelector('#qz-m').style.width = (k ? s / t * 100 : 0) + '%'; if (k === t) { const d = load(); d.scores = d.scores || {}; d.scores[n] = { s, t, ts: Date.now() }; save(d); qz.querySelector('#qz-s').textContent = `${s} / ${t} – ${s / t >= 0.7 ? 'жақсы!' : 'тағы бір рет көріңіз'}`; } };
    qz.querySelectorAll('[data-q]').forEach(box => { const i = +box.dataset.q, q = l.quiz[i]; box.querySelectorAll('.o').forEach(b => b.onclick = () => { const j = +b.dataset.j; ans[i] = j === q.a; box.querySelectorAll('.o').forEach((x, k) => { x.disabled = true; if (k === q.a) x.classList.add('ok'); else if (k === j) x.classList.add('no'); }); const ex = box.querySelector('.ex'); ex.hidden = false; ex.textContent = (j === q.a ? 'Дұрыс. ' : 'Қате. ') + q.e; upd(); }); });
    qz.querySelector('#qz-r').onclick = () => { lastRoute = ''; render(); setTimeout(() => document.getElementById('quiz')?.scrollIntoView({ block: 'start' }), 0); };
  }
  const gq = document.getElementById('gq');
  if (gq) gq.oninput = () => { const v = gq.value.trim().toLowerCase(); let c = 0; document.querySelectorAll('#glo>div').forEach(d => { const s = !v || d.dataset.k.includes(v); d.hidden = !s; c += s; }); document.getElementById('gno').hidden = c > 0; };
  const rn = document.getElementById('rn');
  if (rn) { rn.oninput = () => { const d = load(); d.name = rn.value; save(d); }; const rc = document.getElementById('rclr'); let armed = false; rc.onclick = () => { if (!armed) { armed = true; rc.textContent = 'Растау үшін тағы басыңыз'; setTimeout(() => { armed = false; rc.textContent = 'Нәтижелерді тазалау'; }, 3000); return; } const d = load(); delete d.scores; save(d); lastRoute = ''; render(); }; }
}
let lastRoute = '';
function render() {
  const h = (location.hash || '#home').slice(1);
  let route = h, sub = null;
  if (/^lesson-\d+$/.test(h)) route = 'lesson';
  else if (/^lab-/.test(h)) { route = 'lab'; sub = h; }
  else if (!P[h] || h === 'lesson') route = 'home';
  const key = route === 'lesson' ? h : route;
  if (key !== lastRoute) {
    app.innerHTML = route === 'lesson' ? P.lesson(+h.split('-')[1]) : P[route]();
    after(route);
    lastRoute = key;
    if (!sub) window.scrollTo(0, 0);
  }
  if (sub) { const el = document.getElementById(sub); if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); }
  nav.querySelectorAll('.dd').forEach((d, i) => d.classList.toggle('cur', i === groupOf(h)));
  closeAll(); nav.classList.remove('show'); burger.setAttribute('aria-expanded', 'false');
  const l = route === 'lesson' ? byN(+h.split('-')[1]) : null;
  document.title = l ? `${l.n}-сабақ · Astro_bilim` : 'Astro_bilim · 9-сынып';
}
window.addEventListener('hashchange', render);
render();
}
