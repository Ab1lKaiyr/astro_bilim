window.LAB = (() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { sky: '#38c3e2', sky2: '#7ad9ee', gold: '#f4c84a', ink: '#eaf4f7', mut: '#a3bfca', line: '#1f4a5e', bg: '#04131a', bad: '#ff7a6b', ok: '#5fd39a' };
const G = 6.674e-11;
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const num = (x, d = 2) => Number.isFinite(x) ? x.toLocaleString('ru-RU', { maximumFractionDigits: d }) : '—';
const sci = (x, d = 2) => {
  if (!Number.isFinite(x)) return '—';
  if (x !== 0 && (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-2)) {
    const [m, e] = x.toExponential(d).split('e');
    return m.replace('.', ',') + '·10' + String(+e).split('').map(ch => SUP[ch] || ch).join('');
  }
  return num(x, d);
};
const parseNum = s => {
  s = String(s).trim().replace(/\s/g, '').replace(',', '.').replace(/[·×x\*]10\^?/i, 'e');
  s = s.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => ({ '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' })[ch]);
  return parseFloat(s);
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (py, title = 'Python коды (Google Colab немесе Jupyter)') => `<details><summary>${title}</summary><div class="pre"><button class="copy" type="button">Көшіру</button><pre><code>${esc(py)}</code></pre></div></details>`;

function canvas(fig, draw) {
  const c = document.createElement('canvas'); fig.appendChild(c);
  const ctx = c.getContext('2d');
  const st = { W: 0, H: 0, ctx };
  const fit = () => {
    const r = fig.getBoundingClientRect(), d = devicePixelRatio || 1;
    st.W = r.width; st.H = r.height; c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0); draw(st);
  };
  const ro = new ResizeObserver(fit); ro.observe(fig);
  return st;
}
function loop(el, step) {
  let on = !RM, last = 0, vis = true;
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); io.observe(el);
  const f = t => {
    if (!el.isConnected) { io.disconnect(); return; }
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    if (on && vis) step(dt);
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  return { toggle() { on = !on; return on; }, get on() { return on; } };
}
function playBtn(host, lp) {
  const b = host.querySelector('.play'); if (!b) return;
  const set = () => b.textContent = lp.on ? 'Тоқтату' : 'Іске қосу';
  set(); b.onclick = () => { lp.toggle(); set(); };
}
const dot = (ctx, x, y, r, col, glow) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; } ctx.fill(); ctx.shadowBlur = 0; };
const label = (ctx, t, x, y, col = C.ink, al = 'left', size = 13) => { ctx.font = `${size}px "Golos Text", system-ui, sans-serif`; ctx.textAlign = al; ctx.lineWidth = 4; ctx.strokeStyle = C.bg; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); };
const kepE = (M, e) => { let E = e < 0.8 ? M : Math.PI; for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };

/* ---------- Кеплер ---------- */
function kepler(h) {
  const P = [['Жер', 1, 0.017], ['Марс', 1.524, 0.093], ['Сәтпаев астероиді', 2.22, 0.13], ['Темпель кометасы', 3.03, 0.55], ['Галлей кометасы', 17.8, 0.967]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:380px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><label class="row small" style="gap:6px"><input type="checkbox" id="k-areas" checked style="width:20px;height:20px"> Тең аудандарды көрсету</label></div></div>
  <div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <label>Үлкен жарты ось a = <b id="k-av"></b> а.б.<input type="range" id="k-a" min="-0.5" max="1.6" step="0.005"></label>
  <label>Эксцентриситет e = <b id="k-ev"></b><input type="range" id="k-e" min="0" max="0.97" step="0.005"></label>
  <div class="out"><div><small>Период T = a<sup>3/2</sup></small><b id="k-T"></b></div><div><small>Перигелий q = a(1 − e)</small><b id="k-q"></b></div><div><small>Афелий Q = a(1 + e)</small><b id="k-Q"></b></div><div><small>v перигелийде / афелийде</small><b id="k-v"></b></div></div>
  <p class="small muted">Боялған секторлар бірдей уақыт аралығында сызылады – олардың аудандары тең (Кеплердің II заңы). Жылдамдық: v = 29,8·√(2/r − 1/a) км/с, r және a – а.б.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

a, e = 1.524, 0.093            # Марс: үлкен жарты ось (а.б.), эксцентриситет
T = a ** 1.5                   # Кеплердің III заңы: T² = a³ (жыл)

t = np.linspace(0, T, 13)      # орбитаны 12 тең уақыт аралығына бөлеміз
M = 2 * np.pi * t / T          # орташа аномалия
E = M.copy()
for _ in range(30):            # Кеплер теңдеуі: E − e·sinE = M
    E -= (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
x = a * (np.cos(E) - e)
y = a * np.sqrt(1 - e**2) * np.sin(E)

th = np.linspace(0, 2 * np.pi, 400)
plt.figure(figsize=(6, 6))
plt.plot(a * (np.cos(th) - e), a * np.sqrt(1 - e**2) * np.sin(th), lw=1)
for i in range(0, 12, 2):      # II заң: тең уақытта тең аудандар
    plt.fill([0, x[i], x[i + 1]], [0, y[i], y[i + 1]], alpha=0.3)
plt.plot(0, 0, 'o', color='orange', ms=14, label='Күн (фокус)')
plt.scatter(x, y, s=12, label='Тең уақыт аралықтары')
plt.gca().set_aspect('equal'); plt.grid(alpha=.3); plt.legend()
plt.title(f'a = {a} а.б., e = {e}, T = {T:.2f} жыл')
plt.show()`);
  const fig = h.querySelector('.fig'), $ = s => h.querySelector(s);
  let a = 1.524, e = 0.093, ph = 0;
  const upd = () => {
    $('#k-a').value = Math.log10(a); $('#k-e').value = e;
    $('#k-av').textContent = num(a, 2); $('#k-ev').textContent = num(e, 3);
    const T = a ** 1.5, q = a * (1 - e), Q = a * (1 + e);
    $('#k-T').textContent = T < 2 ? num(T * 365.25, 0) + ' тәул.' : num(T, 2) + ' жыл';
    $('#k-q').textContent = num(q, 3) + ' а.б.'; $('#k-Q').textContent = num(Q, 3) + ' а.б.';
    const vp = 29.78 * Math.sqrt(2 / q - 1 / a), va = 29.78 * Math.sqrt(2 / Q - 1 / a);
    $('#k-v').textContent = num(vp, 1) + ' / ' + num(va, 1);
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const b = a * Math.sqrt(1 - e * e), sc = Math.min((W - 60) / (2 * a), (H - 60) / (2 * b));
    const cx = W / 2, cy = H / 2, sx = cx + a * e * sc;
    const P = E => [sx + a * (Math.cos(E) - e) * sc, cy - b * Math.sin(E) * sc];
    if ($('#k-areas').checked) {
      for (let k = 0; k < 12; k += 2) {
        ctx.beginPath(); ctx.moveTo(sx, cy);
        for (let j = 0; j <= 20; j++) { const M = 2 * Math.PI * (k + j / 20) / 12; const p = P(kepE(M, e)); ctx.lineTo(p[0], p[1]); }
        ctx.closePath(); ctx.fillStyle = 'rgba(56,195,226,.22)'; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.ellipse(cx, cy, a * sc, b * sc, 0, 0, 7); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
    dot(ctx, sx, cy, 9, C.gold, 18); label(ctx, 'Күн', sx, cy + 26, C.gold, 'center');
    const pq = P(0), pa = P(Math.PI);
    dot(ctx, pq[0], pq[1], 3, C.mut); label(ctx, 'перигелий', pq[0] - 6, pq[1] - 10, C.mut, 'right');
    dot(ctx, pa[0], pa[1], 3, C.mut); label(ctx, 'афелий', pa[0] + 6, pa[1] - 10, C.mut, 'left');
    const p = P(kepE(ph, e));
    ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(p[0], p[1]); ctx.strokeStyle = 'rgba(244,200,74,.6)'; ctx.lineWidth = 1; ctx.stroke();
    dot(ctx, p[0], p[1], 6, C.sky, 10);
  };
  const st = canvas(fig, draw);
  $('#k-a').oninput = ev => { a = 10 ** +ev.target.value; upd(); };
  $('#k-e').oninput = ev => { e = +ev.target.value; upd(); };
  $('#k-areas').onchange = () => draw(st);
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const p = P[+b.dataset.i]; a = p[1]; e = p[2]; upd(); });
  const lp = loop(fig, dt => { ph = (ph + dt * 2 * Math.PI / 8) % (2 * Math.PI); draw(st); });
  playBtn(h, lp); upd();
}

/* ---------- Күн жүйесі ---------- */
const PLANETS = [['Меркурий', 0.387, 87.97, '#b9b2a8', 2.5], ['Шолпан', 0.723, 224.7, '#e8c77a', 4], ['Жер', 1, 365.25, '#4fb0ff', 4.2], ['Марс', 1.524, 687, '#e0704a', 3.2], ['Юпитер', 5.203, 4333, '#d9a66b', 8], ['Сатурн', 9.537, 10759, '#e6d08a', 7], ['Уран', 19.19, 30687, '#8fe0e6', 5.5], ['Нептун', 30.07, 60190, '#5b7cff', 5.5]];
function solarScene(fig, opt = {}) {
  let tilt = opt.tilt ?? 62, speed = opt.speed ?? 40, days = 0;
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W / 2 - 24, (H / 2 - 20) / Math.max(Math.cos(tilt * Math.PI / 180), 0.25)), k = Math.cos(tilt * Math.PI / 180);
    const sc = r => Math.sqrt(r / 30.07) * R;
    PLANETS.forEach(p => { ctx.beginPath(); ctx.ellipse(cx, cy, sc(p[1]), sc(p[1]) * k, 0, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.25)'; ctx.lineWidth = 1; ctx.stroke(); });
    const items = PLANETS.map(p => { const ang = 2 * Math.PI * days / p[2] + p[1]; return { p, x: cx + sc(p[1]) * Math.cos(ang), y: cy + sc(p[1]) * Math.sin(ang) * k, z: Math.sin(ang) }; });
    const sun = { sun: true, z: 0 };
    [...items, sun].sort((A, B) => A.z - B.z).forEach(it => {
      if (it.sun) { dot(ctx, cx, cy, 11, C.gold, 26); return; }
      const r = it.p[4] * (0.85 + 0.25 * it.z * k);
      dot(ctx, it.x, it.y, r, it.p[3]);
      if (it.p[0] === 'Сатурн') { ctx.beginPath(); ctx.ellipse(it.x, it.y, r * 2, r * 0.7, -0.3, 0, 7); ctx.strokeStyle = '#e6d08a'; ctx.stroke(); }
      if (opt.labels !== false && W > 300) label(ctx, it.p[0], it.x + r + 4, it.y - r - 2, C.mut, 'left', 12);
    });
    if (opt.onDays) opt.onDays(days);
  };
  const st = canvas(fig, draw);
  const lp = loop(fig, dt => { days += dt * speed; draw(st); });
  return { set(o) { if (o.tilt != null) tilt = o.tilt; if (o.speed != null) speed = o.speed; draw(st); }, lp };
}
function solar(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:400px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><span class="small muted" id="s-d"></span></div></div>
  <div class="ctl"><label>Көлбеу бұрыш (3D көрініс): <b id="s-tv">62°</b><input type="range" id="s-t" min="0" max="80" value="62"></label>
  <label>Жылдамдық: 1 секундта <b id="s-vv">40</b> тәулік<input type="range" id="s-v" min="1" max="400" value="40"></label>
  <div class="scroll"><table><thead><tr><th>Ғаламшар</th><th class="n">a, а.б.</th><th class="n">Период</th></tr></thead><tbody>${PLANETS.map(p => `<tr><td>${p[0]}</td><td class="n">${num(p[1], 3)}</td><td class="n">${p[2] < 1000 ? num(p[2], 0) + ' тәул.' : num(p[2] / 365.25, 1) + ' жыл'}</td></tr>`).join('')}</tbody></table></div>
  <p class="small muted">Қашықтықтар түбір шкаламен (√a) кішірейтілген, ғаламшар өлшемдері масштабсыз. Периодтар нақты.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from IPython.display import HTML

planets = {'Меркурий': (0.387, 88), 'Шолпан': (0.723, 225),
           'Жер': (1.0, 365.25), 'Марс': (1.524, 687)}   # (a, а.б.; T, тәулік)

fig, ax = plt.subplots(figsize=(6, 6))
ax.set_aspect('equal'); ax.set_xlim(-1.8, 1.8); ax.set_ylim(-1.8, 1.8)
ax.set_facecolor('black'); ax.plot(0, 0, 'o', color='gold', ms=16)
dots = {}
for name, (a, T) in planets.items():
    th = np.linspace(0, 2 * np.pi, 200)
    ax.plot(a * np.cos(th), a * np.sin(th), lw=.5, color='gray')
    dots[name], = ax.plot([], [], 'o', label=name)
ax.legend(loc='upper right')

def update(frame):
    day = frame * 5                        # әр кадр – 5 тәулік
    for name, (a, T) in planets.items():
        ang = 2 * np.pi * day / T
        dots[name].set_data([a * np.cos(ang)], [a * np.sin(ang)])
    return list(dots.values())

anim = FuncAnimation(fig, update, frames=146, interval=40, blit=True)
HTML(anim.to_jshtml())`);
  const $ = s => h.querySelector(s);
  const sc = solarScene(h.querySelector('.fig'), { onDays: d => $('#s-d').textContent = 'Өткен уақыт: ' + num(d, 0) + ' тәулік' });
  playBtn(h, sc.lp);
  $('#s-t').oninput = e => { $('#s-tv').textContent = e.target.value + '°'; sc.set({ tilt: +e.target.value }); };
  $('#s-v').oninput = e => { $('#s-vv').textContent = e.target.value; sc.set({ speed: +e.target.value }); };
}

/* ---------- Тартылыс ---------- */
function gravity(h) {
  const P = [['Оқушы мен Жер', '60', '5,972e24', '6371'], ['Жер мен Ай', '5,972e24', '7,35e22', '384400'], ['KazSat-3 орбитада', '1300', '5,972e24', '42157'], ['Зымыран мен ХҒС', '33000', '410000', '0,1'], ['Күн мен Жер', '1,989e30', '5,972e24', '1,496e8']];
  h.innerHTML = `<div class="lab"><div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <div class="grid g2"><label>m₁, кг<input type="text" id="g-m1" inputmode="decimal"></label><label>m₂, кг<input type="text" id="g-m2" inputmode="decimal"></label></div>
  <label>Ара қашықтық r, км<input type="text" id="g-r" inputmode="decimal"></label>
  <p class="small muted">Үлкен сандарды 5,972e24 түрінде жазыңыз (5,972·10²⁴).</p></div>
  <div><div class="card" style="text-align:center"><small class="muted">F = G·m₁·m₂ / r²</small><div id="g-F" style="font-family:Unbounded,sans-serif;font-size:clamp(28px,5vw,42px);color:var(--sky);margin:6px 0"></div><div class="small muted" id="g-w"></div></div>
  <div class="card" style="margin-top:14px"><b>Қашықтық артқанда күш қалай кемиді</b><div id="g-bars" style="margin-top:10px"></div></div></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

G, M, m = 6.674e-11, 5.972e24, 1300      # Жер массасы және KazSat-3 массасы, кг
R = 6.371e6                              # Жер радиусы, м
h = np.linspace(0, 40_000e3, 400)        # биіктік, м
F = G * M * m / (R + h) ** 2

plt.plot(h / 1000, F)
plt.axvline(35_786, ls='--', color='gray', label='Геостационар орбита, 35 786 км')
plt.xlabel('Биіктік, км'); plt.ylabel('F, Н')
plt.title('KazSat-3 спутнигіне әсер ететін тартылыс күші')
plt.legend(); plt.grid(alpha=.3); plt.show()
print(f'Жер бетінде: {F[0]:.0f} Н, орбитада: {G*M*m/(R+35_786e3)**2:.0f} Н')`);
  const $ = s => h.querySelector(s);
  const calc = () => {
    const m1 = parseNum($('#g-m1').value), m2 = parseNum($('#g-m2').value), r = parseNum($('#g-r').value) * 1000;
    const F = G * m1 * m2 / (r * r);
    $('#g-F').textContent = r > 0 ? sci(F, 3) + ' Н' : '—';
    $('#g-w').textContent = r > 0 ? 'G = 6,674·10⁻¹¹ Н·м²/кг², r = ' + sci(r, 3) + ' м' : 'Қашықтықты енгізіңіз';
    $('#g-bars').innerHTML = [1, 2, 3, 4].map(k => `<div class="row" style="margin:6px 0;flex-wrap:nowrap"><span style="width:3.2em;flex:none">${k === 1 ? 'r' : k + 'r'}</span><div class="meter"><i style="width:${100 / (k * k)}%"></i></div><span class="small" style="width:5.5em;flex:none;text-align:right;white-space:nowrap">F/${k * k}</span></div>`).join('');
  };
  const set = i => { const p = P[i]; $('#g-m1').value = p[1]; $('#g-m2').value = p[2]; $('#g-r').value = p[3]; calc(); };
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => set(+b.dataset.i));
  ['#g-m1', '#g-m2', '#g-r'].forEach(s => $(s).oninput = calc);
  set(2);
}

/* ---------- Ғарыштық жылдамдықтар ---------- */
function cosmic(h) {
  const B = [['Жер', 5.972e24, 6371, '#4fb0ff'], ['Ай', 7.35e22, 1737, '#c9c9c9'], ['Марс', 6.42e23, 3390, '#e0704a'], ['Шолпан', 4.867e24, 6052, '#e8c77a'], ['Юпитер', 1.898e27, 69911, '#d9a66b']];
  const H = [['ХҒС', 420], ['GPS', 20200], ['Геостационар', 35786]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:360px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button></div></div>
  <div class="ctl"><label>Аспан денесі<select id="c-b">${B.map((b, i) => `<option value="${i}">${b[0]}</option>`).join('')}</select></label>
  <label>Орбита биіктігі h = <b id="c-hv"></b> км<input type="range" id="c-h" min="0" max="45000" step="10"></label>
  <div class="chips" id="c-pre">${H.map(x => `<button class="chip" type="button" data-h="${x[1]}" style="cursor:pointer">${x[0]}, ${num(x[1], 0)} км</button>`).join('')}</div>
  <div class="out"><div><small>v₁ = √(GM/R)</small><b id="c-v1"></b></div><div><small>v₂ = √2·v₁</small><b id="c-v2"></b></div><div><small>h биіктіктегі v</small><b id="c-v"></b></div><div><small>Айналу периоды T</small><b id="c-T"></b></div><div><small>h биіктіктегі g</small><b id="c-g"></b></div></div></div></div>` + code(`import math

G = 6.674e-11
bodies = {'Жер': (5.972e24, 6.371e6), 'Ай': (7.35e22, 1.737e6),
          'Марс': (6.42e23, 3.39e6), 'Юпитер': (1.898e27, 6.9911e7)}

for name, (M, R) in bodies.items():
    v1 = math.sqrt(G * M / R)        # бірінші ғарыштық жылдамдық
    v2 = math.sqrt(2) * v1           # екінші ғарыштық жылдамдық
    print(f'{name:7s} v1 = {v1/1000:6.2f} км/с   v2 = {v2/1000:6.2f} км/с')

# Геостационар орбитаның радиусы: T = 23 сағ 56 мин 4 с
M, T = 5.972e24, 86164
r = (G * M * T**2 / (4 * math.pi**2)) ** (1/3)
print(f'Геостационар орбита биіктігі ≈ {(r - 6.371e6)/1000:,.0f} км')`);
  const $ = s => h.querySelector(s);
  let bi = 0, hk = 420, ang = 0;
  const calc = () => {
    const [n, M, Rk] = B[bi], R = Rk * 1000, r = R + hk * 1000;
    const v1 = Math.sqrt(G * M / R), v = Math.sqrt(G * M / r), T = 2 * Math.PI * r / v;
    $('#c-hv').textContent = num(hk, 0); $('#c-h').value = hk;
    $('#c-v1').textContent = num(v1 / 1000, 2) + ' км/с'; $('#c-v2').textContent = num(v1 * Math.SQRT2 / 1000, 2) + ' км/с';
    $('#c-v').textContent = num(v / 1000, 2) + ' км/с';
    const hh = Math.floor(T / 3600), mm = Math.round((T % 3600) / 60);
    $('#c-T').textContent = hh + ' сағ ' + mm + ' мин';
    $('#c-g').textContent = num(G * M / (r * r), 3) + ' м/с²';
    $('#c-pre').style.display = bi === 0 ? '' : 'none';
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H: Hh } = s; if (!W) return; ctx.clearRect(0, 0, W, Hh);
    const [n, M, Rk, col] = B[bi], cx = W / 2, cy = Hh / 2;
    const maxR = Rk + Math.max(hk, bi === 0 ? 35786 : 0), sc = (Math.min(W, Hh) / 2 - 24) / maxR;
    if (bi === 0) { ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(cx, cy, (Rk + 35786) * sc, 0, 7); ctx.strokeStyle = 'rgba(244,200,74,.5)'; ctx.stroke(); ctx.setLineDash([]); label(ctx, 'геостационар орбита', cx, cy - (Rk + 35786) * sc - 6, C.gold, 'center', 12); }
    const g = ctx.createRadialGradient(cx - Rk * sc * .3, cy - Rk * sc * .3, 1, cx, cy, Rk * sc);
    g.addColorStop(0, '#fff'); g.addColorStop(.25, col); g.addColorStop(1, '#0a2a3a');
    ctx.beginPath(); ctx.arc(cx, cy, Rk * sc, 0, 7); ctx.fillStyle = g; ctx.fill();
    const ro = (Rk + hk) * sc;
    ctx.beginPath(); ctx.arc(cx, cy, ro, 0, 7); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
    const x = cx + ro * Math.cos(ang), y = cy + ro * Math.sin(ang);
    dot(ctx, x, y, 5, C.sky, 10);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26 * Math.sin(ang), y + 26 * Math.cos(ang)); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, n, cx, cy + 4, '#04131a', 'center');
  };
  const st = canvas(h.querySelector('.fig'), draw);
  $('#c-b').onchange = e => { bi = +e.target.value; calc(); };
  $('#c-h').oninput = e => { hk = +e.target.value; calc(); };
  h.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { hk = +b.dataset.h; calc(); });
  const lp = loop(h.querySelector('.fig'), dt => { ang -= dt * 1.2; draw(st); });
  playBtn(h, lp); calc();
}

/* ---------- Параллакс ---------- */
function parallax(h) {
  const P = [['Ай', 57, '′', 0], ['Күн', 8.8, '″', 0], ['Юпитер (қарсы тұруда)', 2.2, '″', 0], ['Сатурн', 0.9, '″', 0], ['Проксима Центавр', 0.768, '″', 1], ['Сириус', 0.379, '″', 1], ['Вега', 0.130, '″', 1]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:300px"></div></div>
  <div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <label>Параллакс түрі<select id="p-m"><option value="0">Көкжиектік (Күн жүйесі денелері)</option><option value="1">Жылдық (жұлдыздар)</option></select></label>
  <div class="grid g2"><label>Параллакс<input type="number" id="p-v" step="any" min="0"></label><label>Өлшем бірлігі<select id="p-u"><option value="″">бұрыштық секунд ″</option><option value="′">бұрыштық минут ′</option></select></label></div>
  <label id="p-rl">Бұрыштық диаметр ρ, ″ (міндетті емес)<input type="number" id="p-r" step="any" min="0" placeholder="мысалы, 25"></label>
  <div class="out" id="p-out"></div></div></div>` + code(`import math

R = 6378                                  # Жердің экваторлық радиусы, км
p = 57 * 60                               # Айдың көкжиектік параллаксы: 57′ = 3420″
D = R / math.sin(math.radians(p / 3600))
print(f'Айға дейінгі қашықтық ≈ {D:,.0f} км')

rho, r_mars = 25, 5.6e7                   # Марс: бұрыштық диаметрі 25″, қашықтығы, км
print(f'Марстың диаметрі ≈ {r_mars * rho / 206265:,.0f} км')

pi_star = 0.379                           # Сириустың жылдық параллаксы, ″
print(f'Сириусқа дейін: {1/pi_star:.2f} пк = {3.26/pi_star:.1f} жарық жылы')`);
  const $ = s => h.querySelector(s);
  let mode = 0, pv = 57, u = '′';
  const calc = () => {
    $('#p-m').value = mode; $('#p-v').value = pv; $('#p-u').value = u; $('#p-rl').style.display = mode ? 'none' : '';
    const sec = pv * (u === '′' ? 60 : 1), o = $('#p-out');
    if (!(sec > 0)) { o.innerHTML = '<div><small>Нәтиже</small><b>—</b></div>'; draw(st); return; }
    if (mode === 0) {
      const D = 6378 / Math.sin(sec / 3600 * Math.PI / 180), rho = parseFloat($('#p-r').value);
      o.innerHTML = `<div><small>D = R⊕ / sin p</small><b>${sci(D, 3)} км</b></div><div><small>Астрономиялық бірлікпен</small><b>${num(D / 1.496e8, 3)} а.б.</b></div>` + (rho > 0 ? `<div><small>Сызықтық диаметр d = D·ρ/206 265</small><b>${num(D * rho / 206265, 0)} км</b></div>` : '');
    } else {
      o.innerHTML = `<div><small>r = 1/π</small><b>${num(1 / sec, 2)} пк</b></div><div><small>Жарық жылымен</small><b>${num(3.2616 / sec, 1)} ж.ж.</b></div><div><small>Километрмен</small><b>${sci(3.086e13 / sec, 2)} км</b></div>`;
    }
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const sec = pv * (u === '′' ? 60 : 1), cy = H / 2, x0 = 70, x1 = W - 60;
    const show = Math.max(4, Math.min(40, 6 + Math.log10(sec + 1) * 12));
    const base = (x1 - x0) * Math.tan(show * Math.PI / 180);
    if (mode === 0) {
      ctx.beginPath(); ctx.arc(x0, cy, Math.min(base, 60), 0, 7); ctx.fillStyle = '#1d6f9a'; ctx.fill();
      label(ctx, 'Жер', x0, cy + Math.min(base, 60) + 18, C.mut, 'center');
      const top = cy - Math.min(base, 60);
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.moveTo(x0, top); ctx.lineTo(x1, cy); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0, top); ctx.strokeStyle = C.gold; ctx.stroke();
      label(ctx, 'R⊕', x0 - 8, (cy + top) / 2, C.gold, 'right');
    } else {
      const ry = Math.min(base, H / 2 - 30);
      ctx.beginPath(); ctx.ellipse(x0, cy, 16, ry, 0, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.4)'; ctx.stroke();
      dot(ctx, x0, cy, 7, C.gold, 12); label(ctx, 'Күн', x0 - 14, cy + 4, C.gold, 'right');
      dot(ctx, x0, cy - ry, 4, '#4fb0ff'); label(ctx, 'Жер', x0 + 10, cy - ry - 4, C.mut);
      ctx.beginPath(); ctx.moveTo(x0, cy - ry); ctx.lineTo(x1, cy); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
      label(ctx, '1 а.б.', x0 + 8, cy - ry / 2, C.gold);
    }
    dot(ctx, x1, cy, 6, C.ink, 10);
    label(ctx, mode === 0 ? 'p' : 'π', x1 - 34, cy - 6, C.gold, 'right', 15);
    label(ctx, 'бұрыш үлкейтіліп көрсетілген', W - 12, H - 12, C.mut, 'right', 12);
  };
  const st = canvas(h.querySelector('.fig'), draw);
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const p = P[+b.dataset.i]; pv = p[1]; u = p[2]; mode = p[3]; $('#p-r').value = ''; calc(); });
  $('#p-m').onchange = e => { mode = +e.target.value; if (mode) u = '″'; calc(); };
  $('#p-v').oninput = e => { pv = parseFloat(e.target.value); calc(); };
  $('#p-u').onchange = e => { u = e.target.value; calc(); };
  $('#p-r').oninput = calc;
  calc();
}

/* ---------- Шарықтау ---------- */
const CITIES = [['Ақтөбе', 50.28, 57.17], ['Астана', 51.17, 71.43], ['Алматы', 43.24, 76.89], ['Шымкент', 42.32, 69.59], ['Қарағанды', 49.80, 73.10], ['Тараз', 42.90, 71.37], ['Павлодар', 52.29, 76.97], ['Өскемен', 49.95, 82.61], ['Семей', 50.41, 80.25], ['Атырау', 47.11, 51.92], ['Қостанай', 53.21, 63.63], ['Орал', 51.23, 51.37], ['Петропавл', 54.87, 69.15], ['Ақтау', 43.65, 51.17], ['Түркістан', 43.30, 68.25], ['Қызылорда', 44.85, 65.51], ['Сарыағаш', 41.45, 69.17]];
const STARS = [['Сириус (Сүмбіле)', -16.72], ['Вега', 38.78], ['Альтаир', 8.87], ['Капелла', 46.0], ['Темірқазық', 89.26], ['Бетельгейзе', 7.41], ['Антарес', -26.43], ['Дубхе (Жетіқарақшы)', 61.75]];
const dm = x => { const s = x < 0 ? '−' : ''; x = Math.abs(x); let d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return s + d + '°' + String(m).padStart(2, '0') + '′'; };
function culm(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:380px"><svg></svg></div></div>
  <div class="ctl"><label>Қала<select id="u-c">${CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('')}<option value="-1">Солтүстік полюс</option><option value="-2">Экватор</option></select></label>
  <label>Ендік φ = <b id="u-fv"></b><input type="range" id="u-f" min="-90" max="90" step="0.05"></label>
  <label>Жұлдыз<select id="u-s">${STARS.map((s, i) => `<option value="${i}">${s[0]}</option>`).join('')}</select></label>
  <label>Еңістік δ = <b id="u-dv"></b><input type="range" id="u-d" min="-90" max="90" step="0.05"></label>
  <div class="out"><div><small>Жоғарғы шарықтау</small><b id="u-h1"></b></div><div><small>Төменгі шарықтау</small><b id="u-h2"></b></div></div>
  <div class="note" id="u-st"></div></div></div>`;
  const $ = s => h.querySelector(s), svg = h.querySelector('svg');
  let phi = 43.24, del = -16.72;
  const draw = () => {
    const W = svg.clientWidth, H = svg.clientHeight; if (!W) return;
    const cx = W / 2, cy = H / 2 + 6, R = Math.min(W / 2 - 54, H / 2 - 36);
    const pt = (th, r = R) => [cx + r * Math.cos(th * Math.PI / 180), cy - r * Math.sin(th * Math.PI / 180)];
    const tU = 90 - phi + del, tL = 270 - phi - del, tP = 180 - phi, tE = 90 - phi;
    const [ux, uy] = pt(tU), [lx, ly] = pt(tL), [px, py] = pt(tP), [qx, qy] = pt(tP + 180), [ex, ey] = pt(tE), [fx, fy] = pt(tE + 180);
    const hU = 90 - Math.abs(phi - del), hL = Math.abs(phi + del) - 90;
    let seg = '';
    if (hU > 0 && hL < 0) { const ix = ux + (lx - ux) * (cy - uy) / (ly - uy); seg = `<line x1="${ux}" y1="${uy}" x2="${ix}" y2="${cy}" stroke="${C.gold}" stroke-width="4"/>`; }
    else if (hL >= 0) seg = `<line x1="${ux}" y1="${uy}" x2="${lx}" y2="${ly}" stroke="${C.gold}" stroke-width="4"/>`;
    svg.innerHTML = `<rect x="0" y="${cy}" width="${W}" height="${H - cy}" fill="#0b2a22" opacity=".55"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
      <line x1="${cx - R - 20}" y1="${cy}" x2="${cx + R + 20}" y2="${cy}" stroke="${C.ok}" stroke-width="2"/>
      <line x1="${qx}" y1="${qy}" x2="${px}" y2="${py}" stroke="${C.mut}" stroke-dasharray="5 5"/>
      <line x1="${ex}" y1="${ey}" x2="${fx}" y2="${fy}" stroke="${C.sky}" stroke-dasharray="3 4"/>
      <line x1="${ux}" y1="${uy}" x2="${lx}" y2="${ly}" stroke="${C.gold}" stroke-opacity=".35" stroke-width="2"/>${seg}
      <circle cx="${px}" cy="${py}" r="4" fill="${C.ink}"/><circle cx="${ux}" cy="${uy}" r="7" fill="${C.gold}"/><circle cx="${lx}" cy="${ly}" r="5" fill="${C.gold}" opacity=".6"/>
      <g font-size="13" font-family="Golos Text, sans-serif" paint-order="stroke" stroke="${C.bg}" stroke-width="4">
      <text x="${cx}" y="${cy - R - 10}" text-anchor="middle" fill="${C.ink}">Зенит</text>
      <text x="${cx + R + 8}" y="${cy - 8}" text-anchor="end" fill="${C.ok}">О</text><text x="${cx - R - 8}" y="${cy - 8}" fill="${C.ok}">С</text>
      <text x="${px + (px < cx ? -8 : 8)}" y="${py - 8}" text-anchor="${px < cx ? 'end' : 'start'}" fill="${C.ink}">Дүние полюсі</text>
      <text x="${ex + (ex > cx ? 8 : -8)}" y="${ey + 16}" text-anchor="${ex > cx ? 'start' : 'end'}" fill="${C.sky}">экватор</text>
      <text x="${cx + 10}" y="${cy + 18}" fill="${C.ok}">көкжиек</text></g>`;
  };
  const calc = () => {
    $('#u-f').value = phi; $('#u-d').value = del; $('#u-fv').textContent = dm(phi); $('#u-dv').textContent = dm(del);
    const hU = 90 - Math.abs(phi - del), hL = Math.abs(phi + del) - 90;
    const side = del < phi ? 'зениттің оңтүстігінде' : del > phi ? 'зениттің солтүстігінде' : 'дәл зенитте';
    $('#u-h1').textContent = dm(hU); $('#u-h2').textContent = dm(hL);
    $('#u-st').innerHTML = hU <= 0 ? '<b>Бұл жұлдыз бұл ендікте ешқашан шықпайды.</b>' : hL >= 0 ? `<b>Жұлдыз батпайды</b> – тәулік бойы көкжиектен жоғары. Жоғарғы шарықтау ${side}, биіктігі ${dm(hU)}.` : `<b>Жұлдыз шығып-батады.</b> Жоғарғы шарықтау ${side}, биіктігі h = 90° − |φ − δ| = ${dm(hU)}.`;
    draw();
  };
  new ResizeObserver(draw).observe(svg);
  $('#u-c').onchange = e => { const i = +e.target.value; phi = i >= 0 ? CITIES[i][1] : i === -1 ? 90 : 0; calc(); };
  $('#u-s').onchange = e => { del = STARS[+e.target.value][1]; calc(); };
  $('#u-f').oninput = e => { phi = +e.target.value; calc(); };
  $('#u-d').oninput = e => { del = +e.target.value; calc(); };
  $('#u-c').value = 2; calc();
}

/* ---------- Уақыт ---------- */
function time(h) {
  const now = new Date(), hm = d => String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
  h.innerHTML = `<div class="lab"><div class="ctl"><label>Бүкіләлемдік уақыт (UTC, GMT)<input type="time" id="t-u" value="${hm(now)}"></label>
  <label>Қала<select id="t-c">${CITIES.map((c, i) => `<option value="${i}">${c[0]} (λ = ${num(c[2], 2)}°)</option>`).join('')}</select></label>
  <div class="out"><div><small>Белдеулік уақыт (UTC+5)</small><b id="t-z"></b></div><div><small>Жергілікті орташа күн уақыты</small><b id="t-l"></b></div><div><small>Айырмасы</small><b id="t-d"></b></div></div>
  <p class="small muted">T<sub>жерг</sub> = UT + λ/15°. 2024 жылғы 1 наурыздан бастап Қазақстанның бүкіл аумағы бір уақыт белдеуінде – UTC+5.</p>
  <div class="card"><b>Екі бойлықтың уақыт айырмасы</b><div class="grid g2" style="margin-top:10px"><label>λ₁, градус<input type="number" id="t-a" value="89.333" step="any"></label><label>λ₂, градус<input type="number" id="t-b" value="46.5" step="any"></label></div><div style="margin-top:8px">Δt = <b id="t-ab"></b></div></div></div>
  <div><div class="card"><b>Қазақстан қалаларындағы жергілікті уақыт</b><p class="small muted" style="margin:4px 0 10px">Жолақ – жергілікті уақыттың белдеулік уақыттан айырмасы (минут).</p><div id="t-rows"></div></div></div></div>` + code(`from datetime import datetime, timedelta, timezone

utc = datetime.now(timezone.utc)                 # бүкіләлемдік уақыт
cities = {'Орал': 51.37, 'Ақтөбе': 57.17, 'Астана': 71.43, 'Алматы': 76.89, 'Өскемен': 82.61}

zone = utc + timedelta(hours=5)                  # Қазақстан: UTC+5
print('Белдеулік уақыт:', zone.strftime('%H:%M'))
for city, lon in cities.items():
    local = utc + timedelta(hours=lon / 15)      # жергілікті орташа күн уақыты
    diff = (lon / 15 - 5) * 60
    print(f'{city:8s} {local:%H:%M:%S}   ({diff:+.0f} мин)')`);
  const $ = s => h.querySelector(s);
  const fmt = m => { m = ((m % 1440) + 1440) % 1440; const H = Math.floor(m / 60), M = Math.floor(m % 60), S = Math.round((m * 60) % 60); return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0') + ':' + String(S % 60).padStart(2, '0'); };
  const dur = m => { const s = m < 0 ? '−' : '+'; m = Math.abs(m); const H = Math.floor(m / 60), M = Math.floor(m % 60), S = Math.round((m * 60) % 60); return s + (H ? H + ' сағ ' : '') + M + ' мин' + (S ? ' ' + S + ' с' : ''); };
  const calc = () => {
    const [H, M] = ($('#t-u').value || '00:00').split(':').map(Number), ut = H * 60 + M, c = CITIES[+$('#t-c').value];
    $('#t-z').textContent = fmt(ut + 300).slice(0, 5); $('#t-l').textContent = fmt(ut + c[2] * 4); $('#t-d').textContent = dur(c[2] * 4 - 300);
    const d = Math.abs(parseFloat($('#t-a').value) - parseFloat($('#t-b').value)) * 4;
    $('#t-ab').textContent = Number.isFinite(d) ? dur(d).replace('+', '') : '—';
    const rows = [...CITIES].sort((a, b) => a[2] - b[2]);
    $('#t-rows').innerHTML = rows.map(r => { const off = r[2] * 4 - 300, w = Math.abs(off) / 100 * 50; return `<div class="row" style="flex-wrap:nowrap;margin:5px 0;gap:8px"><span style="width:6.6em;flex:none" class="small">${r[0]}</span><div style="flex:1;position:relative;height:12px;background:var(--bg2);border-radius:6px"><i style="position:absolute;top:0;bottom:0;${off < 0 ? 'right:50%' : 'left:50%'};width:${w}%;background:${off < 0 ? C.sky : C.gold};border-radius:6px"></i><i style="position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--mut)"></i></div><span class="small" style="width:4.4em;flex:none;text-align:right;white-space:nowrap">${fmt(ut + r[2] * 4).slice(0, 5)}</span></div>`; }).join('');
  };
  ['#t-u', '#t-c', '#t-a', '#t-b'].forEach(s => $(s).oninput = calc);
  calc();
}

/* ---------- Жұлдыздық шама ---------- */
function mag(h) {
  const S = [['Сириус', -1.46, 1.42], ['Вега', 0.03, 0.58], ['Бетельгейзе', 0.42, -5.85], ['Темірқазық', 1.98, -3.64], ['Алькор', 3.99, 2.0], ['Күн', -26.74, 4.83]];
  h.innerHTML = `<div class="lab"><div class="ctl"><div class="chips">${S.map((s, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${s[0]}</button>`).join('')}</div>
  <div class="grid g2"><label>Көрінерлік шама m<input type="number" id="m-m" step="0.01"></label><label>Абсолюттік шама M<input type="number" id="m-M" step="0.01"></label></div>
  <div class="out"><div><small>Қашықтық r = 10<sup>(m − M + 5)/5</sup></small><b id="m-r"></b></div><div><small>Жарық жылымен</small><b id="m-ly"></b></div><div><small>Жарқырауы L/L☉</small><b id="m-L"></b></div></div>
  <p class="small muted">m − M = 5·lg r − 5 (r – парсекпен). Күннің абсолюттік шамасы M☉ = 4,83, сондықтан L/L☉ = 10<sup>0,4·(4,83 − M)</sup>. Погсон: шамасы 1-ге кем жұлдыз 2,512 есе жарық.</p></div>
  <div class="card"><b>Шкалада салыстыру</b><p class="small muted">Сол жақ – жарығырақ (шама кіші).</p><div id="m-sc"></div></div></div>` + code(`import math

stars = {'Сириус': (-1.46, 1.42), 'Бетельгейзе': (0.42, -5.85),
         'Темірқазық': (1.98, -3.64), 'Алькор': (3.99, 2.0)}   # (m, M)

for name, (m, M) in stars.items():
    r = 10 ** ((m - M + 5) / 5)                  # парсек
    L = 10 ** (0.4 * (4.83 - M))                 # Күнмен салыстырғанда
    print(f'{name:11s} r = {r:7.1f} пк ({r*3.26:7.0f} ж.ж.)   L = {L:9.1f} L☉')

# Погсон формуласы: екі жұлдыздың жарықтық қатынасы
m1, m2 = -1.46, 3.99
print('Сириус Алькордан', round(2.512 ** (m2 - m1)), 'есе жарық көрінеді')`);
  const $ = s => h.querySelector(s);
  const calc = () => {
    const m = parseFloat($('#m-m').value), M = parseFloat($('#m-M').value), r = 10 ** ((m - M + 5) / 5);
    $('#m-r').textContent = r < 0.001 ? sci(r * 206265, 3) + ' а.б.' : num(r, 2) + ' пк'; $('#m-ly').textContent = num(r * 3.2616, r < 1 ? 5 : 1); $('#m-L').textContent = sci(10 ** (0.4 * (4.83 - M)), 2);
    const lo = -8, hi = 8, pos = x => (Math.max(lo, Math.min(hi, x)) - lo) / (hi - lo) * 100;
    $('#m-sc').innerHTML = `<div style="position:relative;height:96px;margin-top:12px"><div style="position:absolute;left:0;right:0;top:46px;height:2px;background:var(--line)"></div>
      <div style="position:absolute;left:${pos(m)}%;top:12px;transform:translateX(-50%);text-align:center" class="small"><span style="color:var(--sky2)">m = ${num(m, 2)}</span><div style="width:14px;height:14px;border-radius:50%;background:var(--sky);margin:6px auto 0"></div></div>
      <div style="position:absolute;left:${pos(M)}%;top:42px;transform:translateX(-50%);text-align:center" class="small"><div style="width:14px;height:14px;border-radius:50%;background:var(--gold);margin:0 auto 6px"></div><span style="color:var(--gold)">M = ${num(M, 2)}</span></div></div>
      <div class="row small muted" style="justify-content:space-between"><span>−8</span><span>0</span><span>+8</span></div>`;
  };
  const set = i => { $('#m-m').value = S[i][1]; $('#m-M').value = S[i][2]; calc(); };
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => set(+b.dataset.i));
  $('#m-m').oninput = calc; $('#m-M').oninput = calc; set(0);
}

/* ---------- Марстың ілмек қозғалысы ---------- */
function retro(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:430px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><button class="btn ghost" type="button" id="r-reset">Басынан</button></div></div>
  <div class="ctl"><p>Жоғарыда – Күн, Жер және Марс орбиталары (Коперник жүйесі). Төменгі жолақта – Жерден қарағанда Марстың жұлдыздар фонындағы орны. Жер Марсты басып озғанда (қарсы тұру кезінде) Марс біраз уақыт кері жылжиды – «ілмек» сызады.</p>
  <div class="out"><div><small>Уақыт</small><b id="r-t"></b></div><div><small>Марстың көрінерлік қозғалысы</small><b id="r-dir" style="white-space:normal;font-size:16px"></b></div></div>
  <p class="small muted">Ілмек айқын көрінуі үшін Марс орбитасының көлбеулігі (1,85°) 8 есе үлкейтілген. Марстың эклиптикалық бойлығы жолақтың ортасына келтірілген.</p></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  let t = 0, trail = [], prevL = null, dirTxt = '';
  const pos = tt => {
    const ae = 2 * Math.PI * tt, am = 2 * Math.PI * tt / 1.8808 + 0.9;
    const E = [Math.cos(ae), Math.sin(ae), 0], i = 1.85 * 8 * Math.PI / 180;
    const M = [1.524 * Math.cos(am), 1.524 * Math.sin(am) * Math.cos(i), 1.524 * Math.sin(am) * Math.sin(i)];
    const d = [M[0] - E[0], M[1] - E[1], M[2] - E[2]];
    return { E, M, L: Math.atan2(d[1], d[0]), B: Math.atan2(d[2], Math.hypot(d[0], d[1])) };
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const top = H * 0.62, cx = W / 2, cy = top / 2 + 6, R = Math.min(W / 2 - 20, top / 2 - 14) / 1.6;
    [1, 1.524].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r * R, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.25)'; ctx.stroke(); });
    const p = pos(t);
    dot(ctx, cx, cy, 8, C.gold, 16);
    const ex = cx + p.E[0] * R, ey = cy - p.E[1] * R, mx = cx + p.M[0] * R, my = cy - p.M[1] * R;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + (mx - ex) * 3, ey + (my - ey) * 3); ctx.strokeStyle = 'rgba(244,200,74,.45)'; ctx.stroke();
    dot(ctx, ex, ey, 5, '#4fb0ff'); dot(ctx, mx, my, 4.5, '#e0704a');
    label(ctx, 'Жер', ex + 8, ey - 6, C.mut, 'left', 12); label(ctx, 'Марс', mx + 8, my - 6, '#e0a080', 'left', 12);
    const y0 = top + 10, hh = H - y0 - 10;
    ctx.fillStyle = '#071c26'; ctx.fillRect(0, y0, W, hh);
    let s1 = 7; for (let k = 0; k < 60; k++) { s1 = s1 * 16807 % 2147483647; const x = s1 % 1000 / 1000 * W; s1 = s1 * 16807 % 2147483647; const y = y0 + s1 % 1000 / 1000 * hh; dot(ctx, x, y, 0.9, '#cfe'); }
    const Lc = p.L, mapX = (L) => { let d = L - Lc; d = Math.atan2(Math.sin(d), Math.cos(d)); return W / 2 + d / (Math.PI / 3) * W / 2; };
    const mapY = B => y0 + hh / 2 - B / 0.3 * (hh / 2 - 8);
    ctx.beginPath(); trail.forEach((q, j) => { const x = mapX(q.L), y = mapY(q.B); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = '#e0704a'; ctx.lineWidth = 2; ctx.stroke();
    dot(ctx, mapX(p.L), mapY(p.B), 5, '#ff9a70', 8);
    label(ctx, 'жұлдыздар фоны', 10, y0 + 18, C.mut, 'left', 12);
  };
  const st = canvas(fig, draw);
  const step = dt => {
    t += dt * 0.25; const p = pos(t); trail.push(p); if (trail.length > 900) trail.shift();
    if (prevL != null) { let d = p.L - prevL; d = Math.atan2(Math.sin(d), Math.cos(d)); dirTxt = d >= 0 ? 'тура (батыстан шығысқа)' : 'кері (ілмек)'; }
    prevL = p.L; $('#r-t').textContent = num(t * 12, 1) + ' ай'; $('#r-dir').textContent = dirTxt; draw(st);
  };
  for (let k = 0; k < 40; k++) step(0.05);
  const lp = loop(fig, step); playBtn(h, lp);
  $('#r-reset').onclick = () => { t = 0; trail = []; prevL = null; step(0); };
}

const MODELS = [
  { id: 'kepler', t: 'Кеплер заңдары: орбита', d: 'Эллипс, эксцентриситет, тең аудандар, T² = a³', f: kepler, l: [13, 14] },
  { id: 'solar', t: 'Күн жүйесі (3D көрініс)', d: 'Сегіз ғаламшардың нақты периодтармен қозғалысы', f: solar, l: [15, 16] },
  { id: 'gravity', t: 'Бүкіләлемдік тартылыс', d: 'F = G·m₁m₂/r², KazSat-3, Жер мен Ай', f: gravity, l: [4] },
  { id: 'cosmic', t: 'Ғарыштық жылдамдықтар', d: 'v₁, v₂, орбита биіктігі, период, геостационар орбита', f: cosmic, l: [6] },
  { id: 'parallax', t: 'Параллакс', d: 'Көкжиектік және жылдық параллакс, қашықтық пен өлшем', f: parallax, l: [14, 16] },
  { id: 'culm', t: 'Жұлдыздың шарықтау биіктігі', d: 'Ендік пен еңістік: h = 90° − φ + δ, батпайтын жұлдыздар', f: culm, l: [10] },
  { id: 'time', t: 'Жергілікті және белдеулік уақыт', d: 'UTC, UTC+5 және жергілікті орташа күн уақыты', f: time, l: [11] },
  { id: 'mag', t: 'Жұлдыздық шама және қашықтық', d: 'm, M және r байланысы, Погсон шкаласы', f: mag, l: [8] },
  { id: 'retro', t: 'Марстың ілмек тәрізді қозғалысы', d: 'Ғаламшарлардың көрінерлік қозғалысы', f: retro, l: [15] }
];
return { MODELS, solarScene, num, sci, CITIES, esc, code };
})();
