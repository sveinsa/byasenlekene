'use strict';
/* =====================================================================
   BYÅSENLEKENE MANGEKAMP  –  retro arkade-friidrett (Canvas, null avhengigheter)
   Deler: 1 Kjerne  2 Data/sprites/bakgrunn  3 Scener  4 Øvelser  5 Oppstart
   ===================================================================== */
const W = 400, H = 225;              /* logiske koordinater (spillogikken) */
const S = 3;                         /* tegneoppløsning: 3 x logisk = 1200 x 675 piksler */
const cv = document.getElementById('c');
cv.width = W * S; cv.height = H * S;
const g = cv.getContext('2d');
g.setTransform(S, 0, 0, S, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';

/* ---------- små hjelpere ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += Math.random(); return (u - 3) / 0.7071; };
const D2R = Math.PI / 180;
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
/* høyoppløselig lerret i logiske enheter (w x h), tegnes med x.scale(S) allerede satt */
function mkHi(w, h) { const c = mkCanvas(Math.ceil(w * S), Math.ceil(h * S)); const x = c.getContext('2d'); x.scale(S, S); x.imageSmoothingEnabled = true; return c; }
const blit = (img, x, y, w, h) => g.drawImage(img, x, y, w != null ? w : img.width / S, h != null ? h : img.height / S);
const fmt2 = v => (Math.round(v * 100) / 100).toFixed(2);
const fmtTime = s => s >= 60 ? Math.floor(s / 60) + ':' + (s % 60 < 9.995 ? '0' : '') + (s % 60).toFixed(2) : s.toFixed(2);
const fmtTime1 = s => s >= 60 ? Math.floor(s / 60) + ':' + (s % 60 < 9.95 ? '0' : '') + (s % 60).toFixed(1) : s.toFixed(1);
const store = {
  get(k, d) { try { const v = localStorage.getItem('byasen.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('byasen.' + k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------- farger (NES-aktig palett) ---------- */
const C = {
  black: '#0b0f1a', white: '#ffffff', ink: '#1a1c2c', grey: '#8b93a7', dgrey: '#4a5068',
  red: '#d8232a', dred: '#8e1620', track: '#c8553d', track2: '#b94a35', trackLine: '#f4e9dc',
  grass: '#3f9b4b', grass2: '#368a42', sand: '#e8cf8a', sand2: '#d4b86e',
  yellow: '#ffd23f', orange: '#f39c34', blue: '#2f6fdb', dblue: '#1c3f95', green: '#2ea558', pink: '#ff7aa8',
  sky1: '#4aa3e8', sky2: '#8fd0f5', sky3: '#c9ecfb', skin1: '#f1b78f', skin2: '#c98a5c', skin3: '#8d5a3a', skin4: '#e8a077'
};

/* ---------- tekst: moderne sportssendings-font (smal, kursiv, fet) ---------- */
const FONT_STACK = '"Barlow Condensed","Roboto Condensed","sans-serif-condensed","Arial Narrow","Helvetica Neue",Arial,sans-serif';
const fontFor = sc => 'italic 800 ' + (9.4 * sc).toFixed(1) + 'px ' + FONT_STACK;
let _mctx = null; const _twc = new Map();
const tw = (s, sc = 1) => {
  s = String(s).toUpperCase(); const k = sc + '|' + s; let v = _twc.get(k);
  if (v === undefined) {
    if (!_mctx) _mctx = document.createElement('canvas').getContext('2d');
    _mctx.font = fontFor(sc); try { _mctx.letterSpacing = (.35 * sc) + 'px'; } catch (e) { }
    v = _mctx.measureText(s).width; if (_twc.size > 800) _twc.clear(); _twc.set(k, v);
  }
  return v;
};
/* tegn tekst i valgfri kontekst. y = toppen av tekstlinjen, x etter justering l/c/r */
function T(ctx, s, x, y, col = C.white, sc = 1, al = 'l', sh = C.black) {
  s = String(s).toUpperCase();
  ctx.save();
  ctx.font = fontFor(sc); try { ctx.letterSpacing = (.35 * sc) + 'px'; } catch (e) { }
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = al === 'c' ? 'center' : al === 'r' ? 'right' : 'left';
  const by = y + 7.9 * sc, ox = al === 'c' ? .17 * sc : 0;
  if (sh) { ctx.fillStyle = sh === C.black ? 'rgba(0,0,0,.6)' : sh; ctx.fillText(s, x + ox + .45 * sc, by + .55 * sc); }
  ctx.fillStyle = col; ctx.fillText(s, x + ox, by);
  ctx.restore();
}
const txt = (s, x, y, col, sc, al, sh) => T(g, s, x, y, col, sc, al, sh);
function box(ctx, x, y, w, h, fill, border) {
  if (border) { ctx.fillStyle = border; ctx.fillRect(x - 1, y - 1, w + 2, h + 2); }
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}
function disc(ctx, cx, cy, r, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, Math.max(.5, r), 0, 6.2832); ctx.fill();
}
/* kapsel-linje med runde ender */
function pline(ctx, x0, y0, x1, y1, th, col) {
  ctx.strokeStyle = col; ctx.lineWidth = th; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}
/* skrå «sendingsbånd»: parallellogram med skråkant sk til høyre */
function slant(ctx, x, y, w, h, sk, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x + sk, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - sk, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
}
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ---------- input: tastatur + touch ---------- */
const Clk = { now: () => performance.now() };
const Input = {
  down: {}, hit: {}, rel: {},
  ts: 0, tap: null,
  press(k) { if (!this.down[k]) { this.down[k] = 1; this.hit[k] = 1; this.ts = Clk.now(); } },
  release(k) { if (this.down[k]) { this.down[k] = 0; this.rel[k] = 1; } },
  end() { this.hit = {}; this.rel = {}; this.tap = null; },
  clear() { this.hit = {}; this.rel = {}; this.tap = null; },
  releaseAll() { for (const k in this.down) if (this.down[k]) this.release(k); }
};
const KEYMAP = {
  ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r',
  KeyZ: 'a', Space: 'a', Enter: 'a', KeyJ: 'a', KeyX: 'b', KeyK: 'b', Backspace: 'b', ShiftLeft: 'b', ShiftRight: 'b',
  ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', Escape: 'p', KeyP: 'p', KeyM: 'm'
};
addEventListener('keydown', e => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  Snd.init();
  if (!e.repeat) Input.press(k);
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) { e.preventDefault(); Input.release(k); } });
addEventListener('blur', () => { Input.releaseAll(); if (typeof Game !== 'undefined' && Game.pause) Game.pause(true); });
/* ---- touch: knapper (A/B/piler) + stort LØP-felt som veksler automatisk mellom venstre/høyre ---- */
const $ = id => document.getElementById(id);
document.querySelectorAll('[data-k]').forEach(el => {
  const k = el.dataset.k;
  const dn = e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { } el.classList.add('on'); Snd.init(); Input.press(k); };
  const up = e => { e.preventDefault(); el.classList.remove('on'); Input.release(k); };
  el.addEventListener('pointerdown', dn);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => el.addEventListener(n, up));
  el.addEventListener('contextmenu', e => e.preventDefault());
});
const TUI = {
  last: '', tog: 0,
  /* hver scene kan ha ctl = { pad: 'nav'|'run'|'a'|'none', a: 'tekst', b: 'tekst', pl: 'tekst på feltet' } */
  sync(sc) {
    const def = { pad: 'nav', a: 'OK', b: 'TILBAKE' };
    const c = (typeof Game !== 'undefined' && Game.paused) ? { pad: 'none', a: 'FORTSETT', b: 'AVSLUTT' } : ((sc && (typeof sc.ctl === 'function' ? sc.ctl() : sc.ctl)) || def);
    const key = c.pad + '|' + (c.a || '') + '|' + (c.b || '') + '|' + (c.pl || '');
    if (key === this.last) return;
    this.last = key;
    const b = document.body;
    b.dataset.pad = c.pad; b.dataset.b = c.b ? '1' : '0';
    $('aLab').textContent = c.a || ''; $('bLab').textContent = c.b || '';
    $('runLab').textContent = c.pl || (c.pad === 'a' ? 'TRYKK' : 'LØP'); $('runSub').textContent = c.pad === 'a' ? '' : 'TRYKK RASKT';
  }
};
{
  const pad = $('runpad');
  pad.addEventListener('pointerdown', e => {
    e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (_) { }
    pad.classList.add('on'); Snd.init();
    const k = document.body.dataset.pad === 'a' ? 'a' : ((TUI.tog ^= 1) ? 'l' : 'r');
    Input.press(k); setTimeout(() => Input.release(k), 45);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => pad.addEventListener(n, () => pad.classList.remove('on')));
  pad.addEventListener('contextmenu', e => e.preventDefault());
  /* trykk direkte på lerretet (menyvalg) */
  cv.addEventListener('pointerdown', e => {
    Snd.init();
    const r = cv.getBoundingClientRect();
    Input.tap = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  });
}
const isTouch = () => document.body.classList.contains('touch');
{
  const touchy = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (touchy) document.body.classList.add('touch');
  addEventListener('touchstart', () => { if (!isTouch()) { document.body.classList.add('touch'); resize(); } }, { once: true, passive: true });
}
/* layout: på mobil får kontrollene egne felt (sidene i liggende, under spillet i stående) – ingenting dekker banen */
function resize() {
  const iw = innerWidth, ih = innerHeight, b = document.body, touch = isTouch(), land = iw >= ih;
  b.classList.toggle('land', land); b.classList.toggle('port', !land);
  const tc = $('touch'), px = v => Math.round(v) + 'px';
  let cw, ch, cl, ct;
  const mini = (id, x, y) => { const el = $(id); el.style.left = px(x); el.style.top = px(y); };
  if (!touch) {
    const s = Math.min(iw / W, ih / H); cw = W * s; ch = H * s; cl = (iw - cw) / 2; ct = (ih - ch) / 2;
    mini('bMute', iw - 42, 6); mini('bFs', iw - 84, 6); $('bPause').style.display = 'none'; $('hint').style.display = 'none';
  } else if (land) {
    const gut = clamp(iw * .13, 88, 190), s = Math.min((iw - 2 * gut) / W, ih / H);
    cw = W * s; ch = H * s; cl = (iw - cw) / 2; ct = (ih - ch) / 2;
    const gw = cl, sz = Math.min(gw * .8, ih * .27, 124);
    $('zL').style.cssText = `left:0;top:0;width:${px(gw)};height:${px(ih)}`;
    $('zR').style.cssText = `left:${px(iw - gw)};top:0;width:${px(gw)};height:${px(ih)}`;
    tc.style.setProperty('--s', px(sz)); tc.style.setProperty('--pw', px(gw * .86)); tc.style.setProperty('--ph', px(Math.min(ih * .72, 330)));
    const mx = iw - gw / 2 - 17;
    mini('bMute', mx, 8); mini('bFs', mx, 50); mini('bPause', mx, 92); $('bPause').style.display = 'flex'; $('hint').style.display = 'none';
  } else {
    cw = iw; ch = Math.min(iw * H / W, ih * .5); cw = ch * W / H; cl = (iw - cw) / 2; ct = 0;
    const top = ch + 26, zh = ih - top, sz = Math.min(iw * .27, zh * .3, 132);
    $('zL').style.cssText = `left:0;top:${px(top)};width:${px(iw / 2)};height:${px(zh)}`;
    $('zR').style.cssText = `left:${px(iw / 2)};top:${px(top)};width:${px(iw / 2)};height:${px(zh)}`;
    tc.style.setProperty('--s', px(sz)); tc.style.setProperty('--pw', px(iw * .44)); tc.style.setProperty('--ph', px(Math.min(zh * .8, 260)));
    mini('bMute', iw - 42, ch + 4); mini('bFs', iw - 84, ch + 4); mini('bPause', iw - 126, ch + 4); $('bPause').style.display = 'flex';
    const h = $('hint'); h.style.display = 'block'; h.style.top = px(ch + 6); h.style.right = px(136); h.style.left = '0';
  }
  cv.style.width = px(cw); cv.style.height = px(ch); cv.style.left = px(cl); cv.style.top = px(ct);
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));
document.addEventListener('fullscreenchange', () => setTimeout(resize, 80));
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
