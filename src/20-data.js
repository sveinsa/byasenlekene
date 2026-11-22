/* =====================================================================
   DEL 2: DATA, SPRITES (utøver-skjelett), BAKGRUNN (Dalgård)
   ===================================================================== */
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(Math.round(((n >> 16) & 255) * f), 0, 255), gg = clamp(Math.round(((n >> 8) & 255) * f), 0, 255), b = clamp(Math.round((n & 255) * f), 0, 255);
  return '#' + ((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1);
};
/* Klubber og draktfarger. c1 = trøye, c2 = detaljfarge (felt/mansjetter), sh = shorts. Byåsen IL er tegnet etter bilder (marineblå trøye med røde detaljer);
   de andre er tilnærmet etter klubbenes hovedfarger – lett å justere her. */
const CLUBS = [
  { id: 'byasen', name: 'Byåsen IL', ab: 'BYÅ', c1: '#1c2a63', c2: '#d8232a', sh: '#12162a', skin: C.skin1, hair: '#b08a52' },
  { id: 'ranheim', name: 'Ranheim IL', ab: 'RAN', c1: '#2f66d0', c2: '#ffffff', sh: '#1f3f90', skin: C.skin2, hair: '#1a1a1a' },
  { id: 'strindheim', name: 'Strindheim IL', ab: 'STR', c1: '#f6d51f', c2: '#1c3f95', sh: '#1c3f95', skin: C.skin4, hair: '#d9b45a' },
  { id: 'nidelv', name: 'Nidelv IL', ab: 'NID', c1: '#2b2e3c', c2: '#d8232a', sh: '#1b1d28', skin: C.skin3, hair: '#1a1a1a' },
  { id: 'tfik', name: 'Trondheim Friidrett', ab: 'TFI', c1: '#1f8f4a', c2: '#ffffff', sh: '#14633a', skin: C.skin1, hair: '#7a3b1e' }
];
const EVENTS = [
  { id: 'hurdles', name: '60 m hekk', kind: 'time', best: 7.8, worst: 12.0, f: v => fmt2(v) + ' s', ref: '7,80 S = 1000 P' },
  { id: 'longjump', name: 'Lengdehopp', kind: 'dist', best: 7.5, worst: 3.0, f: v => fmt2(v) + ' m', ref: '7,50 M = 1000 P' },
  { id: 'shotput', name: 'Kulestøt', kind: 'dist', best: 16, worst: 5, f: v => fmt2(v) + ' m', ref: '16,00 M = 1000 P' },
  { id: 'highjump', name: 'Høydehopp', kind: 'dist', best: 2.2, worst: 1.0, f: v => fmt2(v) + ' m', ref: '2,20 M = 1000 P' },
  { id: 'run800', name: '800 m', kind: 'time', best: 108, worst: 170, f: v => fmtTime(v), ref: '1:48 = 1000 P' }
];
/* enkel poengtabell: lineær mellom «null poeng» og «1000 poeng» */
function evPoints(ev, v) {
  if (v == null || isNaN(v)) return 0;
  const p = ev.kind === 'time' ? (ev.worst - v) / (ev.worst - ev.best) : (v - ev.worst) / (ev.best - ev.worst);
  return clamp(Math.round(p * 1000), 0, 1200);
}
function athCols(ci) {
  const k = CLUBS[ci];
  return { c1: k.c1, c2: k.c2, sh: k.sh, skin: k.skin, skinD: shade(k.skin, 0.8), hair: k.hair, shoe: '#f4f4f4', sole: '#e8742c' };
}

/* ---------- utøver-skjelett ---------- */
const LEN = { th: .46, sh: .46, to: .56, ua: .30, fa: .28 };
const ST = { h: undefined, to: 0, tl: 0, tr: 0, sl: 0, sr: 0, al: 6, ar: -6, el: 14, er: 4, ht: 0 };
function F(o) {
  const f = Object.assign({}, ST, o);
  if (f.h === undefined) {
    const dl = Math.cos(f.tl * D2R) * LEN.th + Math.cos(f.sl * D2R) * LEN.sh;
    const dr = Math.cos(f.tr * D2R) * LEN.th + Math.cos(f.sr * D2R) * LEN.sh;
    f.h = Math.max(dl, dr) + 0.03;
  }
  return f;
}
const OUTL = '#161a2e';
function drawFigure(ctx, x, gy, ppm, f, col, dir = 1, off = 0) {
  const S = a => Math.sin(a * D2R) * dir, Co = a => Math.cos(a * D2R);
  const hx = x, hy = gy - (f.h + off) * ppm;
  const thL = Math.max(1.8, .118 * ppm), thA = Math.max(1.6, .088 * ppm), thT = Math.max(2.6, .27 * ppm);
  const sx = hx + S(f.to) * LEN.to * ppm, sy = hy - Co(f.to) * LEN.to * ppm;
  const sh = col.sh || col.c2, acc = col.c2;
  const ops = [];
  const L = (x0, y0, x1, y1, th, c) => ops.push({ t: 0, x0, y0, x1, y1, th, c });
  const Dc = (cx, cy, r, c) => ops.push({ t: 1, cx, cy, r, c });
  const Rc = (rx, ry, w, h, c) => ops.push({ t: 2, rx, ry, w, h, c });
  const leg = (t, s, skinC) => {
    const kx = hx + S(t) * LEN.th * ppm, ky = hy + Co(t) * LEN.th * ppm;
    const ax = kx + S(s) * LEN.sh * ppm, ay = ky + Co(s) * LEN.sh * ppm;
    L(hx, hy, kx, ky, thL, skinC);
    L(kx, ky, ax, ay, thL, skinC);
    L(hx, hy, hx + (kx - hx) * .55, hy + (ky - hy) * .55, thL + 1, sh);          /* shorts */
    const fa = s + 90, fx = ax + S(fa) * .17 * ppm, fy = ay + Co(fa) * .17 * ppm;
    L(ax, ay, fx, fy, Math.max(2, thL), col.shoe);                                /* sko */
    if (ppm >= 14) L(ax, ay + 1, fx, fy + 1, 1, col.sole || '#e8742c');           /* pigg-såle */
  };
  const arm = (a, e, skinC) => {
    const ex = sx + S(a) * LEN.ua * ppm, ey = sy + Co(a) * LEN.ua * ppm;
    const hx2 = ex + S(e) * LEN.fa * ppm, hy2 = ey + Co(e) * LEN.fa * ppm;
    L(ex, ey, hx2, hy2, thA, skinC);
    L(sx, sy, ex, ey, thA, skinC);
    L(sx, sy, sx + (ex - sx) * .6, sy + (ey - sy) * .6, thA + 1, col.c1);       /* erme */
    if (ppm >= 14) L(sx + (ex - sx) * .5, sy + (ey - sy) * .5, sx + (ex - sx) * .62, sy + (ey - sy) * .62, thA + 1, acc);
  };
  leg(f.tr, f.sr, col.skinD);
  arm(f.ar, f.er, col.skinD);
  /* overkropp: trøye, detaljfelt (nederst), shorts-linning */
  L(hx, hy, sx, sy, thT, col.c1);
  L(hx + (sx - hx) * .14, hy + (sy - hy) * .14, hx + (sx - hx) * .3, hy + (sy - hy) * .3, thT, acc);
  L(hx, hy, hx + (sx - hx) * .14, hy + (sy - hy) * .14, thT, sh);
  if (col.bib !== false && ppm >= 14) { const bx = hx + (sx - hx) * .62, by = hy + (sy - hy) * .62; Rc(bx - 1.8, by - 1.6, 3.6, 3.4, '#f4f4f4'); Rc(bx - .6, by - .4, 1.2, 1, '#2a2d3a'); }
  leg(f.tl, f.sl, col.skin);
  arm(f.al, f.el, col.skin);
  /* hode */
  const hr = Math.max(2, .115 * ppm), hd = (.07 + .115) * ppm;
  const cx = sx + S(f.to + f.ht) * hd, cy = sy - Co(f.to + f.ht) * hd;
  Dc(cx, cy, hr, col.hair);
  Dc(cx + dir * hr * .28, cy + hr * .22, hr * .82, col.skin);
  if (ppm >= 20) Rc(cx + dir * hr * .5, cy - hr * .08, Math.max(.9, ppm * .05), Math.max(.9, ppm * .05), '#111');
  /* tegn: 1) mørk silhuett-kontur  2) farger  3) lys/skygge for rund, tredimensjonal følelse */
  const ow = Math.max(.9, ppm * .05);
  for (const o of ops) {
    if (o.t === 0) pline(ctx, o.x0, o.y0, o.x1, o.y1, o.th + ow * 1.6, OUTL);
    else if (o.t === 1) disc(ctx, o.cx, o.cy, o.r + ow * .8, OUTL);
    else { ctx.fillStyle = OUTL; ctx.fillRect(o.rx - ow * .8, o.ry - ow * .8, o.w + ow * 1.6, o.h + ow * 1.6); }
  }
  for (const o of ops) {
    if (o.t === 0) {
      pline(ctx, o.x0, o.y0, o.x1, o.y1, o.th, o.c);
      if (o.th >= 2.2) {
        const dx = o.x1 - o.x0, dy = o.y1 - o.y0, l = Math.hypot(dx, dy) || 1; let nx = -dy / l, ny = dx / l; if (ny > 0) { nx = -nx; ny = -ny; }
        const so = o.th * .24;
        pline(ctx, o.x0 + nx * so, o.y0 + ny * so, o.x1 + nx * so, o.y1 + ny * so, o.th * .36, 'rgba(255,255,255,.26)');
        pline(ctx, o.x0 - nx * so, o.y0 - ny * so, o.x1 - nx * so, o.y1 - ny * so, o.th * .3, 'rgba(0,0,20,.2)');
      }
    } else if (o.t === 1) {
      if (o.c === col.skin || o.c === col.skinD) ball(ctx, o.cx, o.cy, o.r, o.c, .22); else ball(ctx, o.cx, o.cy, o.r, o.c, .15);
    } else { ctx.fillStyle = o.c; ctx.fillRect(o.rx, o.ry, o.w, o.h); }
  }
}

/* ---------- poser ---------- */
const sinp = s => Math.sin(Math.PI * clamp(s, 0, 1));
function poseRun(ph, amp = 1, lean = 8) {
  const leg = p => { const t = (14 + 44 * Math.sin(p)) * (0.55 + 0.45 * amp); const bend = (12 + 70 * Math.max(0, Math.cos(p - 0.5))) * (0.6 + 0.4 * amp); return [t, t - bend]; };
  const [tl, sl] = leg(ph), [tr, sr] = leg(ph + Math.PI);
  const sw = 42 * (0.5 + 0.5 * amp);
  const al = -sw * Math.sin(ph), ar = sw * Math.sin(ph);
  return F({ to: lean, tl, sl, tr, sr, al, ar, el: al + 60, er: ar + 60 });
}
function poseStand() { return F({}); }
function poseMark() { /* «På plass»: knestående, hender i banen */
  return F({ h: .5, to: 52, tl: 80, sl: 2, tr: 12, sr: -84, al: 6, el: 4, ar: 14, er: 8, ht: -30 });
}
function poseSet() { /* «Klar»: hoftene opp */
  return F({ h: .8, to: 50, tl: 62, sl: -22, tr: 28, sr: -62, al: 8, el: 6, ar: 16, er: 10, ht: -28 });
}
function poseHurdle(s) {
  const a = sinp(s);
  const lt = lerp(34, 90, clamp(s * 2, 0, 1)) * (s < .5 ? 1 : 1) , ls = s < .5 ? lerp(10, 86, clamp(s * 2, 0, 1)) : lerp(86, 10, clamp((s - .5) * 2, 0, 1));
  const ltt = s < .5 ? lt : lerp(90, 25, clamp((s - .5) * 2, 0, 1));
  const tt = s < .45 ? lerp(-30, -40, s / .45) : lerp(-40, 70, clamp((s - .45) / .4, 0, 1));
  const ts = s < .85 ? tt - 100 : tt - 35;
  return F({ to: 14 + 34 * a, tl: ltt, sl: ls, tr: s < .85 ? tt : lerp(70, 10, (s - .85) / .15), sr: ts, al: -50 * a - 10, el: -30 * a, ar: 115 * a, er: 130 * a, ht: 5 });
}
function poseLJ(s) { /* s 0..1 gjennom luftfasen */
  if (s < .25) { const k = s / .25; return F({ h: undefined, to: 4, tl: lerp(60, 82, k), sl: lerp(20, 10, k), tr: lerp(-35, -20, k), sr: lerp(-35, -40, k), al: lerp(-60, 150, k), el: lerp(-30, 150, k), ar: lerp(60, 140, k), er: lerp(90, 150, k) }); }
  if (s < .65) { const k = (s - .25) / .4; return F({ to: lerp(4, -6, k), tl: lerp(82, 20, k), sl: lerp(10, -50, k), tr: lerp(-20, -30, k), sr: lerp(-40, -70, k), al: lerp(150, 175, k), el: lerp(150, 175, k), ar: lerp(140, 165, k), er: lerp(150, 170, k), h: .95 }); }
  const k = (s - .65) / .35;
  return F({ to: lerp(-6, 55, k), tl: lerp(20, 85, k), sl: lerp(-50, 55, k), tr: lerp(-30, 78, k), sr: lerp(-70, 48, k), al: lerp(175, 20, k), el: lerp(175, 60, k), ar: lerp(165, 30, k), er: lerp(170, 70, k), h: .9 });
}
function poseSand() { return F({ h: .45, to: 40, tl: 95, sl: 40, tr: 85, sr: 35, al: 40, el: 60, ar: 35, er: 60 }); }
function poseShotStand() { return F({ h: .88, to: 6, tl: 4, sl: 2, tr: -4, sr: 0, al: 10, el: 12, ar: 130, er: 150, ht: -5 }); }
function poseShotGlide(s) { /* lav glidebevegelse */
  return F({ h: lerp(.62, .66, s), to: lerp(34, 18, s), tl: lerp(-10, 35, s), sl: lerp(-60, -25, s), tr: lerp(-55, -18, s), sr: lerp(-70, -35, s), al: lerp(-10, 5, s), el: 20, ar: 120, er: 150, ht: -10 });
}
function poseShotThrow(s, ang) { /* s 0..1, ang = utkastvinkel i grader */
  const k = clamp(s * 1.6, 0, 1), arm = 90 + ang;
  return F({ h: lerp(.6, .98, k), to: lerp(14, -4, k), tl: lerp(35, 6, k), sl: lerp(-25, 0, k), tr: lerp(-30, -34, k), sr: lerp(-50, -60, k), al: lerp(10, -30, k), el: lerp(20, -10, k), ar: lerp(130, arm, k), er: lerp(150, arm, k), ht: 0 });
}
function poseJumpUp(s) { /* høydehopp: takeoff-stuss */
  return F({ to: 2, tl: lerp(20, 82, s), sl: lerp(0, 0, s), tr: -8, sr: -30, al: lerp(-50, 100, s), el: lerp(-30, 140, s), ar: lerp(30, 170, s), er: lerp(60, 170, s) });
}
function poseFlop(s) { /* s 0..1: rygg-svai over listen */
  if (s < .3) { const k = s / .3; return F({ h: .95, to: lerp(10, 40, k), tl: lerp(60, 30, k), sl: lerp(0, -40, k), tr: -10, sr: -50, al: lerp(100, 40, k), el: 60, ar: lerp(170, 90, k), er: 160, ht: lerp(0, -30, k) }); }
  if (s < .65) { const k = (s - .3) / .35; return F({ h: .95, to: lerp(40, 102, k), tl: lerp(30, 8, k), sl: lerp(-40, -38, k), tr: lerp(-10, 14, k), sr: lerp(-50, -44, k), al: lerp(40, 75, k), el: lerp(60, 70, k), ar: lerp(90, 80, k), er: 100, ht: lerp(-30, -50, k) }); }
  const k = (s - .65) / .35;
  return F({ h: .95, to: lerp(102, 82, k), tl: lerp(8, 130, k), sl: lerp(-38, 145, k), tr: lerp(14, 120, k), sr: lerp(-44, 130, k), al: lerp(75, 80, k), el: 70, ar: lerp(80, 85, k), er: 90, ht: -40 });
}
function poseLie() { return F({ h: .22, to: 88, tl: 100, sl: 80, tr: 98, sr: 78, al: 70, el: 50, ar: 75, er: 55, ht: -20 }); }
function poseCheer(t) { const w = Math.sin(t * 9) * 12; return F({ to: 0, tl: 4, tr: -4, sl: 0, sr: 0, al: 150 + w, el: 160 + w, ar: 150 - w, er: 160 - w, ht: 0 }); }
function poseCamera(t) { return F({ to: 3, tl: 6, tr: -6, sl: 0, sr: 0, al: 55, el: 160, ar: 62, er: 168, ht: 0, h: .9 }); }
function poseSlump() { return F({ to: 24, tl: 4, tr: -4, sl: 0, sr: 0, al: 4, el: 8, ar: 2, er: 6, ht: 20 }); }
function poseTired(ph) { const p = poseRun(ph, 0.5, 18); p.ht = 12; return p; }

