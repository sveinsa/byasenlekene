/* =====================================================================
   DEL 4b: TEKNISKE ØVELSER – lengdehopp, kulestøt, høydehopp
   ===================================================================== */
const pingpong = (t, lo, hi, speed) => { const r = hi - lo, x = (t * speed) % (2 * r); return lo + (x < r ? x : 2 * r - x); };
/* sendings-grafikk: vinkelmåler */
function drawProtractor(cx, cy, r, ang, lo, hi, label) {
  panel(cx - 12, cy - r - 17, r + 30, r + 32, .8);
  g.save(); g.lineCap = 'round';
  const arc = (a0, a1, rr, th, col) => { g.strokeStyle = col; g.lineWidth = th; g.beginPath(); g.arc(cx, cy, rr, -a1 * D2R, -a0 * D2R); g.stroke(); };
  arc(0, 90, r, 1.2, 'rgba(200,210,235,.5)');
  arc(lo, hi, r, 3.2, 'rgba(46,165,88,.35)'); arc(lo, hi, r, 1.8, '#4fe08a');
  for (let a = 0; a <= 90; a += 10) { const c = Math.cos(a * D2R), s = Math.sin(a * D2R); g.strokeStyle = 'rgba(220,228,250,.7)'; g.lineWidth = .6; g.beginPath(); g.moveTo(cx + c * (r - 5), cy - s * (r - 5)); g.lineTo(cx + c * (r - 1), cy - s * (r - 1)); g.stroke(); }
  g.strokeStyle = 'rgba(200,210,235,.45)'; g.lineWidth = .8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r, cy); g.stroke();
  const nx = cx + Math.cos(ang * D2R) * (r - 3), ny = cy - Math.sin(ang * D2R) * (r - 3);
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(cx + .5, cy + .6); g.lineTo(nx + .5, ny + .6); g.stroke();
  g.strokeStyle = C.yellow; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(nx, ny); g.stroke();
  g.restore();
  ball(g, cx, cy, 2.6, '#eef1fa', .1);
  txt(Math.round(ang) + '°', cx + r - 1, cy - r - 12, C.yellow, 1, 'r');
  txt(label, cx + 4, cy + 4, '#aab6dd', 1);
}
function cpuLine(ci) { return CLUBS[ci].ab; }

class FieldBase {
  constructor(evIdx, training) { this.evIdx = evIdx; this.training = training; this.pausable = true; }
  initField() {
    this.att = 0; this.mine = []; this.cpuAtt = {};
    Game.cpu().forEach(ci => this.cpuAtt[ci] = this.genCpu(ci));
    this.state = 'run'; this.resT = 0; this.marks = [];
  }
  bestOf(arr, n) { let b = null; for (let i = 0; i < Math.min(n, arr.length); i++) if (arr[i] != null && (b == null || arr[i] > b)) b = arr[i]; return b; }
  boardRows() {
    const n = this.mine.length, rows = [];
    rows.push({ ci: Game.club, v: this.bestOf(this.mine, n) });
    Game.cpu().forEach(ci => rows.push({ ci, v: this.bestOf(this.cpuAtt[ci], n) }));
    rows.sort((a, b) => (b.v == null ? -1 : b.v) - (a.v == null ? -1 : a.v));
    return rows;
  }
  /* resultattavle i TV-stil: skrå rader med klubbfarger */
  drawBoard(rows, x = 4, y = 34) {
    const w = 92, rh = 9.6;
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 3 * S / 3; slant(g, x, y, w + 4, 9, 3.4, BC.red); g.restore();
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 4, y, w - 2, 3.4);
    txt('STILLING', x + 6, y + 1.1, C.white, 1);
    rows.forEach((r, i) => {
      const me = r.ci === Game.club, yy = y + 9.6 + i * rh, cl = CLUBS[r.ci];
      slant(g, x, yy, w, rh - .9, 3.2, me ? 'rgba(255,210,63,.96)' : 'rgba(10,18,50,.86)');
      if (me) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 4, yy, w - 6, 2.6); }
      g.fillStyle = cl.c1; g.fillRect(x + 11, yy + 1, 3, rh - 2.9); g.fillStyle = cl.c2; g.fillRect(x + 14, yy + 1, 3, rh - 2.9);
      const tc = me ? BC.navy : C.white;
      txt(String(i + 1), x + 5, yy + .6, me ? BC.red : BC.cyan, 1);
      txt(me ? 'DU' : cl.ab, x + 20, yy + .6, tc, 1);
      txt(r.v != null ? fmt2(r.v) : '-', x + w - 6, yy + .6, tc, 1, 'r');
    });
  }
  attHud() {
    hudBox(4, 4, 90, 26);
    txt('FORSØK ' + Math.min(this.mine.length + 1, 3) + '/3', 9, 6.6, '#aab6dd', 1);
    const b = this.bestOf(this.mine, 3);
    txt('BESTE ' + (b != null ? fmt2(b) + ' M' : '-'), 9, 17.4, C.yellow, 1);
  }
  finalize() {
    this.state = 'end'; this.endT = 0;
    const vals = [null, null, null, null, null];
    Game.cpu().forEach(ci => vals[ci] = this.bestOf(this.cpuAtt[ci], 3));
    vals[Game.club] = this.bestOf(this.mine, 3);
    this.vals = vals;
    this.place = 1 + vals.filter((v, ci) => ci !== Game.club && v != null && (vals[Game.club] == null || v > vals[Game.club])).length;
    if (vals[Game.club] == null) this.place = 5;
    if (this.place <= 2) { Snd.cheer(2.2, .2); Snd.good(); } else Snd.cheer(1, .1);
  }
  endPanel(unit = ' M') {
    const e = this.endT, b = this.vals[Game.club];
    panel(100, 44, 200, 62, .88);
    txt(this.evIdx === 3 ? 'FERDIG!' : 'ALLE FORSØK GJORT', 200, 50, BC.cyan, 1, 'c');
    txt(b != null ? fmt2(b) + unit : 'INGEN GYLDIG', 200, 64, b != null ? C.white : C.red, 2, 'c');
    txt(this.place + '. PLASS', 200, 86, this.place === 1 ? C.yellow : C.white, 1, 'c');
    if (e > .8 && Math.floor(e * 2) % 2 === 0) txt(isTouch() ? 'TRYKK NESTE' : 'A = FORTSETT', 200, 96, '#aab6dd', 1, 'c');
  }
  endUpdate(dt) {
    this.endT += dt;
    if ((this.endT > .8 && Input.hit.a) || this.endT > 9) this.done();
  }
  done() {
    const tx = ['', '', '', '', ''];
    if (this.vals[Game.club] == null) tx[Game.club] = this.evIdx === 3 ? 'NM' : 'UGYLDIG';
    Game.eventDone(this.evIdx, this.vals, tx, this.training);
  }
}
const FY = 184; /* bakkenivå for tekniske øvelser */
const FB0 = FY - 10, FB1 = FY + 16; /* underlagets bakre/fremre kant (perspektiv) */
/* underlag i perspektiv: bakre kant tynn linje, fremre kant tykkere linje + skygge */
function fieldBand(camPx, y0, y1, kind) {
  if (kind === 'grass') {
    g.fillStyle = lgrad(g, y0, y1, [[0, '#2d8040'], [1, '#52b05d']]); g.fillRect(0, y0, W, y1 - y0);
    let o = -(((camPx % 52) + 52) % 52);
    for (let px = o - 52; px < W; px += 52) {
      g.fillStyle = lgrad(g, y0, y1, [[0, 'rgba(255,255,255,.05)'], [1, 'rgba(255,255,255,.13)']]);
      g.beginPath(); g.moveTo(px + 3, y0); g.lineTo(px + 26 + 3, y0); g.lineTo(px + 26 + 8, y1); g.lineTo(px + 8, y1); g.closePath(); g.fill();
    }
  } else {
    const tw0 = BG.lane.width / S, o = -(((camPx % tw0) + tw0) % tw0);
    g.fillStyle = lgrad(g, y0, y1, [[0, shade(C.track, .84)], [.5, shade(C.track, 1)], [1, shade(C.track, 1.1)]]); g.fillRect(0, y0, W, y1 - y0);
    for (let py = y0; py < y1; py += 26) { const hh = Math.min(26, y1 - py); for (let px = o; px < W; px += tw0) g.drawImage(BG.lane, 0, 0, BG.lane.width, hh * S, px, py, tw0, hh); }
  }
  g.fillStyle = 'rgba(247,240,230,.95)'; g.fillRect(0, y0 - .3, W, .8); g.fillRect(0, y1 - 1, W, 1.7);
  g.fillStyle = lgrad(g, y0, y0 + 6, [[0, 'rgba(0,0,0,.25)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, y0, W, 6);
  g.fillStyle = lgrad(g, y1, y1 + 5, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, y1 + .7, W, 5);
}
function flagAt(px, gy, col = C.red) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(px + 3, gy + .6, 5, 1, 0, 0, 6.2832); g.fill();
  g.fillStyle = lgrad(g, gy - 15, gy, [[0, '#f4f5f8'], [1, '#9aa0ae']]); g.fillRect(px - .5, gy - 15, 1.1, 15);
  g.fillStyle = col; g.beginPath(); g.moveTo(px + .6, gy - 15); g.quadraticCurveTo(px + 4, gy - 16, px + 7.5, gy - 13.4); g.quadraticCurveTo(px + 4, gy - 12.4, px + .6, gy - 10.6); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(px + .6, gy - 14.6, 5, .7);
}
/* kule med 3D-skygge */
function shotBall(x, y, r) { ball(g, x, y, r, '#40455a', .9); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - r * .38, y - r * .42, r * .22, 0, 6.2832); g.fill(); }

/* ======================= LENGDEHOPP ======================= */
const LJ = { BOARD: 35, PIT: 10.5, PPM: 26, K: 0.714, IMP: 1.0, VCAP: 10.4 };
class LongJumpScene extends FieldBase {
  constructor(tr) { super(1, tr); this.amb = .06; }
  ctl() { const p = this.p; return (this.state === 'end' || this.state === 'result') ? { pad: 'none', a: 'NESTE', b: '' } : { pad: 'run', a: 'HOLD', b: '', pl: 'LØP' }; }
  enter() { Music.stop(); this.initField(); this.resetAttempt(); }
  genCpu(ci) { const sk = (Game.skill && Game.skill[ci]) || 0, mean = 5.5 + .2 * sk; return [0, 1, 2].map(() => Math.random() < .1 ? null : +clamp(mean + gauss() * .3, 4.4, 7.2).toFixed(2)); }
  resetAttempt() {
    this.p = { x: 0, v: 0, last: null, ph: 0, mode: 'run', gt: 0, ang: 0, jump: null, msg: '', msgT: 0, started: false, particles: [] };
    this.state = 'run'; this.cam = -4.2; this.resT = 0; this.landX = null; this.result = null;
  }
  tap(side) {
    const p = this.p;
    if (!p.started) p.started = true;
    if (p.last !== side) { p.v = Math.min(LJ.VCAP, p.v + LJ.IMP); p.last = side; Snd.step(p.v / 10); } else p.v += LJ.IMP * .12;
  }
  foul(txtMsg) {
    const p = this.p; p.mode = 'foul'; this.result = null; this.state = 'result'; this.resT = 0; this.resText = txtMsg || 'UGYLDIG!';
    Snd.foul(); Voice.say('Ugyldig'); this.mine.push(null); this.lastX = p.x;
  }
  update(dt) {
    if (this.state === 'end') return this.endUpdate(dt);
    const p = this.p;
    p.msgT = Math.max(0, p.msgT - dt);
    p.particles.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 9 * dt; q.t -= dt; }); p.particles = p.particles.filter(q => q.t > 0);
    if (this.state === 'result') {
      this.resT += dt;
      if (this.resT > 2.4 || (this.resT > 1 && Input.hit.a)) { if (this.mine.length < 3) this.resetAttempt(); else this.finalize(); }
      if (p.mode === 'air') this.updateAir(dt);
      return;
    }
    if (p.mode === 'run' || p.mode === 'gauge') {
      if (Input.hit.l) this.tap('l');
      if (Input.hit.r) this.tap('r');
      p.v = Math.max(0, p.v - LJ.K * p.v * dt);
      p.x += p.v * dt; p.ph += p.v * dt * 1.5;
      if (p.mode === 'run' && Input.hit.a) {
        if (p.x >= LJ.BOARD - 12) { p.mode = 'gauge'; p.gt = 0; Snd.beep(900, .06); }
        else Snd.beep(200, .08);
      }
      if (p.mode === 'gauge') {
        p.gt += dt; p.ang = pingpong(p.gt, 5, 55, 55);
        if (Input.down.a === 0 || Input.rel.a) { this.takeoff(); return; }
      }
      if (p.x > LJ.BOARD + .02) { this.foul(p.mode === 'gauge' ? 'TRÅKKET OVER!' : 'INGEN HOPP!'); }
      this.cam = p.x - 4.2;
    } else if (p.mode === 'air') this.updateAir(dt);
  }
  takeoff() {
    const p = this.p, v = p.v, th = p.ang;
    if (p.x > LJ.BOARD) { this.foul('TRÅKKET OVER!'); return; }
    const dMax = .068 * v * v, angF = Math.max(.35, 1 - Math.pow((th - 22) / 30, 2));
    const Df = dMax * angF, lost = LJ.BOARD - p.x;
    const dist = Math.max(.2, Df - lost);
    const Tf = Math.max(.45, Df / (.95 * Math.max(v, 3)));
    p.jump = { x0: p.x, Df, Tf, apex: .5 + .025 * th + .04 * Df, t: 0, dist, th, lost, angF };
    p.mode = 'air'; Snd.jump();
  }
  updateAir(dt) {
    const p = this.p, j = p.jump;
    if (!j || j.landed) return;
    j.t += dt;
    const s = clamp(j.t / j.Tf, 0, 1);
    p.x = j.x0 + j.Df * s;
    this.cam += (p.x - 4.2 - this.cam) * Math.min(1, dt * 6);
    if (s >= 1 && !j.landed) {
      j.landed = true; this.landX = p.x; this.state = 'result'; this.resT = 0;
      this.mine.push(j.dist); this.result = j.dist;
      this.marks.push(p.x);
      Snd.sand(); Snd.cheer(j.dist > 6.4 ? 1.6 : .8, j.dist > 6.4 ? .18 : .1);
      for (let i = 0; i < 22; i++) p.particles.push({ x: p.x + rnd(-.3, .3), y: .1, vx: rnd(-2, 3.4), vy: rnd(1.5, 4.2), t: rnd(.3, .7) });
      this.resText = fmt2(j.dist) + ' M';
      if (j.lost > .6) this.resSub = 'SATSEN VAR ' + fmt2(j.lost) + ' M FØR PLANKEN';
      else this.resSub = j.angF > .9 ? 'FIN VINKEL!' : 'VINKELEN KUNNE VÆRT BEDRE';
    }
  }
  draw() {
    const p = this.p, ppm = LJ.PPM, cam = this.cam, camPx = cam * ppm, T = this.t;
    const sx = m => (m - cam) * ppm;
    drawBackdrop(camPx, T);
    fieldBand(camPx, FB0, FB1, 'track');
    /* tilløpsmarkører (hvite streker i banen) */
    for (let m = 0; m <= LJ.BOARD; m += 5) { const x = sx(m); if (x > -10 && x < W + 10) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(x - .4, FB1 - 6, .9, 4.6); } }
    const px0 = sx(LJ.BOARD), px1 = sx(LJ.BOARD + LJ.PIT), pw = px1 - px0, ph = FB1 - FB0;
    /* sandgrop (3D: kant foran, mørk skygge bak) */
    g.save(); g.beginPath(); g.rect(px0, FB0, pw, ph); g.clip();
    g.fillStyle = lgrad(g, FB0, FB1, [[0, '#d6bd7e'], [.45, '#ead69c'], [1, '#f7e8ba']]); g.fillRect(px0, FB0, pw, ph);
    for (let i = 0; i < pw / 2.4; i++) {
      const rx = px0 + ((i * 37) % Math.max(1, Math.floor(pw))), ry = FB0 + 2 + ((i * 53) % (ph - 3));
      g.fillStyle = i % 2 ? 'rgba(120,90,30,.14)' : 'rgba(255,255,255,.26)'; g.fillRect(rx, ry, 2 + (i % 3), .55 + ry % 1 * .3);
    }
    g.fillStyle = lgrad(g, FB0, FB0 + 7, [[0, 'rgba(60,40,10,.38)'], [1, 'rgba(60,40,10,0)']]); g.fillRect(px0, FB0, pw, 7);
    /* tidligere merker som fordypninger */
    this.marks.forEach(m => { const mx = sx(m); g.fillStyle = 'rgba(110,80,30,.42)'; g.beginPath(); g.ellipse(mx, FB0 + ph * .56, 3.8, 1.2, 0, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(mx - .4, FB0 + ph * .56 + 1.1, 3.4, .6, 0, 0, 6.2832); g.fill(); });
    g.restore();
    g.fillStyle = '#dfe1e8'; g.fillRect(px0, FB0 - 1.5, pw, 1.5);
    g.fillStyle = lgrad(g, FB1, FB1 + 3.4, [[0, '#eceef3'], [1, '#777c8c']]); g.fillRect(px0 - 1, FB1, pw + 2, 3.4);
    g.fillStyle = lgrad(g, FB0 - 1.5, FB1 + 3.4, [[0, '#b9bdca'], [1, '#6a6f80']]); g.fillRect(px1, FB0 - 1.5, 2.6, ph + 4.9);
    /* plastelina + planke */
    g.fillStyle = '#e58a5f'; g.fillRect(px0, FB0, 2.2, ph);
    g.fillStyle = lgrad(g, FB0, FB1, [[0, '#e6e9f0'], [1, '#ffffff']]); g.fillRect(px0 - 7, FB0, 7, ph);
    g.fillStyle = lgrad(g, FB1, FB1 + 2.6, [[0, '#b9bdca'], [1, '#6f7485']]); g.fillRect(px0 - 7, FB1, 7, 2.6);
    g.fillStyle = BC.red; g.fillRect(px0 - 7, FB0, 7, 1.3);
    txt('PLANKE', px0 - 3.5, FB1 + 5, '#dfe7ff', 1, 'c');
    /* meter-merker ved gropa */
    for (let m = 1; m <= 10; m++) {
      const x = sx(LJ.BOARD + m);
      g.fillStyle = C.white; g.fillRect(x - .35, FB0 - 3.4, .8, 2.4);
      if (m % 2 === 0) txt(String(m), x, FB1 + 5, '#dfe7ff', 1, 'c');
    }
    /* sats-markør før planken */
    if (p.mode === 'run' && p.x < LJ.BOARD - 1.5) {
      const x = sx(LJ.BOARD - 3);
      g.fillStyle = 'rgba(255,210,63,.9)'; g.beginPath(); g.moveTo(x - 1.4, FB0); g.lineTo(x + 1.4, FB0); g.lineTo(x + 2.2, FB1 - 1); g.lineTo(x - 2.2, FB1 - 1); g.closePath(); g.fill();
      txt('A', x, FB0 - 16, C.yellow, 1, 'c'); youArrow(x, FB0 - 6);
    }
    /* utøver */
    const gy = FY + 5;
    let f, off = 0;
    if (p.mode === 'air' && p.jump && !p.jump.landed) { const s = clamp(p.jump.t / p.jump.Tf, 0, 1); f = poseLJ(s); off = 4 * p.jump.apex * s * (1 - s); }
    else if (p.jump && p.jump.landed) f = poseSand();
    else if (p.mode === 'foul') f = poseSlump();
    else if (!p.started) f = poseStand();
    else f = poseRun(p.ph, clamp(p.v / 9, .15, 1.1), 6 + p.v);
    if (p.mode === 'air' && p.jump && !p.jump.landed) f.h = Math.max(f.h, .9);
    const lift = Math.min(1, off * .5);
    groundShadow(sx(p.x) - 1, gy + .5, 9 * (1 - lift * .35), 2, .34 * (1 - lift * .55));
    drawFigure(g, sx(p.x), gy, ppm, f, athCols(Game.club), 1, off);
    /* sandsprut */
    p.particles.forEach(q => { g.fillStyle = q.t > .25 ? '#f3e2ab' : 'rgba(243,226,171,.6)'; g.beginPath(); g.arc(sx(q.x), gy - q.y * ppm, 1, 0, 6.2832); g.fill(); });
    if (this.landX != null) flagAt(sx(this.landX - .1), FY + 2, this.result != null ? C.green : C.red);
    /* HUD */
    this.attHud();
    this.drawBoard(this.boardRows());
    hudBox(98, 4, 100, 14);
    txt('FART', 104, 7.4, '#aab6dd', 1);
    meter(133, 8.6, 59, 5, p.v / 10.4, p.v > 8.5 ? C.green : C.orange);
    if (p.mode === 'gauge') drawProtractor(312, 96, 52, p.ang, 16, 28, 'SATS');
    if (p.mode === 'run' && p.x >= LJ.BOARD - 12 && p.x < LJ.BOARD && Math.floor(T * 4) % 2 === 0) txt(isTouch() ? 'HOLD A-KNAPPEN INNE!' : 'TRYKK OG HOLD A!', 200, 50, C.yellow, 1, 'c');
    if (p.mode === 'gauge' && Math.floor(T * 6) % 2 === 0) txt('SLIPP A RETT FØR PLANKEN!', 200, 50, C.white, 1, 'c');
    if (!p.started && this.state === 'run') { txt(isTouch() ? 'TRYKK RASKT PÅ LØPEFELTET' : 'LØP MED < > ETTER HVERANDRE', 200, 56, C.white, 1, 'c'); }
    if (this.state === 'result') {
      const bad = this.result == null;
      panel(110, 40, 180, bad ? 34 : 46, .85);
      txt(this.resText, 200, 48, bad ? C.red : C.yellow, 2, 'c');
      if (!bad) txt(this.resSub, 200, 68, C.white, 1, 'c'); else txt('FORSØKET TELLER IKKE', 200, 64, C.white, 1, 'c');
    }
    if (this.state === 'end') this.endPanel();
  }
}

/* ======================= KULESTØT ======================= */
const SP = { RING: 2.135, PPM: 26 };
function solveShot(x0, hr, th, xl) {
  const R = v => { const vx = v * Math.cos(th), vy = v * Math.sin(th); return vx / 9.81 * (vy + Math.sqrt(vy * vy + 2 * 9.81 * hr)); };
  let lo = 2, hi = 40; const target = xl - x0;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (R(m) < target) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
class ShotScene extends FieldBase {
  constructor(tr) { super(2, tr); this.amb = .06; }
  ctl() { const p = this.p; return (this.state === 'end' || this.state === 'result') ? { pad: 'none', a: 'NESTE', b: '' } : { pad: 'a', a: p && p.mode === 'ready' ? 'START' : 'KRAFT', b: 'STØT', pl: p && p.mode === 'ready' ? 'START' : 'KRAFT!' }; }
  enter() { Music.stop(); this.initField(); this.resetAttempt(); }
  genCpu(ci) { const sk = (Game.skill && Game.skill[ci]) || 0, mean = 10.3 + .7 * sk; return [0, 1, 2].map(() => Math.random() < .1 ? null : +clamp(mean + gauss() * .6, 8, 15.4).toFixed(2)); }
  resetAttempt() {
    this.p = { x: .35, mode: 'ready', gt: 0, P: 0, ang: 40, t: 0, ph: 0, ball: null, particles: [], msg: '' };
    this.state = 'run'; this.cam = -3.2; this.resT = 0; this.result = null; this.landX = null; this.tx = null;
  }
  foul() {
    const p = this.p; p.mode = 'foul'; this.state = 'result'; this.resT = 0; this.resText = 'TRÅKKET OVER!'; this.result = null;
    Snd.foul(); Voice.say('Ugyldig'); this.mine.push(null);
  }
  update(dt) {
    if (this.state === 'end') return this.endUpdate(dt);
    const p = this.p;
    p.particles.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 9 * dt; q.t -= dt; }); p.particles = p.particles.filter(q => q.t > 0);
    if (p.mode === 'ready') { if (Input.hit.a) { p.mode = 'glide'; p.gt = 0; p.P = 12; Snd.beep(700, .06); } }
    else if (p.mode === 'glide') {
      p.gt += dt;
      if (Input.hit.a) { p.P = Math.min(100, p.P + 9); Snd.tick(); }
      p.P = Math.max(0, p.P - 18 * dt);
      p.ang = pingpong(p.gt, 15, 65, 60);
      p.x += (.55 + .012 * p.P) * dt * 1.0 + .0;
      p.ph = p.gt * 6;
      if (Input.hit.b) { this.release(); }
      else if (p.x >= SP.RING) { p.x = SP.RING; this.foul(); }
    } else if (p.mode === 'throw') {
      p.t += dt;
      if (!p.ball && p.t >= .26) {
        const b = this.tx;
        p.ball = { x: b.x0, y: b.hr, vx: b.v * Math.cos(b.th), vy: b.v * Math.sin(b.th), trail: [] };
        Snd.whoosh();
      }
      if (p.ball && !p.ball.done) {
        const bl = p.ball; bl.vy -= 9.81 * dt; bl.x += bl.vx * dt; bl.y += bl.vy * dt;
        if (bl.trail.length === 0 || (this.t * 60 | 0) % 2 === 0) bl.trail.push([bl.x, bl.y]);
        if (bl.trail.length > 40) bl.trail.shift();
        this.cam += (bl.x - 5 - this.cam) * Math.min(1, dt * 4);
        if (bl.y <= 0 && bl.vy < 0) {
          bl.done = true; bl.y = 0; this.landX = bl.x; const D = this.tx.D;
          this.state = 'result'; this.resT = 0; this.result = D; this.mine.push(D); this.marks.push(bl.x);
          Snd.thud(); Snd.cheer(D > 12 ? 1.8 : .9, D > 12 ? .2 : .1);
          for (let i = 0; i < 16; i++) p.particles.push({ x: bl.x, y: .05, vx: rnd(-2, 2), vy: rnd(1, 3.2), t: rnd(.3, .6) });
          this.resText = fmt2(D) + ' M';
          this.resSub = this.tx.Pf > .8 ? 'GOD KRAFT!' : 'MER KRAFT: TRYKK A RASKERE';
        }
      }
    }
    if (this.state === 'result') {
      this.resT += dt;
      if (this.resT > 2.8 || (this.resT > 1.2 && Input.hit.a)) { if (this.mine.length < 3) this.resetAttempt(); else this.finalize(); }
    }
  }
  release() {
    const p = this.p, th = p.ang * D2R, Pf = p.P / 100;
    const angF = Math.max(.3, 1 - Math.pow((p.ang - 40) / 38, 2)), posF = .6 + .4 * Math.pow(clamp(p.x / SP.RING, 0, 1), 2);
    const D = 4 + 12.5 * Pf * angF * posF;
    const x0 = p.x + .45, hr = 1.85;
    const v = solveShot(x0, hr, th, SP.RING + D);
    this.tx = { D, Pf, angF, posF, v, th, x0, hr };
    p.mode = 'throw'; p.t = 0;
  }
  draw() {
    const p = this.p, ppm = SP.PPM, cam = this.cam, camPx = cam * ppm, T = this.t;
    const sx = m => (m - cam) * ppm;
    drawBackdrop(camPx, T);
    fieldBand(camPx, FB0, FB1, 'grass');
    const ph = FB1 - FB0, my = FB0 + ph * .5;
    /* utkastsektor: avstandsbuer */
    for (let m = 2; m <= 22; m += 2) {
      const x = sx(SP.RING + m); if (x < -12 || x > W + 12) continue;
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, FB0); g.quadraticCurveTo(x + 5, my, x, FB1); g.stroke();
      txt(String(m), x + 1, FB1 + 5, '#dfe7ff', 1, 'c');
    }
    /* tidligere nedslag */
    this.marks.forEach(m => { const mx = sx(m); g.fillStyle = 'rgba(70,45,20,.55)'; g.beginPath(); g.ellipse(mx, my + 1.5, 3, 1.1, 0, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(mx - .3, my + 2.3, 2.6, .5, 0, 0, 6.2832); g.fill(); });
    /* ringen i perspektiv */
    const rx0 = sx(0), rx1 = sx(SP.RING), rcx = (rx0 + rx1) / 2, rrx = (rx1 - rx0) / 2, rry = 11, rcy = my;
    g.fillStyle = '#5d6272'; g.beginPath(); g.ellipse(rcx, rcy + 2.4, rrx + .8, rry + .6, 0, 0, 6.2832); g.fill();
    g.fillStyle = rgrad(g, rcx - rrx * .3, rcy - 3, 2, rrx * 1.1, [[0, '#e0e3ea'], [1, '#9298a8']]);
    g.beginPath(); g.ellipse(rcx, rcy, rrx, rry, 0, 0, 6.2832); g.fill();
    g.strokeStyle = '#f2f4f8'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(rcx, rcy, rrx, rry, 0, 0, 6.2832); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = .6; g.beginPath(); g.ellipse(rcx, rcy, rrx - 1.6, rry - 1.3, 0, 0, 6.2832); g.stroke();
    /* stoppbrett (foran-høyre i ringen) */
    const arcAt = (dy, th, col) => { g.strokeStyle = col; g.lineWidth = th; g.lineCap = 'butt'; g.beginPath(); g.ellipse(rcx, rcy + dy, rrx, rry, 0, -1.15, 1.15); g.stroke(); };
    arcAt(2.8, 4.6, '#6a6f80'); arcAt(.2, 4.6, '#f4f5f8'); arcAt(-1.1, 1.2, BC.red);
    /* utøver */
    const gy = FY + 5, ax = sx(p.x);
    let f;
    if (p.mode === 'ready') f = poseShotGlide(0);
    else if (p.mode === 'glide') f = poseShotGlide(clamp(p.x / SP.RING, 0, 1));
    else if (p.mode === 'throw') f = poseShotThrow(p.t / .45, this.tx.th / D2R);
    else if (p.mode === 'foul') f = poseSlump();
    else f = poseStand();
    groundShadow(ax - 1, gy + .5, 9, 2, .36);
    drawFigure(g, ax, gy, ppm, f, athCols(Game.club), 1);
    if (p.mode === 'ready' || p.mode === 'glide' || (p.mode === 'throw' && !p.ball)) {
      const hp = this.handPos(f, ax, gy, ppm);
      shotBall(hp[0], hp[1], 3);
    }
    if (p.ball) {
      const bl = p.ball, gl = FY + 4;
      groundShadow(sx(bl.x), gl, 3.2 / (1 + bl.y * .12), .9 / (1 + bl.y * .12), .3);
      bl.trail.forEach((t, i) => { g.fillStyle = `rgba(255,255,255,${.15 + .35 * i / bl.trail.length})`; g.beginPath(); g.arc(sx(t[0]), gy - 1 - t[1] * ppm, .8, 0, 6.2832); g.fill(); });
      shotBall(sx(bl.x), gy - 1 - bl.y * ppm, 3);
    }
    p.particles.forEach(q => { g.fillStyle = q.t > .25 ? '#8a6a42' : 'rgba(138,106,66,.6)'; g.beginPath(); g.arc(sx(q.x), gy - 1 - q.y * ppm, 1, 0, 6.2832); g.fill(); });
    if (this.landX != null) { flagAt(sx(this.landX), FY + 4, this.result != null ? C.green : C.red); if (this.result != null) txt(fmt2(this.result) + ' M', sx(this.landX), FY - 28, C.white, 1, 'c'); }
    /* HUD */
    this.attHud();
    this.drawBoard(this.boardRows());
    if (p.mode === 'glide') {
      drawProtractor(312, 96, 52, p.ang, 34, 46, 'UTKAST');
      hudBox(100, 4, 100, 14);
      txt('KRAFT', 105, 7.4, '#aab6dd', 1);
      meter(141, 8.6, 53, 5, p.P / 100, p.P > 75 ? C.green : (p.P > 40 ? C.orange : C.red));
      const left = clamp(1 - p.x / SP.RING, 0, 1);
      hudBox(100, 20, 100, 14); txt('KANT', 105, 23.4, '#aab6dd', 1);
      meter(141, 24.6, 53, 5, 1 - left, left < .2 ? C.red : '#dfe7ff');
      if (Math.floor(T * 5) % 2 === 0) txt(left < .35 ? (isTouch() ? 'STØT NÅ!' : 'B = STØT NÅ!') : (isTouch() ? 'TRYKK RASKT!' : 'TRYKK A RASKT!'), 200, 56, C.yellow, 1, 'c');
    }
    if (p.mode === 'ready') txt(isTouch() ? 'TRYKK FOR Å STARTE GLIDET' : 'TRYKK A FOR Å STARTE GLIDET', 200, 56, C.white, 1, 'c');
    if (this.state === 'result') {
      const bad = this.result == null;
      panel(110, 40, 180, bad ? 34 : 46, .85);
      txt(this.resText, 200, 48, bad ? C.red : C.yellow, 2, 'c');
      if (!bad) txt(this.resSub, 200, 68, C.white, 1, 'c'); else txt('STØTET TELLER IKKE', 200, 64, C.white, 1, 'c');
    }
    if (this.state === 'end') this.endPanel();
  }
  handPos(f, ax, gy, ppm) {
    const hy = gy - f.h * ppm, S = a => Math.sin(a * D2R), Co = a => Math.cos(a * D2R);
    const sx = ax + S(f.to) * LEN.to * ppm, sy = hy - Co(f.to) * LEN.to * ppm;
    const ex = sx + S(f.al) * LEN.ua * ppm, ey = sy + Co(f.al) * LEN.ua * ppm;
    const ex2 = sx + S(f.ar) * LEN.ua * ppm, ey2 = sy + Co(f.ar) * LEN.ua * ppm;
    return [ex2 + S(f.er) * LEN.fa * ppm, ey2 + Co(f.er) * LEN.fa * ppm];
  }
}

/* ======================= HØYDEHOPP =======================
   Nytt, mobilvennlig: tilløpet går av seg selv. Du trykker A to ganger:
   1) start tilløpet  2) SATS når løperen er i det grønne feltet foran lista (lyd-tikk hjelper).
   Svaien (flop) skjer automatisk. B = hopp over denne høyden (pass). */
const HJ = { BAR: 13, PPM: 40, FY: 190, TAIR: .8, VRUN: 5.0, ACC: 5.0, START: 9.5, MAT: .75, ZW: .25, ZY: .55, DW: .8 };
const hjIdeal = v => Math.max(1.5, .55 * v) * HJ.TAIR / 2;   /* ideell avstand til lista ved sats */
class HighJumpScene extends FieldBase {
  constructor(tr) { super(3, tr); this.amb = .06; }
  ctl() {
    const st = this.state, p = this.p;
    if (st === 'select') return { pad: 'nav', a: 'OK', b: '' };
    if (st === 'end') return { pad: 'none', a: 'FORTSETT', b: '' };
    if (st === 'result') return { pad: 'none', a: 'NESTE', b: '' };
    if (!p) return { pad: 'a', a: 'LØP', b: '' };
    if (p.mode === 'ready') return { pad: 'a', a: 'START TILLØP', b: this.barH < 2.0 ? 'PASS' : '', pl: 'START' };
    if (p.mode === 'run') return { pad: 'a', a: 'SATS!', b: '', pl: 'SATS!' };
    return { pad: 'none', a: '', b: '' };
  }
  enter() {
    Music.stop();
    this.cpuMax = {};
    Game.cpu().forEach(ci => { const sk = (Game.skill && Game.skill[ci]) || 0; this.cpuMax[ci] = Math.max(1.4, Math.floor((1.72 + .07 * sk + gauss() * .06) / .05 + .0001) * .05); });
    this.barH = 1.55; this.misses = 0; this.cleared = null; this.passed = 0;
    this.state = 'select'; this.endT = 0; this.resT = 0; this.lastFail = false;
    this.resetAttempt(true);
  }
  resetAttempt(first) {
    this.p = { x: HJ.BAR - HJ.START, v: 0, ph: 0, mode: 'ready', started: false, air: null, particles: [], barFall: null, flash: '', flashT: 0, tick: 0, zoneIn: 0 };
    this.cam = this.p.x - 3; this.msgT = 0;
    if (!first) this.state = 'run';
  }
  boardRows() {
    const rows = [{ ci: Game.club, v: this.cleared }];
    Game.cpu().forEach(ci => rows.push({ ci, v: Math.min(this.cpuMax[ci], this.barH - .05 + (this.state === 'end' ? .05 : 0)) }));
    rows.forEach(r => { if (r.v != null && r.v < 1.0) r.v = null; });
    rows.sort((a, b) => (b.v == null ? -1 : b.v) - (a.v == null ? -1 : a.v));
    return rows;
  }
  update(dt) {
    const p = this.p;
    if (this.state === 'end') return this.endUpdate(dt);
    this.msgT = Math.max(0, this.msgT - dt); p.flashT = Math.max(0, p.flashT - dt);
    p.particles.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 9 * dt; q.t -= dt; }); p.particles = p.particles.filter(q => q.t > 0);
    if (p.barFall) { p.barFall.t += dt; p.barFall.vy -= 9 * dt; p.barFall.y += p.barFall.vy * dt; p.barFall.vx *= .99; p.barFall.x += p.barFall.vx * dt; p.barFall.a += dt * 3; if (p.barFall.y < HJ.MAT + .03) { p.barFall.y = HJ.MAT + .03; p.barFall.vy = 0; p.barFall.vx = 0; } }
    if (this.state === 'select') {
      if (Input.hit.l || Input.hit.d) { this.barH = Math.max(1.4, +(this.barH - .05).toFixed(2)); Snd.select(); }
      if (Input.hit.r || Input.hit.u) { this.barH = Math.min(2.0, +(this.barH + .05).toFixed(2)); Snd.select(); }
      const tp = Input.tap;
      if (tp && tp.y > 70 && tp.y < 110) { this.barH = clamp(+(this.barH + (tp.x < 200 ? -.05 : .05)).toFixed(2), 1.4, 2.0); Snd.select(); }
      if (this.t > .3 && Input.hit.a) { Snd.ok(); this.state = 'run'; this.resetAttempt(); }
      return;
    }
    if (this.state === 'result') {
      this.resT += dt;
      if (p.mode === 'air') this.air(dt);
      if (this.resT > 2.4 || (this.resT > 1.1 && Input.hit.a)) this.nextAttempt();
      return;
    }
    const press = Input.hit.a || Input.hit.l || Input.hit.r;
    if (p.mode === 'ready') {
      if (Input.hit.b && this.barH < 2.0) { this.passed++; this.barH = +(this.barH + .05).toFixed(2); this.msgT = 1; this.msgTxt = 'PASSERER'; Snd.select(); this.cam = p.x - 3; return; }
      if (press && this.t > .3) { p.mode = 'run'; p.started = true; Snd.ok(); }
    } else if (p.mode === 'run') {
      p.v = Math.min(HJ.VRUN, p.v + HJ.ACC * dt);
      p.x += p.v * dt; p.ph += p.v * dt * 1.5;
      this.cam = p.x - 3;
      /* lyd-tikk som hjelper timingen: tikk ved sonekanten og høyt tikk ved midten */
      const d = HJ.BAR - p.x, id = hjIdeal(p.v), e = d - id;
      const z = Math.abs(e) < HJ.ZY ? (Math.abs(e) < HJ.ZW ? 2 : 1) : 0;
      if (z > p.zoneIn) { Snd.tick(z === 2 ? 1 : .5); }
      p.zoneIn = Math.max(p.zoneIn, z); if (z === 0) p.zoneIn = 0;
      if (press) this.takeoff();
      else if (p.x >= HJ.BAR - .15) { this.fail('LØP FORBI!'); this.p.mode = 'foul'; p.barFall = { x: HJ.BAR, y: this.barH, vx: 1, vy: 0, a: 0, t: 0 }; Snd.bar(); }
    } else if (p.mode === 'air') this.air(dt);
  }
  takeoff() {
    const p = this.p, v = Math.max(p.v, .5);
    const vx = Math.max(1.5, .55 * v), d = HJ.BAR - p.x, e = d - hjIdeal(v);
    const Q = clamp(1 - Math.pow(Math.abs(e) / (e < 0 ? HJ.DW * 1.6 : HJ.DW), 2), 0, 1);
    p.air = { x0: p.x, vx, T: HJ.TAIR, t: 0, d, sc: d / (vx * HJ.TAIR), qs: Q, e, tB: .4, v, form: gauss() * .025 };
    p.mode = 'air';
    p.flash = Q > .88 ? 'PERFEKT SATS!' : Q > .6 ? 'GOD SATS' : (e > 0 ? 'FOR TIDLIG' : 'FOR SEN'); p.flashT = 1.1;
    Snd.jump();
  }
  hipAt(a, s) { const h0 = .95, A = a.A != null ? a.A : (.95 + .15 + a.qs * .95 + a.form); return h0 + (A - h0) * 4 * s * (1 - s); }
  air(dt) {
    const p = this.p, a = p.air;
    if (!a || a.done) return;
    a.A = .95 + .15 + a.qs * .95 + a.form; a.qf = 1;
    a.t += dt;
    const s = clamp(a.t / a.T, 0, 1);
    p.x = a.x0 + a.vx * a.T * s;
    if (!a.crossed && p.x >= HJ.BAR) {
      a.crossed = true;
      const hip = this.hipAt(a, s);
      a.hipCross = hip;
      if (hip < this.barH + .10) { a.knock = true; p.barFall = { x: HJ.BAR, y: this.barH, vx: .8, vy: 0, a: 0, t: 0 }; Snd.bar(); }
    }
    this.cam += (p.x - 3 - this.cam) * Math.min(1, dt * 5);
    if (s >= 1 && !a.done) {
      a.done = true;
      const ok = a.crossed && !a.knock && a.sc <= 1;
      if (ok) { this.success(a); } else this.fail(a.sc > 1 ? 'FOR TIDLIG SATS!' : 'RIV!');
      Snd.thud();
      for (let i = 0; i < 8; i++) p.particles.push({ x: p.x, y: HJ.MAT, vx: rnd(-1, 1.5), vy: rnd(.5, 2), t: rnd(.2, .4) });
    }
  }
  success(a) {
    this.state = 'result'; this.resT = 0; this.resText = 'GODKJENT ' + fmt2(this.barH) + ' M'; this.lastFail = false;
    this.resSub = a.qs > .88 ? 'PERFEKT TIMING!' : (a.qs > .6 ? 'GOD TIMING' : 'KNAPT - TRYKK LITT NÆRMERE MIDTEN');
    this.cleared = this.barH; this.misses = 0;
    Snd.cheer(1.8, .2); Snd.good();
  }
  fail(txtMsg) {
    this.state = 'result'; this.resT = 0; this.resText = txtMsg; this.lastFail = true; this.misses++;
    const a = this.p.air;
    this.resSub = !a ? 'TRYKK SATS FØR DU KOMMER FORBI' : (a.sc > 1 ? 'TRYKK SENERE - NÆRMERE LISTA' : (a.e < -.1 ? 'DU TRYKKET FOR SENT' : (a.e > .1 ? 'DU TRYKKET FOR TIDLIG' : 'DET ER RIV: ' + this.misses + '/3')));
    Snd.foul();
    if (this.p.mode !== 'air') this.p.mode = 'foul';
  }
  nextAttempt() {
    if (this.lastFail) {
      if (this.misses >= 3) { this.finish(); return; }
    } else { this.barH = +(this.barH + .05).toFixed(2); }
    if (this.barH > 2.05) { this.finish(); return; }
    this.resetAttempt();
  }
  finish() {
    this.state = 'end'; this.endT = 0;
    const vals = [null, null, null, null, null];
    Game.cpu().forEach(ci => vals[ci] = this.cpuMax[ci]);
    vals[Game.club] = this.cleared;
    this.vals = vals;
    this.place = 1 + vals.filter((v, ci) => ci !== Game.club && v != null && (this.cleared == null || v > this.cleared)).length;
    if (this.cleared == null) this.place = 5;
    if (this.place <= 2) { Snd.cheer(2.2, .2); Snd.good(); } else Snd.cheer(1, .1);
  }
  draw() {
    const p = this.p, ppm = HJ.PPM, cam = this.cam, camPx = cam * ppm, T = this.t, FYH = HJ.FY;
    const sx = m => (m - cam) * ppm;
    drawBackdrop(camPx, T);
    /* underlag i perspektiv */
    const HB0 = FYH - 9, HB1 = FYH + 24;
    fieldBand(camPx, HB0, HB1, 'track');
    for (let m = 0; m <= HJ.BAR; m += 2) { const x = sx(m); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x - .4, HB1 - 6, .9, 4.6); }
    /* sats-sone som lysende felt på bakken (grønn = perfekt, gul = ok) */
    if (this.state !== 'select' && this.state !== 'end' && p.mode !== 'air') {
      const id = hjIdeal(HJ.VRUN), zc = sx(HJ.BAR - id), pulse = Math.floor(T * 4) % 2;
      const zone = (hw, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(zc - hw * .86, HB0 + 2); g.lineTo(zc + hw * .86, HB0 + 2); g.lineTo(zc + hw, HB1 - 4); g.lineTo(zc - hw, HB1 - 4); g.closePath(); g.fill(); };
      zone(HJ.ZY * ppm, 'rgba(255,210,63,.5)');
      zone(HJ.ZW * ppm, pulse ? 'rgba(90,240,135,.92)' : 'rgba(46,190,95,.92)');
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(zc - .4, HB0 + 2, .9, HB1 - HB0 - 6);
      if (p.mode === 'run' || p.mode === 'ready') youArrow(zc, HB0 - 8 - pulse * 1.4);
    }
    /* matte som 3D-blokk */
    const mx0 = sx(HJ.BAR - .6), mx1 = sx(HJ.BAR + 2.8), mt = FYH - HJ.MAT * ppm, mb = FYH + 2, d = 6, mw = mx1 - mx0;
    groundShadow((mx0 + mx1) / 2 + 3, mb + 1, mw * .54, 3.2, .32);
    g.fillStyle = '#12296b'; g.beginPath(); g.moveTo(mx1, mt); g.lineTo(mx1 + d, mt - d * .8); g.lineTo(mx1 + d, mb - d * .8); g.lineTo(mx1, mb); g.closePath(); g.fill();
    g.fillStyle = lgrad(g, mt, mb, [[0, '#2f68dc'], [1, '#17389a']]); g.fillRect(mx0, mt, mw, mb - mt);
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(mx0, mt, 2.4, mb - mt);
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let k = 1; k < 4; k++) g.fillRect(mx0 + mw * k / 4 - .3, mt + 4, .7, mb - mt - 4);
    g.fillStyle = BC.gold; g.fillRect(mx0, mt + 4.5, mw, 1.2);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(mx0, mb - 1.2, mw, 1.2);
    g.fillStyle = lgrad(g, mt - d * .8, mt, [[0, '#7aa4f6'], [1, '#4a7ae6']]);
    g.beginPath(); g.moveTo(mx0 + d, mt - d * .8); g.lineTo(mx1 + d, mt - d * .8); g.lineTo(mx1, mt); g.lineTo(mx0, mt); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(mx0, mt - .5, mw, .9);
    g.strokeStyle = 'rgba(20,50,140,.45)'; g.lineWidth = .5; for (let k = 1; k < 4; k++) { const xx = mx0 + mw * k / 4; g.beginPath(); g.moveTo(xx + d, mt - d * .8); g.lineTo(xx, mt); g.stroke(); }
    /* stativ (sylinderskygge) */
    const ux0 = sx(HJ.BAR - 1.0), ux1 = sx(HJ.BAR + 1.0), pt = FYH - 2.3 * ppm;
    [ux0, ux1].forEach(ux => {
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(ux + 1, FYH + 1.4, 6, 1.5, 0, 0, 6.2832); g.fill();
      const gr = g.createLinearGradient(ux - 1.7, 0, ux + 1.7, 0); gr.addColorStop(0, '#9aa0ae'); gr.addColorStop(.4, '#f4f6fa'); gr.addColorStop(1, '#7c8292');
      g.fillStyle = gr; g.fillRect(ux - 1.7, pt, 3.4, FYH - pt);
      g.fillStyle = '#4a4f60'; rrect(g, ux - 5, FYH - 1.2, 10, 3.2, 1.2); g.fill();
      g.fillStyle = 'rgba(30,34,50,.55)'; for (let k = 0; k < 24; k++) g.fillRect(ux + 1.7, FYH - (1.0 + k * .05) * ppm, k % 5 === 0 ? 2.2 : 1.2, .55);
      const by = FYH - this.barH * ppm; g.fillStyle = '#2b2f40'; g.fillRect(ux + (ux === ux0 ? 0 : -3), by + .6, 3, 1.6);
    });
    /* lista (rund stang) */
    if (!p.barFall) {
      const by = FYH - this.barH * ppm, bx0 = ux0 + 1.5, bx1 = ux1 - 1.5;
      for (let px = bx0, k = 0; px < bx1; px += 8, k++) { g.fillStyle = k % 2 ? '#f8f8fb' : '#f08a24'; g.fillRect(px, by - 1.3, Math.min(8, bx1 - px) + .2, 2.6); }
      g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(bx0, by - 1.3, bx1 - bx0, .8); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(bx0, by + .6, bx1 - bx0, .7);
    } else {
      const bf = p.barFall, cx = sx(bf.x), by = FYH - bf.y * ppm;
      const L = 1.0 * ppm, ca = Math.cos(bf.a), sa = Math.sin(bf.a);
      pline(g, cx - ca * L * .5, by + sa * 6, cx + ca * L * .5, by - sa * 6, 2.8, '#f8f8fb');
      pline(g, cx + ca * L * .2, by - sa * 2, cx + ca * L * .5, by - sa * 6, 2.8, '#f08a24');
    }
    /* utøver */
    const gyG = FYH - 2; let f, off = 0, gy = gyG;
    if (p.mode === 'air' && p.air) {
      const a = p.air, s = clamp(a.t / a.T, 0, 1);
      if (a.tB != null && a.t >= a.tB) { f = poseFlop(clamp((a.t - a.tB) / .6, 0, 1)); } else f = poseJumpUp(clamp(s * 1.6, 0, 1));
      if (a.done) { f = poseLie(); if (p.x > HJ.BAR - .6 && p.x < HJ.BAR + 2.8) gy = mt - 1.5; }
      else f.h = this.hipAt(a, s);
    } else if (p.mode === 'foul') f = poseSlump();
    else if (!p.started) f = poseStand();
    else f = poseRun(p.ph, clamp(p.v / 8, .15, 1.1), 8 + p.v);
    if (gy === gyG) groundShadow(sx(p.x) - 1, FYH + .6, 12, 2.4, .36);
    drawFigure(g, sx(p.x), gy, ppm, f, athCols(Game.club), 1, off);
    p.particles.forEach(q => { g.fillStyle = q.t > .25 ? '#8fb2f6' : 'rgba(143,178,246,.6)'; g.beginPath(); g.arc(sx(q.x), FYH - q.y * ppm, 1.1, 0, 6.2832); g.fill(); });
    /* HUD */
    hudBox(4, 4, 90, 26);
    txt('LISTA ' + fmt2(this.barH) + ' M', 9, 6.6, C.white, 1);
    txt('RIV ' + this.misses + '/3', 9, 17.4, this.misses ? '#ff6b6b' : '#aab6dd', 1);
    this.drawBoard(this.boardRows());
    if (this.state !== 'select' && this.state !== 'end') {
      if (p.mode === 'ready' && Math.floor(T * 2.5) % 2 === 0) txt(isTouch() ? 'TRYKK START TILLØP' : 'A = START TILLØP', 200, 56, C.white, 1, 'c');
      if (p.mode === 'ready') txt(isTouch() ? 'PASS = HOPP OVER DENNE HØYDEN' : 'B = PASS (HOPP OVER HØYDEN)', 200, 68, C.grey, 1, 'c');
      if (p.mode === 'run') txt(isTouch() ? 'TRYKK SATS I DET GRØNNE!' : 'A = SATS I DET GRØNNE!', 200, 56, C.yellow, 1, 'c');
      if (p.flashT > 0) txt(p.flash, 200, 46, p.flash === 'PERFEKT SATS!' ? C.yellow : (p.flash === 'GOD SATS' ? C.white : C.red), 2, 'c', C.dred);
      if (this.msgT > 0 && this.msgTxt) txt(this.msgTxt, 200, 46, C.white, 2, 'c', C.dred);
    }
    if (this.state === 'select') {
      panel(70, 46, 260, 100, .88);
      txt('VELG STARTHØYDE', 200, 54, C.yellow, 2, 'c');
      txt('<', 100, 84, C.yellow, 3, 'c'); txt('>', 300, 84, C.yellow, 3, 'c');
      txt(fmt2(this.barH) + ' M', 200, 84, C.white, 3, 'c');
      txt(isTouch() ? 'TRYKK < > ELLER PILENE. OK = START' : '< > ENDRER 5 CM    A = OK', 200, 116, C.white, 1, 'c');
      txt('HØYERE START = FÆRRE HOPP. 3 RIV = UTE.', 200, 130, C.grey, 1, 'c');
    }
    if (this.state === 'result') {
      const bad = this.lastFail;
      panel(100, 40, 200, 46, .85);
      txt(this.resText, 200, 48, bad ? C.red : C.yellow, bad ? 2 : 1, 'c');
      if (!bad) txt(this.resSub, 200, 66, C.white, 1, 'c'); else txt(this.resSub, 200, 68, C.white, 1, 'c');
      if (bad && this.misses >= 3) txt('TRE RIV - DU ER UTE', 200, 76, C.red, 1, 'c');
    }
    if (this.state === 'end') this.endPanel(' M');
  }
}
