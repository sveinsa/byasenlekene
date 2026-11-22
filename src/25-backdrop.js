/* =====================================================================
   DEL 2b: BAKGRUNN (semi-3D, vektor) – Dalgård idrettspark med Byåsen, Tyholttårnet og fjorden
   Lagdelt parallakse (fjell → åser → skog → stadion → publikum → skilt → gress) + atmosfærisk dybde.
   Alt tegnes i logiske koordinater på høyoppløselige lerret (S x), så det er skarpt og glatt.
   ===================================================================== */
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pick2(R, a) { return a[Math.floor(R() * a.length)]; }
const BG = {};
const BGW = 640, GROUND_Y = 118, BASE_Y = 102;
const lgrad = (x, y0, y1, stops) => { const gr = x.createLinearGradient(0, y0, 0, y1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
const rgrad = (x, cx, cy, r0, r1, stops) => { const gr = x.createRadialGradient(cx, cy, r0, cx, cy, r1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
const rect = (x, c, xx, yy, w, h) => { x.fillStyle = c; x.fillRect(xx, yy, w, h); };
const poly = (x, c, pts) => { x.fillStyle = c; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); x.fill(); };
/* kule med skyggelegging (3D-følelse) */
function ball(x, cx, cy, r, c, hi = .3) {
  x.fillStyle = rgrad(x, cx - r * .35, cy - r * .4, r * .1, r * 1.05, [[0, shade(c, 1 + hi)], [.6, c], [1, shade(c, .62)]]);
  x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); x.fill();
}
function softCloud(w, h, seed) {
  const c = mkHi(w, h), x = c.getContext('2d'), R = mulberry(seed), n = 8;
  for (let i = 0; i < n; i++) {
    const px = w * .15 + R() * w * .7, py = h * .55 + (R() - .5) * h * .25, r = h * (.22 + R() * .26);
    x.fillStyle = rgrad(x, px, py - r * .3, r * .1, r, [[0, 'rgba(255,255,255,.96)'], [.6, 'rgba(250,252,255,.85)'], [1, 'rgba(210,225,242,.0)']]);
    x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill();
  }
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = lgrad(x, 0, h, [[0, 'rgba(255,255,255,0)'], [.6, 'rgba(190,210,235,.0)'], [1, 'rgba(150,175,210,.55)']]); x.fillRect(0, 0, w, h);
  return c;
}
function spruce(x, tx, by, h, dark, lit) {
  const w = h * .42;
  x.fillStyle = '#3a2a1a'; x.fillRect(tx - .6, by - h * .12, 1.2, h * .12);
  for (let k = 0; k < 4; k++) {
    const y1 = by - h * .1 - k * h * .24, ww = w * (1 - k * .2), th = h * .34;
    poly(x, dark, [[tx - ww / 2, y1], [tx + ww / 2, y1], [tx, y1 - th]]);
    poly(x, lit, [[tx, y1 - th], [tx + ww / 2, y1], [tx + ww * .08, y1]]);
  }
}
function birch(x, tx, by, h, R) {
  x.fillStyle = '#e9e6dc'; x.fillRect(tx - .7, by - h * .5, 1.4, h * .5);
  x.fillStyle = '#4a4a46'; for (let k = 0; k < 3; k++) x.fillRect(tx - .7, by - h * (.1 + k * .13), 1.4, .8);
  const cr = h * (.2 + R() * .06), cy = by - h * .66;
  ball(x, tx, cy, cr, '#4f8c3a', .35); ball(x, tx + cr * .55, cy + cr * .2, cr * .7, '#5da043', .3); ball(x, tx - cr * .6, cy + cr * .25, cr * .65, '#417a31', .25);
}
function houseG(x, hx, hy, w, h, wall, roof, lit) {
  rect(x, wall, hx, hy, w, h); rect(x, 'rgba(0,0,0,.2)', hx + w * .7, hy, w * .3, h);
  poly(x, roof, [[hx - .6, hy], [hx + w * .5, hy - h * .6], [hx + w + .6, hy]]);
  if (lit) rect(x, '#ffe9a0', hx + w * .2, hy + h * .3, w * .2, h * .3);
}
function mast(x, mx, base, top) {
  x.fillStyle = lgrad(x, top, base, [[0, '#cfd5df'], [1, '#7d8592']]);
  x.fillRect(mx - 1.2, top + 10, 1.1, base - top - 10); x.fillRect(mx + 3.6, top + 10, 1.1, base - top - 10);
  x.strokeStyle = '#aab1bd'; x.lineWidth = .6; x.beginPath();
  for (let yy = top + 10; yy < base - 6; yy += 6) { x.moveTo(mx - .6, yy); x.lineTo(mx + 4.2, yy + 6); x.moveTo(mx + 4.2, yy); x.lineTo(mx - .6, yy + 6); }
  x.stroke();
  poly(x, '#444a58', [[mx - 7, top], [mx + 10, top], [mx + 11, top + 3], [mx - 8, top + 3]]);
  rect(x, '#2a2e38', mx - 8, top + 3, 19, 8);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { rect(x, '#f2f5ff', mx - 7 + k * 4.6, top + 4 + r * 3.6, 3.4, 2.8); }
  rect(x, '#5a606c', mx - 2.5, base - 3, 8, 3);
}
function teardropFlag(x, fx, base, h) {
  x.fillStyle = lgrad(x, base - h, base, [[0, '#f4f5f8'], [1, '#b9bec8']]); x.fillRect(fx - .5, base - h - 5, 1.2, h + 5);
  x.beginPath(); x.moveTo(fx + .6, base - h - 2);
  x.bezierCurveTo(fx + 16, base - h + 2, fx + 14, base - h + 22, fx + 1, base - h + 30);
  x.lineTo(fx + .6, base - h - 2); x.closePath();
  x.fillStyle = rgrad(x, fx + 6, base - h + 8, 2, 18, [[0, '#f03a40'], [1, '#a81820']]); x.fill();
  ball(x, fx + 6.4, base - h + 9, 3.6, '#ffffff', .05); ball(x, fx + 6.4, base - h + 9, 2.5, '#1c2a63', .25); rect(x, '#d8232a', fx + 5, base - h + 8.5, 3, 1);
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(fx, base, 5, 1, 0, 0, 6.2832); x.fill();
}
function noFlag(x, fx, base, h = 38) {
  x.fillStyle = lgrad(x, base - h, base, [[0, '#f4f5f8'], [1, '#b9bec8']]); x.fillRect(fx - .5, base - h, 1.2, h);
  const fw = 17, fh = 11, fy = base - h + .5;
  rect(x, '#c8102e', fx + .7, fy, fw, fh); rect(x, '#ffffff', fx + 5.2, fy, 3.6, fh); rect(x, '#ffffff', fx + .7, fy + 3.7, fw, 3.6);
  rect(x, '#00205b', fx + 6.2, fy, 1.6, fh); rect(x, '#00205b', fx + .7, fy + 4.7, fw, 1.6);
  x.fillStyle = lgrad(x, fy, fy + fh, [[0, 'rgba(255,255,255,.18)'], [1, 'rgba(0,0,0,.2)']]); x.fillRect(fx + .7, fy, fw, fh);
}
function tentG(x, tx, by) {
  [1, 41].forEach(o => rect(x, '#e8eaf0', tx + o, by - 18, 1.2, 18));
  x.fillStyle = lgrad(x, by - 28, by - 17, [[0, '#2a64d4'], [1, '#12388a']]);
  poly(x, x.fillStyle, [[tx - 2, by - 17], [tx + 6, by - 27], [tx + 38, by - 27], [tx + 46, by - 17]]);
  poly(x, 'rgba(255,255,255,.18)', [[tx + 6, by - 27], [tx + 38, by - 27], [tx + 36, by - 24], [tx + 8, by - 24]]);
  rect(x, '#16449f', tx - 2, by - 17, 48, 4); rect(x, '#ffffff', tx - 2, by - 13.4, 48, .9);
  rect(x, 'rgba(0,0,0,.25)', tx + 2, by - 13, 40, 13);
  /* folk i teltet */
  ball(x, tx + 11, by - 10, 1.8, '#e8c9a0', .1); rect(x, '#2a3150', tx + 9.6, by - 8.4, 2.8, 8);
  ball(x, tx + 27, by - 10, 1.8, '#c98a5c', .1); rect(x, '#4a3a6a', tx + 25.6, by - 8.4, 2.8, 8);
  rect(x, '#f2f2f2', tx + 4, by - 6, 36, 1.8);
}
function containerG(x, cx, by) {
  x.fillStyle = lgrad(x, by - 14, by, [[0, '#b7bdc7'], [1, '#7b828e']]); x.fillRect(cx, by - 14, 30, 14);
  x.strokeStyle = 'rgba(60,66,78,.5)'; x.lineWidth = .5; x.beginPath(); for (let i = 0; i < 9; i++) { x.moveTo(cx + 2 + i * 3, by - 13); x.lineTo(cx + 2 + i * 3, by - 2); } x.stroke();
  rect(x, '#4a5a74', cx + 20, by - 10, 6, 4); rect(x, 'rgba(255,255,255,.5)', cx + 20, by - 10, 6, 1); rect(x, '#6a717c', cx + 4, by - 12, 8, 10);
  rect(x, 'rgba(0,0,0,.25)', cx, by - 1.4, 30, 1.4);
}
function hallG(x, hx, by) {
  const w = 128, h = 28, y0 = by - h, d = 7;
  /* sidevegg i skygge (dybde) */
  poly(x, '#6a1d17', [[hx - d, y0 + 3], [hx, y0], [hx, by], [hx - d, by - 2]]);
  /* front */
  x.fillStyle = lgrad(x, y0, by, [[0, '#b9392f'], [1, '#8e2a22']]); x.fillRect(hx, y0, w, h);
  x.strokeStyle = 'rgba(70,16,12,.35)'; x.lineWidth = .5; x.beginPath(); for (let i = 0; i < w; i += 3.5) { x.moveTo(hx + i, y0); x.lineTo(hx + i, by); } x.stroke();
  /* tak */
  poly(x, '#7d8492', [[hx - d - 2, y0 + 1], [hx - d + 5, y0 - 7], [hx + w + 2, y0 - 7], [hx + w + 3, y0 + 1]]);
  poly(x, '#a7adba', [[hx - d + 5, y0 - 7], [hx + w + 2, y0 - 7], [hx + w + 1, y0 - 5.5], [hx - d + 3.6, y0 - 5.5]]);
  rect(x, '#5b616e', hx - 1, y0, w + 2, 1.4);
  /* skiltbånd + vinduer */
  rect(x, '#f1f3f7', hx + 5, y0 + 5, w - 10, 12); rect(x, '#c8ccd6', hx + 5, y0 + 16, w - 10, 1);
  rect(x, '#2a63c8', hx + 8, y0 + 7, 5, 8); rect(x, '#f2c200', hx + 9, y0 + 9, 3, 2);
  T(x, 'DALGÅRD IDRETTSPARK', hx + 17, y0 + 6.6, '#2a2f3d', .9, 'l', null);
  for (let k = 0; k < 2; k++) { x.fillStyle = lgrad(x, by - 12, by - 3, [[0, '#8fb0d8'], [1, '#2a3a58']]); x.fillRect(hx + 10 + k * (w - 32), by - 12, 10, 9); }
  rect(x, 'rgba(0,0,0,.28)', hx, by - 2.4, w, 2.4);
  /* brakke */
  x.fillStyle = lgrad(x, by - 20, by, [[0, '#f2f3f5'], [1, '#c9ccd3']]); x.fillRect(hx + w + 4, by - 20, 26, 20);
  poly(x, '#9aa0ac', [[hx + w + 3, by - 20], [hx + w + 6, by - 23], [hx + w + 32, by - 23], [hx + w + 30, by - 20]]);
  rect(x, '#4a5a74', hx + w + 8, by - 14, 6, 5); rect(x, '#4a5a74', hx + w + 18, by - 14, 6, 5);
  rect(x, 'rgba(255,255,255,.4)', hx + w + 8, by - 14, 6, 1.2); rect(x, 'rgba(255,255,255,.4)', hx + w + 18, by - 14, 6, 1.2);
}
function banner(x, bx, by, w, h, label) {
  rect(x, '#d9dde4', bx, by - 4, 1.6, h + 22); rect(x, '#d9dde4', bx + w - 1.6, by - 4, 1.6, h + 22);
  x.fillStyle = lgrad(x, by, by + h, [[0, '#f03a40'], [1, '#b11a22']]); x.fillRect(bx + 1.6, by, w - 3.2, h);
  rect(x, 'rgba(255,255,255,.85)', bx + 1.6, by, w - 3.2, .8); rect(x, 'rgba(255,255,255,.5)', bx + 1.6, by + h - .8, w - 3.2, .8);
  T(x, label, bx + w / 2, by + (h - 7) / 2 + .3, '#ffffff', 1, 'c', 'rgba(70,0,8,.7)');
}
function buildBackdrop() {
  const R = mulberry(7);
  let c, x;
  /* ---- himmel: dag og solnedgang ---- */
  BG.sky = mkHi(W, GROUND_Y); x = BG.sky.getContext('2d');
  x.fillStyle = lgrad(x, 0, GROUND_Y, [[0, '#1f78d6'], [.45, '#5eb0ee'], [.8, '#b7e2fa'], [1, '#e6f6ff']]); x.fillRect(0, 0, W, GROUND_Y);
  BG.skyD = mkHi(W, GROUND_Y); x = BG.skyD.getContext('2d');
  x.fillStyle = lgrad(x, 0, GROUND_Y, [[0, '#07164f'], [.35, '#233a8c'], [.6, '#7a4fa0'], [.8, '#e8786a'], [1, '#ffc58a']]); x.fillRect(0, 0, W, GROUND_Y);
  x.fillStyle = rgrad(x, 300, 112, 2, 120, [[0, 'rgba(255,230,170,.85)'], [.3, 'rgba(255,170,110,.35)'], [1, 'rgba(255,120,80,0)']]); x.fillRect(0, 0, W, GROUND_Y);
  BG.clouds = [softCloud(90, 28, 3), softCloud(66, 20, 11), softCloud(108, 30, 29)];
  BG.cloudsD = [softCloud(90, 28, 5), softCloud(70, 20, 17)];
  BG.cloudsD.forEach(cc => { const q = cc.getContext('2d'); q.globalCompositeOperation = 'source-atop'; q.fillStyle = 'rgba(255,140,110,.55)'; q.fillRect(0, 0, 200, 60); });
  /* ---- fjerne fjell, fjord, by og Tyholttårnet ---- */
  const TAU = Math.PI * 2;
  BG.far = mkHi(BGW, 66); x = BG.far.getContext('2d');
  const rA = px => 22 + Math.sin(px / BGW * TAU * 2 + .4) * 9 + Math.sin(px / BGW * TAU * 5 + 1) * 4 + Math.sin(px / BGW * TAU * 11) * 1.3;
  const rB = px => 33 + Math.sin(px / BGW * TAU * 3 + 2) * 5 + Math.sin(px / BGW * TAU * 8) * 2;
  const ridge = (fn, c0, c1, bottom) => { x.beginPath(); x.moveTo(0, bottom); for (let px = 0; px <= BGW; px += 2) x.lineTo(px, fn(px)); x.lineTo(BGW, bottom); x.closePath(); x.fillStyle = lgrad(x, 8, bottom, [[0, c0], [1, c1]]); x.fill(); };
  ridge(rA, '#c9dcec', '#a5c1db', 66); ridge(rB, '#9fbad4', '#86a6c6', 66);
  /* snø/lys på toppene */
  x.fillStyle = 'rgba(255,255,255,.35)'; for (let px = 0; px < BGW; px += 2) if (rA(px) < 17) x.fillRect(px, rA(px), 2, 1.6);
  /* fjord */
  x.fillStyle = lgrad(x, 40, 66, [[0, '#9fc8e6'], [1, '#6fa6d0']]); x.fillRect(0, 42, BGW, 24);
  x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = .6; x.beginPath(); for (let i = 0; i < 70; i++) { const px = R() * BGW, py = 44 + R() * 18, w = 6 + R() * 16; x.moveTo(px, py); x.lineTo(px + w, py); } x.stroke();
  /* byen langs vannkanten */
  for (let i = 0; i < 110; i++) { const bw = 2 + R() * 3.4, bh = 2 + R() * 6, bx = R() * BGW; rect(x, pick2(R, ['#e1dacd', '#cdbfae', '#ede6da', '#bfaea0', '#d6c9b8']), bx, 45 - bh, bw, bh); rect(x, 'rgba(0,0,0,.14)', bx + bw * .7, 45 - bh, bw * .3, bh); }
  rect(x, '#7f9ab0', 0, 45, BGW, 1.2);
  /* Tyholttårnet */
  poly(x, '#aab3bf', [[299.2, 46], [300.8, 46], [300.4, 10], [299.6, 10]]); rect(x, '#d9dee6', 299.3, 10, .5, 36);
  poly(x, '#d1d6df', [[295, 14], [305, 14], [303.6, 19], [296.4, 19]]); rect(x, '#8d97a5', 296, 19, 8, 1.6); rect(x, '#dfe4ea', 296.6, 12.8, 6.8, 1.2);
  rect(x, '#aab3bf', 300, 2, .6, 9); rect(x, '#e02a30', 299.9, 1.2, 1, 1);
  x.fillStyle = '#2a3a58'; for (let k = 0; k < 6; k++) x.fillRect(296.6 + k * 1.1, 15.2, .7, 1.4);
  /* ---- Byåsen-åsen: skråning med jorder, hus og skog ---- */
  BG.mid = mkHi(BGW, 64); x = BG.mid.getContext('2d');
  const rm = px => 24 + Math.sin(px / BGW * TAU + .5) * 7 + Math.sin(px / BGW * TAU * 3) * 3.4 + Math.sin(px / BGW * TAU * 7) * 1.1;
  x.beginPath(); x.moveTo(0, 64); for (let px = 0; px <= BGW; px += 2) x.lineTo(px, rm(px)); x.lineTo(BGW, 64); x.closePath();
  x.fillStyle = lgrad(x, 14, 64, [[0, '#4c9a52'], [.5, '#3c8444'], [1, '#2c6a38']]); x.fill();
  for (let i = 0; i < 26; i++) { const px = R() * BGW, py = rm(px) + 6 + R() * 26, w = 12 + R() * 30; x.fillStyle = pick2(R, ['rgba(194,190,96,.55)', 'rgba(120,176,84,.5)', 'rgba(80,140,70,.5)']); x.beginPath(); x.ellipse(px, py, w, 2.4 + R() * 3, 0, 0, TAU); x.fill(); }
  for (let i = 0; i < 40; i++) { const px = 4 + R() * (BGW - 14), py = rm(px) + 10 + R() * 22; houseG(x, px, py, 5 + R() * 3, 3 + R() * 2, pick2(R, ['#efe3c4', '#f0c36d', '#d9d2c3', '#b8412c', '#f2f2f2']), pick2(R, ['#7a2e22', '#4a4f66', '#8e1620', '#3a3d4a']), R() < .5); }
  for (let i = 0; i < 6; i++) { const px = 420 + R() * 190, py = rm(px) + 22 + R() * 8; rect(x, '#e9e6df', px, py, 12, 7); rect(x, 'rgba(0,0,0,.15)', px + 9, py, 3, 7); rect(x, '#7d8592', px - 1, py - 1.4, 14, 1.4); for (let k = 0; k < 4; k++) rect(x, '#8aa0c0', px + 1 + k * 3, py + 2, 1.2, 2); }
  for (let px = 2; px < BGW - 2; px += 2.6 + R() * 2.4) spruce(x, px, rm(px) + 3, 9 + R() * 6, pick2(R, ['#15401f', '#1a4829']), pick2(R, ['#2e7040', '#2a6636']));
  for (let i = 0; i < 70; i++) { const px = 3 + R() * (BGW - 6); spruce(x, px, rm(px) + 14 + R() * 38, 7 + R() * 5, '#133820', '#2a6336'); }
  /* ---- tretopper bak banen ---- */
  BG.trees = mkHi(BGW, 46); x = BG.trees.getContext('2d');
  for (let i = 0; i < 72; i++) {
    const px = 8 + R() * (BGW - 16), hh = 16 + R() * 16, by = 44;
    if (R() < .45) spruce(x, px, by, hh, '#124020', '#2a6a34'); else birch(x, px, by, hh, R);
  }
  x.fillStyle = lgrad(x, 30, 46, [[0, 'rgba(10,40,20,0)'], [1, 'rgba(10,40,20,.5)']]); x.fillRect(0, 30, BGW, 16);
  /* ---- stadion: gjerde, flagg, master, telt, container, hall (baseline = BASE_Y) ---- */
  BG.near = mkHi(BGW, BASE_Y + 4); x = BG.near.getContext('2d');
  /* bakre vegg/hekk */
  x.fillStyle = lgrad(x, 86, BASE_Y, [[0, '#3f7a4c'], [1, '#2b5a38']]); x.fillRect(0, 90, BGW, BASE_Y - 90);
  for (let px = 0; px < BGW; px += 3) { ball(x, px + 1.5, 90 + R() * 2, 2.6, pick2(R, ['#3f7a4c', '#4b8a56', '#35703f']), .25); }
  x.strokeStyle = 'rgba(220,235,226,.4)'; x.lineWidth = .5; x.beginPath(); for (let py = 92; py < BASE_Y - 1; py += 2.4) { x.moveTo(0, py); x.lineTo(BGW, py); } x.stroke();
  x.fillStyle = '#6a7684'; for (let px = 0; px < BGW; px += 16) x.fillRect(px, 88, 1, BASE_Y - 88);
  noFlag(x, 14, BASE_Y - 2); mast(x, 48, BASE_Y - 2, 6); teardropFlag(x, 96, BASE_Y - 2, 32); tentG(x, 128, BASE_Y - 2);
  containerG(x, 190, BASE_Y - 2); containerG(x, 220, BASE_Y - 2); rect(x, '#cfd2d8', 190, 84, 60, 1.2);
  teardropFlag(x, 266, BASE_Y - 2, 32); mast(x, 304, BASE_Y - 2, 6); banner(x, 336, 72, 112, 14, 'BYÅSENLEKENE');
  hallG(x, 476, BASE_Y - 2); mast(x, 618, BASE_Y - 2, 6); noFlag(x, 632, BASE_Y - 2, 36);
  BG.masts = [48, 304, 618];
  /* ---- publikum (to lag som hopper om hverandre) ---- */
  const jackets = ['#1c2a63', '#d8232a', '#1c2a63', '#d4e82a', '#2f66d0', '#8b93a7', '#ffffff', '#3a3f4a', '#e8a032', '#d8232a'];
  const crowd = ph => {
    const cc = mkHi(BGW, 24), q = cc.getContext('2d'), Rr = mulberry(40 + ph);
    for (let gI = 0; gI < 20; gI++) {
      const gx = 4 + Rr() * (BGW - 44), n = 2 + Math.floor(Rr() * 4);
      for (let i = 0; i < n; i++) {
        const px = gx + i * 4.2 + Rr() * 2, hh = 8 + Rr() * 3, by = 23, jc = pick2(Rr, jackets);
        rect(q, '#272c42', px, by - 3.2, 3.2, 3.2);
        q.fillStyle = lgrad(q, by - hh + 3, by - 2, [[0, shade(jc, 1.15)], [1, shade(jc, .72)]]); rrect(q, px - .2, by - hh + 3, 3.6, hh - 5, 1); q.fill();
        ball(q, px + 1.6, by - hh + 1.6, 1.7, pick2(Rr, ['#e8c9a0', '#d8b088', '#c98a5c', '#8d5a3a']), .15);
        q.fillStyle = pick2(Rr, ['#3a2a1a', '#b08a52', '#1a1a1a', '#d9b45a', '#7a3b1e']); q.beginPath(); q.arc(px + 1.6, by - hh + 1.1, 1.75, Math.PI, 0); q.fill();
      }
    }
    return cc;
  };
  BG.peopleA = crowd(0); BG.peopleB = crowd(7);
  /* ---- reklameskilt (glanset) ---- */
  BG.boards = mkHi(BGW, 17); x = BG.boards.getContext('2d');
  const defs = [['SPONSOR 1', '#1a3f8f', '#ffffff'], ['SPONSOR 2', '#f2c200', '#222222'], ['SPONSOR 3', '#1f8f4a', '#ffffff'], ['BYÅSEN IL', '#d8232a', '#ffffff'], ['SPONSOR 1', '#1a3f8f', '#ffffff'], ['SPONSOR 2', '#f2c200', '#222222'], ['SPONSOR 3', '#1f8f4a', '#ffffff'], ['BYÅSEN IL', '#d8232a', '#ffffff'], ['SPONSOR 1', '#1a3f8f', '#ffffff'], ['SPONSOR 2', '#f2c200', '#222222']];
  defs.forEach((b, i) => {
    const bx = i * 64;
    rect(x, '#10131f', bx, 0, 64, 14);
    x.fillStyle = lgrad(x, 0, 14, [[0, shade(b[1], 1.3)], [.5, b[1]], [1, shade(b[1], .7)]]); x.fillRect(bx + .8, .8, 62.4, 12.4);
    T(x, b[0], bx + 32 + (b[0] === 'BYÅSEN IL' ? 4 : 0), 3.2, b[2], 1, 'c', null);
    if (b[0] === 'BYÅSEN IL') { ball(x, bx + 11, 7, 4, '#ffffff', .02); ball(x, bx + 11, 7, 2.7, '#1c2a63', .2); rect(x, '#d8232a', bx + 9.6, 6.5, 2.8, 1); }
    x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(bx + .8, .8, 62.4, 3.2);
    rect(x, 'rgba(0,0,0,.35)', bx, 14, 64, 3);
  });
  /* ---- gress med klippestriper i perspektiv ---- */
  const GH = H - GROUND_Y;
  BG.grass = mkHi(BGW, GH); x = BG.grass.getContext('2d');
  x.fillStyle = lgrad(x, 0, GH, [[0, '#2a7c3a'], [1, '#4aa957']]); x.fillRect(0, 0, BGW, GH);
  let yy = 0, k = 0;
  while (yy < GH) { const hh = 4 + yy * .16; x.fillStyle = k++ % 2 ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.07)'; x.fillRect(0, yy, BGW, hh); yy += hh; }
  for (let i = 0; i < 1500; i++) { x.fillStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'; const py = R() * GH; x.fillRect(R() * BGW, py, 1 + R() * 2.4, .5 + py / GH); }
  x.fillStyle = lgrad(x, 0, 14, [[0, 'rgba(10,30,20,.38)'], [1, 'rgba(10,30,20,0)']]); x.fillRect(0, 0, BGW, 14);
  /* ---- banedekke-tekstur (granulert gummi), flislegges ---- */
  BG.lane = mkHi(128, 26); x = BG.lane.getContext('2d');
  for (let i = 0; i < 1700; i++) { x.fillStyle = pick2(R, ['rgba(255,170,140,.16)', 'rgba(60,0,0,.14)', 'rgba(255,210,190,.1)', 'rgba(90,10,0,.12)']); x.fillRect(R() * 128, R() * 26, .7 + R() * .6, .7 + R() * .6); }
  /* ---- vignett og lysglød ---- */
  BG.vig = mkHi(W, H); x = BG.vig.getContext('2d');
  x.fillStyle = rgrad(x, W / 2, H / 2, H * .36, H * 1.0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(5,8,22,.5)']]); x.fillRect(0, 0, W, H);
  BG.glow = mkHi(64, 64); x = BG.glow.getContext('2d');
  x.fillStyle = rgrad(x, 32, 32, 0, 32, [[0, 'rgba(255,248,214,.95)'], [.22, 'rgba(255,228,160,.5)'], [1, 'rgba(255,200,120,0)']]); x.fillRect(0, 0, 64, 64);
}
function wrapDraw(img, camPx, y, par) {
  const w = img.width / S;
  let ox = -((camPx * par) % w); if (ox > 0) ox -= w;
  for (let px = ox; px < W; px += w) g.drawImage(img, Math.round(px * S) / S, y, w, img.height / S);
}
/* sol-/lysstråler for solnedgang */
function drawDuskFx(camPx) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8fa2dc'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  BG.masts.forEach(m => { let px = ((m - camPx) % BGW + BGW) % BGW; if (px > BGW - 60) px -= BGW; if (px > -60 && px < W + 60) { g.drawImage(BG.glow, px - 24, -14, 56, 56); g.globalAlpha = .55; g.drawImage(BG.glow, px - 11, -1, 30, 30); g.globalAlpha = 1; } });
  g.restore();
}
/* tegner bakgrunn og gress. camPx = kamera i piksler. opt.dusk = solnedgang med lysmaster på */
function drawBackdrop(camPx, t, opt = {}) {
  const dusk = !!opt.dusk;
  blit(dusk ? BG.skyD : BG.sky, 0, 0);
  if (dusk) {
    g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) g.fillRect((i * 97 + 13) % W, (i * 41) % 40, .9, .9);
  } else for (let i = 0; i < 4; i++) { const cx = ((i * 163 + t * 3 - camPx * .04) % 520 + 520) % 520 - 100; blit(BG.clouds[i % 3], cx, 4 + (i * 21) % 36); }
  if (dusk) for (let i = 0; i < 2; i++) { const cx = ((i * 233 + t * 2 - camPx * .04) % 520 + 520) % 520 - 100; blit(BG.cloudsD[i], cx, 20 + i * 18); }
  wrapDraw(BG.far, camPx, 42, .06);
  wrapDraw(BG.mid, camPx, 48, .16);
  wrapDraw(BG.trees, camPx, 58, .42);
  wrapDraw(BG.near, camPx, 0, 1);
  const bob = opt.still ? 0 : Math.abs(Math.sin(t * 6)) * 1.3, bob2 = opt.still ? 0 : Math.abs(Math.sin(t * 6 + 1.7)) * 1.3;
  wrapDraw(BG.peopleA, camPx, BASE_Y - 22 - bob, 1);
  wrapDraw(BG.peopleB, camPx + 9, BASE_Y - 21 - bob2, 1);
  wrapDraw(BG.boards, camPx, GROUND_Y - 16, 1);
  wrapDraw(BG.grass, camPx, GROUND_Y, 1);
  if (dusk) drawDuskFx(camPx);
}
