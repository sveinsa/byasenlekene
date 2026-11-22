/* =====================================================================
   DEL 4a: LØPSØVELSER – startrutine, 60 m hekk, 800 m
   ===================================================================== */
/* Felles startsekvens: INNTA PLASSENE -> (KLAR, bare på hekk) -> tilfeldig pause 0.8–2.2 s -> SKUDD. Tyvstart-regler. */
class StartSeq {
  constructor(ready = true) { this.warn = 0; this.state = 'pre'; this.t = 0; this.gunTs = 0; this.delay = 1; this.ready = ready; }
  begin() { this.state = 'pre'; this.t = 0; }
  update() {
    this.t += STEP;
    const pressed = Input.hit.l || Input.hit.r || Input.hit.a;
    switch (this.state) {
      case 'pre':
        if (this.t > .9) { this.state = 'mark'; this.t = 0; Voice.say('Innta plassene', .8, .55); }
        break;
      case 'mark':
        if (pressed && this.t > .12) return this.fs();
        if (this.t > (this.ready ? 3.0 : 3.6)) {
          if (this.ready) { this.state = 'set'; this.t = 0; this.delay = rnd(.9, 2.2); Voice.say('Klar', .9, .6); }
          else { this.state = 'set'; this.t = 0; this.delay = rnd(1.0, 2.0); this.silent = true; }
        }
        break;
      case 'set':
        if (pressed && this.t > .05) return this.fs();
        if (this.t >= this.delay) { this.state = 'go'; this.t = 0; this.gunTs = Clk.now(); Snd.gun(); }
        break;
      case 'warn':
        if (this.t > 2.4) { this.state = 'pre'; this.t = 0; }
        break;
    }
  }
  fs() {
    this.warn++; this.t = 0; Snd.foul(); this.silent = false;
    if (this.warn >= 2) { this.state = 'dq'; Voice.say('Diskvalifisert'); } else { this.state = 'warn'; Voice.say('Tyvstart'); }
  }
  /* tekst midt på skjermen */
  drawText(cy = 70) {
    const s = this.state;
    if (s === 'warn' || s === 'dq') { g.fillStyle = 'rgba(8,12,28,.72)'; g.fillRect(40, cy - 8, 320, 56); }
    if (s === 'mark') txt('INNTA PLASSENE', 200, cy, C.white, 2, 'c', C.dred);
    else if (s === 'set') { if (this.ready) txt('KLAR', 200, cy, C.yellow, 3, 'c', C.dred); else txt('INNTA PLASSENE', 200, cy, C.white, 2, 'c', C.dred); }
    else if (s === 'go' && this.t < .6) { txt('SKUDD!', 200, cy, C.red, 4, 'c', C.white); }
    else if (s === 'warn') { txt('TYVSTART!', 200, cy, C.red, 3, 'c', C.white); txt('ADVARSEL - NESTE GANG = DISKVALIFIKASJON', 200, cy + 28, C.white, 1, 'c'); }
    else if (s === 'dq') { txt('TYVSTART!', 200, cy, C.red, 3, 'c', C.white); txt('DISKVALIFISERT', 200, cy + 28, C.yellow, 2, 'c'); }
  }
}
const rtBoost = rt => clamp(1 - (rt - 130) / 380, 0, 1);
/* sendings-HUD: avrundet mørk boks med rød aksent */
function hudBox(x, y, w, h) {
  g.save(); rrect(g, x, y, w, h, 2.6);
  g.fillStyle = lgrad(g, y, y + h, [[0, 'rgba(24,38,90,.86)'], [1, 'rgba(8,13,38,.88)']]); g.fill();
  g.strokeStyle = 'rgba(160,190,255,.3)'; g.lineWidth = .5; g.stroke();
  g.clip(); g.fillStyle = BC.red; g.fillRect(x, y, 2, h); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, w, h * .4); g.restore();
}
/* fargestolpe (energi/fart) */
function meter(x, y, w, h, f, col) {
  g.save(); rrect(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill(); g.clip();
  const fw = Math.max(0, w * clamp(f, 0, 1));
  g.fillStyle = lgrad(g, y, y + h, [[0, shade(col, 1.35)], [1, shade(col, .75)]]); g.fillRect(x, y, fw, h);
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x, y, fw, h * .35); g.restore();
}
/* liten «dette er deg»-pil */
function youArrow(x, y, c = C.yellow) {
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(x - 3.4, y + .6); g.lineTo(x + 3.4, y + .6); g.lineTo(x, y + 4.6); g.closePath(); g.fill();
  g.fillStyle = c; g.beginPath(); g.moveTo(x - 3.4, y - .4); g.lineTo(x + 3.4, y - .4); g.lineTo(x, y + 3.6); g.closePath(); g.fill();
}
function drawLabel(ab, x, y, hl) { txt(ab, x, y, hl ? C.yellow : C.white, 1, 'c'); }
/* merkeplate på bakken (avstand) */
function distPlate(px, label) {
  const w = tw(label, 1) + 7, y = LANE_BOT + 6;
  g.save(); rrect(g, px - w / 2, y, w, 9.5, 2); g.fillStyle = 'rgba(8,14,40,.85)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .5; g.stroke(); g.restore();
  txt(label, px, y + 1.1, C.white, 1, 'c', null);
}
function drawFinishLine(px) {
  /* rutet mållinje gjennom alle baner + portal */
  for (let i = 0; i < 5; i++) {
    const y0 = LANE_EDGE[i], y1 = LANE_EDGE[i + 1], n = 3, cs = (y1 - y0) / n, wq = 3.2 + i * .35;
    for (let r = 0; r < n; r++) for (let c = 0; c < 2; c++) { g.fillStyle = (r + c) % 2 ? '#111' : '#fff'; g.fillRect(px + c * wq / 2, y0 + r * cs, wq / 2, cs); }
  }
  const top = LANE_TOP - 34, gx = px - 4;
  g.fillStyle = lgrad(g, top, LANE_TOP, [[0, '#f4f5f8'], [1, '#aeb4c0']]); g.fillRect(gx - 1, top, 2.2, 36);
  g.fillStyle = lgrad(g, top, LANE_TOP, [[0, '#f4f5f8'], [1, '#aeb4c0']]); g.fillRect(gx + 33.6, top, 2.2, 36);
  slant(g, gx - 2, top - 9, 40, 11, 4, BC.red);
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(gx + 2, top - 9, 34, 3);
  txt('MÅL', gx + 17, top - 8.2, C.white, 1, 'c', BC.dred);
}

/* ======================= 60 M HEKK ======================= */
const H_POS = [13.72, 22.86, 32.0, 41.14, 50.28], H_LEN = 60;
const HK = { K: 0.714, IMP: 1.0, VCAP: 10.4, TAU: .23, APEX: 1.05, DUR: .5, CLEAR: .8 };
function hurdleLoss(tau, ez) {
  if (ez) { if (tau >= .14 && tau <= .45) return 0; if (tau > .45) return .03 + (tau - .45) * 1.0; return .03 + (.14 - tau) * 1.0; }
  if (tau >= .175 && tau <= .285) return 0;
  if (tau > .285) return .03 + (tau - .285) * 1.3;
  return .03 + (.175 - tau) * 1.6;
}
function drawHurdleAt(px, gy, fallT, k = 1) {
  const hh = 13 * k;
  groundShadow(px - 1 * k, gy + .8, 7.5 * k, 1.5 * k, .28);
  if (fallT != null) {
    const a = clamp(fallT / .25, 0, 1) * 82 * D2R;
    const tx = px + Math.sin(a) * hh, ty = gy - Math.cos(a) * hh;
    pline(g, px, gy, tx, ty, 1.7 * k, '#f2f2f2');
    pline(g, tx - 2.4 * k, ty - .6 * k, tx + 3.2 * k, ty + .9 * k, 2.6 * k, BC.red);
    return;
  }
  const dx = -3.4 * k, dy = -1.4 * k;          /* fjern stolpe (dybde) */
  pline(g, px + dx - 2 * k, gy + dy, px + dx + 2 * k, gy + dy, 1.1 * k, '#7d838f');
  pline(g, px + dx, gy + dy, px + dx, gy + dy - hh, 1.4 * k, '#bfc3cc');
  pline(g, px - 2.4 * k, gy, px + 2.4 * k, gy, 1.2 * k, '#8a909c');
  pline(g, px, gy, px, gy - hh, 1.7 * k, '#f6f7fa');
  /* toppbjelke som går i dybden: hvit med rødt felt */
  const yt = gy - hh;
  g.fillStyle = lgrad(g, yt - 2.6 * k, yt, [[0, '#ffffff'], [1, '#c9ccd4']]);
  g.beginPath(); g.moveTo(px + dx, yt + dy - 2.6 * k); g.lineTo(px, yt - 2.6 * k); g.lineTo(px, yt); g.lineTo(px + dx, yt + dy); g.closePath(); g.fill();
  g.fillStyle = BC.red; g.beginPath(); g.moveTo(px + dx * .62, yt + dy * .62 - 2.6 * k); g.lineTo(px + dx * .3, yt + dy * .3 - 2.6 * k); g.lineTo(px + dx * .3, yt + dy * .3); g.lineTo(px + dx * .62, yt + dy * .62); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(px - .5, yt - 2.6 * k, 1.1, 2.6 * k);
}
class HurdlesScene {
  constructor(training) { this.training = training; this.pausable = true; this.amb = .07; }
  ctl() { return { pad: 'run', a: 'HOPP', b: '', pl: 'LØP' }; }
  enter() {
    Music.stop();
    this.seq = new StartSeq();
    this.phase = 'start'; this.clock = 0; this.endT = 0;
    this.pl = { x: 0, v: 0, mode: 'run', started: false, last: null, airT: 0, air: null, nextH: 0, fin: false, tf: null, ph: 0, msg: '', msgT: 0, stumble: 0, rt: null, rtT: 0, boost: 0, fall: [null, null, null, null, null] };
    this.cpus = Game.cpu().map((ci, k) => this.simCpu(ci));
    this.dqed = false;
  }
  simCpu(ci) {
    const skill = clamp(1 + gauss() * .028 + (Math.random() - .5) * .02, .92, 1.06);
    const veq = 8.25 * skill, rt = rnd(.14, .30), boost = rtBoost(rt * 1000);
    const c = { ci, xs: [], jumps: [], hit: [null, null, null, null, null], rt, tf: null, ph0: rnd(0, 6) };
    let t = 0, x = 0, v = 0, started = false, nh = 0, air = null;
    while (t < 30) {
      if (!started && t >= rt) { started = true; v = 1 + 3 * boost; }
      if (started) {
        v += (veq - v) * HK.K * STEP;
        if (!air && nh < 5 && x >= 0) {
          const d = H_POS[nh] - x, tau = d / Math.max(v, 1), want = HK.TAU + gauss() * .045;
          if (!c._tw) c._tw = want;
          if (tau <= c._tw) { air = { t0: t, tk: 0, tau, dur: HK.DUR, loss: hurdleLoss(tau), j: nh }; c.jumps.push(air); }
        }
        if (air) {
          air.tk += STEP;
          if (air.tk >= air.dur) { v *= 1 - air.loss; air = null; c._tw = null; }
        }
        x += v * STEP;
        while (nh < 5 && x >= H_POS[nh]) {
          const a = c.jumps.find(j => j.j === nh && !j.done);
          const h = a && air === a ? HK.APEX * Math.sin(Math.PI * a.tk / a.dur) : 0;
          if (h < HK.CLEAR) { c.hit[nh] = t; v *= a ? .76 : .55; if (a) a.hit = true; }
          if (a) a.done = true;
          nh++;
        }
        if (x >= H_LEN && c.tf == null) c.tf = t - (x - H_LEN) / v;
        if (c.tf != null && t > c.tf + 1) v *= .965;
      }
      c.xs.push(x);
      t += STEP;
      if (c.tf != null && t > c.tf + 5) break;
    }
    return c;
  }
  cpuX(c, t) { if (t <= 0) return 0; const i = Math.floor(t * 60); return c.xs[Math.min(i, c.xs.length - 1)]; }
  cpuV(c, t) { const i = Math.min(Math.floor(t * 60), c.xs.length - 2); return i < 0 ? 0 : (c.xs[i + 1] - c.xs[i]) * 60; }
  msg(s) { this.pl.msg = s; this.pl.msgT = .9; }
  tap(side) {
    const p = this.pl, eff = p.mode === 'air' ? .4 : 1;
    const accMul = lerp(.8 + .35 * p.boost, 1, clamp((this.clock - p.t0) / 2, 0, 1));
    if (p.last !== side) { p.v = Math.min(HK.VCAP, p.v + HK.IMP * accMul * eff); p.last = side; Snd.step(p.v / 10); }
    else p.v += HK.IMP * .12 * eff;
  }
  update(dt) {
    const p = this.pl, s = this.seq;
    p.msgT = Math.max(0, p.msgT - dt); p.rtT = Math.max(0, p.rtT - dt);
    if (this.phase === 'start') {
      const prev = s.state; s.update();
      if (s.state === 'go' && prev !== 'go') { this.clock = 0; this.phase = 'race'; }
      if (s.state === 'dq') { this.phase = 'dq'; this.endT = 0; }
      return;
    }
    if (this.phase === 'dq') {
      this.endT += dt;
      this.clock += dt;
      if (this.endT > 2.6 || (this.endT > 1 && Input.hit.a)) this.done();
      return;
    }
    this.clock += dt; s.t += dt;
    const pressed = Input.hit.l || Input.hit.r || Input.hit.a;
    if (!p.started && !p.fin) {
      if (pressed) {
        const rt = Input.ts - s.gunTs;
        if (rt < 100) { s.fs(); this.phase = s.state === 'dq' ? 'dq' : 'start'; this.clock = 0; this.endT = 0; return; }
        p.started = true; p.t0 = this.clock; p.rt = rt; p.rtT = 2.4; p.boost = rtBoost(rt);
        p.v = 1 + 3 * p.boost;
        if (Input.hit.l) this.tap('l'); if (Input.hit.r) this.tap('r');
      }
    } else if (p.started && !p.fin) {
      if (Input.hit.l) this.tap('l');
      if (Input.hit.r) this.tap('r');
      /* hopp */
      if (Input.hit.a && p.mode === 'run') {
        const j = p.nextH, d = j < 5 ? H_POS[j] - p.x : 99, tau = d / Math.max(p.v, .5);
        if (d > 6 || j >= 5) { p.mode = 'air'; p.airT = 0; p.air = { dur: .32, apex: .45, loss: .05, q: 'hop' }; this.msg('FOR TIDLIG'); Snd.jump(); }
        else {
          const ez = EZ(), loss = hurdleLoss(tau, ez);
          p.mode = 'air'; p.airT = 0; p.air = { dur: ez ? .6 : HK.DUR, apex: ez ? 1.2 : HK.APEX, tau, loss, q: loss === 0 ? 'perfect' : (tau > (ez ? .45 : .285) ? 'early' : 'late') };
          Snd.jump();
        }
      }
      /* fysikk */
      p.v = Math.max(0, p.v - HK.K * p.v * dt);
      if (EZ() && p.mode !== 'stumble') p.v += (10.5 - p.v) * Math.min(1, dt * 1.5);   /* hjelp: løperen får selv opp farten, trykk gir bonus */
      if (p.mode === 'stumble') { p.stumble -= dt; p.v = Math.max(0, p.v - 3 * dt); if (p.stumble <= 0) p.mode = 'run'; }
      if (p.mode === 'air') {
        p.airT += dt;
        if (p.airT >= p.air.dur) {
          const q = p.air.q; p.v *= 1 - p.air.loss; if (q === 'perfect') { p.v *= 1.015; this.msg('PERFEKT!'); Snd.perfect(); }
          else if (q === 'early') this.msg('FOR TIDLIG'); else if (q === 'late') this.msg('FOR SEN');
          p.mode = 'run'; p.air = null;
        }
      }
      p.x += p.v * dt; p.ph += p.v * dt * 1.5;
      while (p.nextH < 5 && p.x >= H_POS[p.nextH]) {
        const j = p.nextH++;
        const h = p.mode === 'air' && p.air ? p.air.apex * Math.sin(Math.PI * p.airT / p.air.dur) : 0;
        if (h < HK.CLEAR) {
          p.fall[j] = 0; Snd.hit();
          if (p.mode === 'air') { p.v *= .76; this.msg('RIV!'); } else { p.v *= .5; p.mode = 'stumble'; p.stumble = .45; this.msg('INN I HEKKEN!'); }
        }
      }
      if (p.x >= H_LEN) { p.fin = true; p.tf = this.clock - (p.x - H_LEN) / Math.max(p.v, .1); this.phase = 'finish'; this.endT = 0; this.place = 1 + this.cpus.filter(c => c.tf < p.tf).length; if (this.place <= 2) Snd.cheer(2, .2); else Snd.cheer(1, .1); }
    }
    p.fall.forEach((f, i) => { if (f != null) p.fall[i] = f + dt; });
    if (this.phase === 'finish') {
      this.endT += dt; p.v *= .985; p.x += p.v * dt; p.ph += p.v * dt * 1.5;
      if ((this.endT > 1.5 && Input.hit.a) || this.endT > 7) this.done();
    }
  }
  done() {
    const vals = Game.nulls(), tx = Game.nulls('');
    this.cpus.forEach(c => vals[c.ci] = c.tf);
    if (this.pl.tf != null && !this.dqed && this.phase !== 'dq') vals[Game.club] = this.pl.tf; else tx[Game.club] = 'DQ';
    Game.eventDone(0, vals, tx, this.training);
  }
  draw() {
    const p = this.pl, ppm = 16, cam = p.x - 5.5, camPx = cam * ppm, T = this.t;
    const sx = xm => (xm - cam) * ppm;
    drawBackdrop(camPx, T);
    drawRunTrack(camPx);
    /* avstandsmarkører, start og mål */
    for (let m = 10; m <= 50; m += 10) { const px = sx(m); if (px > -10 && px < W + 10) distPlate(px, m + ' M'); }
    { const px = sx(0); for (let i = 0; i < 5; i++) { g.fillStyle = '#fff'; g.fillRect(px - .6, LANE_EDGE[i], 1.8 + i * .2, LANE_EDGE[i + 1] - LANE_EDGE[i]); } }
    drawFinishLine(sx(H_LEN));
    const t = this.clock, st = this.seq.state;
    for (let lane = 0; lane < 5; lane++) {
      const gy = laneFeet(lane);
      const isP = lane === 4, c = isP ? null : this.cpus[lane];
      /* hekker */
      for (let j = 0; j < 5; j++) {
        const fall = isP ? p.fall[j] : (c.hit[j] != null && t >= c.hit[j] ? t - c.hit[j] : null);
        drawHurdleAt(sx(H_POS[j]) + 2, gy, fall, laneK(lane));
      }
      if (this.phase === 'start' || t < 1.5) txt(isP ? 'DU' : CLUBS[c.ci].ab, 6, gy - 9, isP ? C.yellow : C.white, 1);
      /* startblokker */
      { const kk = laneK(lane), bx = sx(0); g.fillStyle = '#3a3f4c'; g.beginPath(); g.moveTo(bx - 8 * kk, gy + .5); g.lineTo(bx - 2.4 * kk, gy + .5); g.lineTo(bx - 3 * kk, gy - 2.6 * kk); g.lineTo(bx - 6 * kk, gy - 2 * kk); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(bx - 6 * kk, gy - 2 * kk, 3 * kk, .6); }
      if (isP) {
        let f, lift = 0;
        if (this.phase === 'start' || (!p.started && this.phase === 'race')) f = st === 'mark' || st === 'warn' ? poseMark() : st === 'set' || st === 'go' ? poseSet() : (st === 'dq' ? poseSlump() : poseStand());
        else if (this.phase === 'dq') f = poseSlump();
        else if (p.mode === 'air' && p.air) { const s = p.airT / p.air.dur; f = p.air.q === 'hop' ? poseRun(p.ph, 1) : poseHurdle(s); lift = p.air.apex * Math.sin(Math.PI * s) - .0; }
        else if (p.mode === 'stumble') f = poseSlump();
        else if (p.fin && p.v < .8) f = this.place === 1 ? poseCheer(T) : poseSlump();
        else f = poseRun(p.ph, clamp(p.v / 9, .15, 1.1), 6 + p.v);
        drawRunnerAt(Game.club, 88, 4, f, 1, ppm, lift);
        if (!p.fin) youArrow(88, gy - 40 * laneK(4) - (this.phase === 'start' || !p.started ? Math.sin(T * 6) * 1.2 : 0));
        if (p.msgT > 0) txt(p.msg, 88, gy - 60 - (0.9 - p.msgT) * 12, p.msg === 'PERFEKT!' ? C.yellow : (p.msg === 'RIV!' || p.msg === 'INN I HEKKEN!' ? C.red : C.white), 1, 'c');
      } else {
        const x = this.cpuX(c, t), v = this.cpuV(c, t);
        let f, lift = 0;
        const jp = c.jumps.find(j => t >= j.t0 && t < j.t0 + j.dur);
        if (t < c.rt || (this.phase === 'start')) f = st === 'mark' || st === 'warn' ? poseMark() : st === 'set' || st === 'go' ? poseSet() : poseStand();
        else if (jp) { const s = (t - jp.t0) / jp.dur; f = poseHurdle(s); lift = HK.APEX * Math.sin(Math.PI * s); }
        else if (c.tf != null && t > c.tf && v < .8) f = poseStand();
        else f = poseRun(x * 1.5 + c.ph0, clamp(v / 9, .15, 1.1), 6 + v);
        drawRunnerAt(c.ci, sx(x), lane, f, 1, ppm, lift);

      }
    }
    this.hud();
  }
  hud() {
    const p = this.pl, ppm = 16;
    hudBox(4, 4, 80, 32);
    txt('TID', 9, 6, C.cyan || '#7fa6ff', 1);
    const shown = this.phase === 'start' ? 0 : (p.fin ? p.tf : this.clock);
    txt(fmt2(Cls.real(0, shown)), 80, 4, C.white, 2, 'r');
    txt('FART', 9, 23.4, '#9fb4ee', 1);
    meter(34, 25.2, 46, 4.6, p.v / 10.4, p.v > 9 ? '#2ea558' : '#f39c34');
    /* fremdriftsstripe */
    hudBox(100, 4, 244, 14);
    g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(106, 10.4, 232, 1.4);
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let j = 0; j < 5; j++) g.fillRect(106 + H_POS[j] / H_LEN * 232, 7.4, 1, 7.2);
    g.fillStyle = C.white; g.fillRect(106 + 232, 6, 1.8, 10);
    const dots = this.cpus.map(c => [c.ci, this.cpuX(c, this.clock)]).concat([[Game.club, p.x]]);
    dots.forEach(([ci, x]) => { const k = CLUBS[ci], px = 106 + clamp(x / H_LEN, 0, 1) * 232; const me = ci === Game.club; disc(g, px, 11, me ? 3.3 : 2.4, me ? C.yellow : '#000'); disc(g, px, 11, me ? 2.5 : 1.7, k.c1); });
    if (p.rtT > 0) { txt('REAKSJON ' + (p.rt / 1000).toFixed(3) + ' S', 200, 90, p.rt < 200 ? C.yellow : C.white, 1, 'c'); }
    this.seq.drawText(60);
    if (this.phase === 'finish' || this.phase === 'dq') {
      const e = this.endT;
      if (this.phase === 'finish') {
        panel(100, 50, 200, 56, .85);
        txt('MÅL!', 200, 56, C.yellow, 2, 'c');
        txt(fmt2(Cls.real(0, p.tf)) + ' S', 200, 76, C.white, 2, 'c');
        txt(this.place + '. PLASS', 200, 94, this.place === 1 ? C.yellow : C.white, 1, 'c');
        if (e > 1.5 && Math.floor(e * 2) % 2 === 0) txt('A = FORTSETT', 200, 112, C.white, 1, 'c');
      }
    }
    if (this.phase === 'start' && this.seq.state === 'pre') txt(this.training ? 'TRENING - 60 M HEKK' : '60 M HEKK', 200, 40, C.white, 2, 'c');
  }
}

/* ======================= 800 M ======================= */
const R8 = { TS: 3, LEN: 800, PPM: 8, PX: 110 };
const STRATS = ['even', 'front', 'kicker', 'fade'];
function drawOval(cx, cy, rx, ry) {
  g.save(); g.lineWidth = 3.2; g.strokeStyle = C.track; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); g.stroke();
  g.lineWidth = .6; g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(cx, cy, rx - 1.6, ry - 1.6, 0, 0, 6.2832); g.stroke(); g.restore();
}
class Run800Scene {
  constructor(training) { this.training = training; this.pausable = true; this.amb = .07; }
  ctl() { return { pad: 'run', a: 'SPURT', b: '', pl: 'LØP' }; }
  enter() {
    Music.stop(); this.belled = false; this.bellT = 0;
    this.seq = new StartSeq(false); this.phase = 'start'; this.realT = 0; this.endT = 0;
    this.pl = { s: 0, v: 0, E: 100, rS: 0, taps: [], last: null, started: false, sprint: false, sprintMul: 1, fin: false, tf: null, ph: 0, rt: null, rtT: 0, boost: 0, msg: '', msgT: 0, bell: false };
    this.cpus = Game.cpu().map(ci => this.simCpu(ci));
  }
  simCpu(ci) {
    const sk = (Game.skill && Game.skill[ci]) || 0;
    const base = clamp(6.72 + sk * .12 + gauss() * .13, 6.25, 7.3), strat = pick(STRATS), rt = rnd(.14, .3), boost = rtBoost(rt * 1000);
    const c = { ci, xs: [], tf: null, rt, strat, ph0: rnd(0, 6) };
    let t = 0, s = 0, v = 0, started = false, nz = 0;
    while (t < 90) {
      if (!started && t >= rt) { started = true; v = 1 + 3 * boost; }
      if (started) {
        const f = s / 800; let m = 1;
        if (strat === 'front') m = f < .4 ? 1.05 : (f < .75 ? 1.0 : .965);
        else if (strat === 'kicker') m = f < .72 ? .975 : (f < .81 ? 1.0 : 1.075);
        else if (strat === 'fade') m = f < .25 ? 1.07 : 1.0 - (f - .25) * .11;
        nz = clamp(nz + (Math.random() - .5) * .003, -.02, .02);
        const vt = base * m * (1 + nz);
        v += (vt - v) * 1.4 * STEP;
        s += v * STEP * R8.TS;
        if (s >= 800 && c.tf == null) c.tf = (t - (s - 800) / (v * R8.TS)) * R8.TS;
        if (c.tf != null && t * R8.TS > c.tf + 3) v *= .95;
      }
      c.xs.push(s); t += STEP;
      if (c.tf != null && t * R8.TS > c.tf + 14) break;
    }
    return c;
  }
  cpuS(c, t) { if (t <= 0) return 0; return c.xs[Math.min(Math.floor(t * 60), c.xs.length - 1)]; }
  cpuV(c, t) { const i = Math.min(Math.floor(t * 60), c.xs.length - 2); return i < 0 ? 0 : (c.xs[i + 1] - c.xs[i]) * 60 / R8.TS; }
  msg(s, d = 1.2) { this.pl.msg = s; this.pl.msgT = d; }
  place() { const p = this.pl; return 1 + this.cpus.filter(c => this.cpuS(c, this.realT) > p.s || (c.tf != null && p.fin && c.tf < p.tf)).length; }
  update(dt) {
    const p = this.pl, sq = this.seq;
    p.msgT = Math.max(0, p.msgT - dt); p.rtT = Math.max(0, p.rtT - dt);
    if (this.phase === 'start') {
      const prev = sq.state; sq.update();
      if (sq.state === 'go' && prev !== 'go') { this.realT = 0; this.phase = 'race'; }
      if (sq.state === 'dq') { this.phase = 'dq'; this.endT = 0; }
      return;
    }
    if (this.phase === 'dq') { this.endT += dt; if (this.endT > 2.6 || (this.endT > 1 && Input.hit.a)) this.done(); return; }
    this.realT += dt; sq.t += dt;
    /* bjella ringer når den fremste løperen går inn i siste runde (400 m) */
    if (this.belled) this.bellT += dt;
    else if (this.phase === 'race') {
      const lead = Math.max(p.s, ...this.cpus.map(c => this.cpuS(c, this.realT)));
      if (lead >= 400) { this.belled = true; this.bellT = 0; Snd.bell(7, .2); Amb.swell(.25, 3); }
    }
    const pressed = Input.hit.l || Input.hit.r || Input.hit.a;
    if (!p.started && !p.fin && pressed) {
      const rt = Input.ts - sq.gunTs;
      if (rt < 100) { sq.fs(); this.phase = sq.state === 'dq' ? 'dq' : 'start'; this.realT = 0; this.endT = 0; return; }
      p.started = true; p.rt = rt; p.rtT = 2.4; p.boost = rtBoost(rt); p.v = 1 + 3 * p.boost;
    }
    if (p.started && !p.fin) {
      for (const k of ['l', 'r']) if (Input.hit[k] && p.last !== k) { p.last = k; p.taps.push(this.realT); Snd.step(.5); }
      p.taps = p.taps.filter(t => this.realT - t < 1);
      p.rS += (p.taps.length - p.rS) * Math.min(1, dt * 5);
      let vt = p.rS < 1 ? p.rS * 4.7 : 4 + .7 * Math.min(p.rS, 7.5);
      if (EZ()) vt = 5.4 + .45 * Math.min(p.rS, 6);   /* hjelp: går selv i jogg, ca. 3 trykk/s gir vanlig tempo */
      const rem = R8.LEN - p.s;
      if (Input.hit.a) {
        if (!p.sprint && rem <= (EZ() ? 220 : 150) && p.E > 1) { p.sprint = true; p.sprintMul = 1 + .3 * (.35 + .65 * p.E / 100); this.msg('SPURT!', 1.5); Snd.perfect(); Snd.cheer(1.5, .15); }
        else if (!p.sprint && rem > (EZ() ? 220 : 150)) { p.E = Math.max(0, p.E - 3); this.msg('FOR TIDLIG!', .8); Snd.beep(200, .1); }
      }
      p.E -= 2.1 * Math.pow(Math.max(p.v, .1) / 6.8, 4) * (p.sprint ? 1.3 : 1) * dt;
      if (p.E <= 0) { p.E = 0; vt = Math.min(vt, 4.6); if (!p.wall) { p.wall = true; this.msg('TOM FOR ENERGI!', 1.6); Snd.groan(); } }
      else if (p.E < 18) vt *= lerp(.88, 1, p.E / 18);
      if (p.sprint) vt *= p.sprintMul;
      p.v += (vt - p.v) * Math.min(1, dt * 1.6);
      p.s += p.v * dt * R8.TS; p.ph = p.s * 1.4;
      if (p.s >= R8.LEN) {
        p.fin = true; p.tf = (this.realT - (p.s - R8.LEN) / (p.v * R8.TS)) * R8.TS;
        this.phase = 'finish'; this.endT = 0; this.pPlace = 1 + this.cpus.filter(c => c.tf < p.tf).length;
        if (this.pPlace <= 2) Snd.cheer(2.2, .2); else Snd.cheer(1.2, .1);
      }
    }
    if (this.phase === 'finish') {
      this.endT += dt; p.v *= .985; p.s += p.v * dt * R8.TS; p.ph = p.s * 1.4;
      if ((this.endT > 1.5 && Input.hit.a) || this.endT > 8) this.done();
    }
  }
  done() {
    const vals = Game.nulls(), tx = Game.nulls('');
    this.cpus.forEach(c => vals[c.ci] = c.tf);
    if (this.pl.tf != null && this.phase !== 'dq') vals[Game.club] = this.pl.tf; else tx[Game.club] = 'DQ';
    Game.eventDone(4, vals, tx, this.training);
  }
  draw() {
    const p = this.pl, ppm = R8.PPM, cam = p.s - R8.PX / ppm, camPx = cam * ppm, T = this.t;
    const sx = m => (m - cam) * ppm;
    drawBackdrop(camPx * 2.2, T);
    drawRunTrack(camPx * 2.2);
    /* 100 m-skilt */
    for (let m = 0; m <= 900; m += 100) {
      const px = sx(m);
      if (px > -20 && px < W + 20) {
        if (m === 0) { for (let i = 0; i < 5; i++) { g.fillStyle = '#fff'; g.fillRect(px - .6, LANE_EDGE[i], 1.8 + i * .2, LANE_EDGE[i + 1] - LANE_EDGE[i]); } }
        else if (m === 800) drawFinishLine(px);
        else distPlate(px, m + ' M');
      }
    }
    const t = this.realT, st = this.seq.state;
    const rows = [];
    this.cpus.forEach((c, k) => rows.push({ lane: k, c, s: this.cpuS(c, t) }));
    rows.push({ lane: 4, c: null, s: p.s });
    for (const r of rows) {
      const isP = !r.c, gy = laneFeet(r.lane);
      let f, x = R8.PX + (r.s - p.s) * ppm;
      if (isP) {
        if (this.phase === 'start' || !p.started) f = st === 'mark' || st === 'warn' ? poseMark() : st === 'set' || st === 'go' ? poseSet() : (st === 'dq' ? poseSlump() : poseStand());
        else if (this.phase === 'dq') f = poseSlump();
        else if (p.fin && p.v < .8) f = this.pPlace === 1 ? poseCheer(T) : poseSlump();
        else if (p.E < 15 && p.E > 0 || p.E <= 0) f = poseTired(p.ph);
        else f = poseRun(p.ph, clamp(p.v / 8, .15, 1.15), 6 + (p.sprint ? 12 : p.v * .8));
        x = R8.PX;
      } else {
        const v = this.cpuV(r.c, t);
        if (t < r.c.rt || this.phase === 'start') f = st === 'mark' || st === 'warn' ? poseMark() : st === 'set' || st === 'go' ? poseSet() : poseStand();
        else if (r.c.tf != null && t * R8.TS > r.c.tf && v < .8) f = poseStand();
        else f = poseRun(r.s * 1.4 + r.c.ph0, clamp(v / 8, .15, 1.15), 6 + v * .8);
      }
      if (x < -14) { if (!isP) { slant(g, 0, laneFeet(r.lane) - 10, 34, 9, 3, 'rgba(8,13,38,.8)'); txt('<' + CLUBS[r.c.ci].ab, 3, laneFeet(r.lane) - 9.4, C.white, 1); } continue; }
      if (x > W + 14) { slant(g, W - 36, laneFeet(r.lane) - 10, 36, 9, 3, 'rgba(8,13,38,.8)'); txt(CLUBS[r.c.ci].ab + '>', W - 4, laneFeet(r.lane) - 9.4, C.white, 1, 'r'); continue; }
      drawRunnerAt(isP ? Game.club : r.c.ci, x, r.lane, f, 1, 16);
      if (isP && !p.fin) youArrow(x, gy - 40 * laneK(4));
      if (isP && p.msgT > 0) txt(p.msg, x, gy - 58 - (1.2 - p.msgT) * 6, p.msg === 'SPURT!' ? C.yellow : (p.msg.indexOf('TOM') === 0 ? C.red : C.white), 1, 'c');
    }
    if (this.phase === 'start' || t < 1.2) rows.forEach(r => txt(r.c ? CLUBS[r.c.ci].ab : 'DU', 6, laneFeet(r.lane) - 9, r.c ? C.white : C.yellow, 1));
    this.hud();
  }
  hud() {
    const p = this.pl, sq = this.seq;
    hudBox(4, 4, 92, 44);
    txt('TID', 9, 6, '#7fa6ff', 1);
    txt(this.phase === 'start' ? '0.0' : fmtTime1(Cls.real(4, p.fin ? p.tf : this.realT * R8.TS)), 92, 4, C.white, 2, 'r');
    txt('ENERGI', 9, 23, '#9fb4ee', 1);
    meter(50, 24.6, 42, 4.6, p.E / 100, p.E > 40 ? '#2ea558' : (p.E > 15 ? '#f39c34' : '#e0242c'));
    txt('TEMPO', 9, 34, '#9fb4ee', 1);
    meter(50, 35.6, 42, 4.6, 0, '#888');
    g.fillStyle = 'rgba(46,165,88,.55)'; g.fillRect(50 + 42 * (6.2 - 3) / 6, 35.6, 42 * 1.4 / 6, 4.6);
    g.fillStyle = p.v > 7.6 ? '#e0242c' : '#ffd23f'; g.fillRect(50, 36.6, 42 * clamp((p.v - 3) / 6, 0, 1), 2.6);
    /* runde/rest + plass */
    const rem = Math.max(0, R8.LEN - p.s);
    hudBox(100, 4, 150, 14);
    txt('RUNDE ' + (p.s < 400 ? 1 : 2) + '/2   IGJEN ' + Math.ceil(rem) + ' M', 105, 8, C.white, 1);
    if (this.phase !== 'start') { hudBox(100, 20, 58, 12); txt('PLASS ' + (p.fin ? this.pPlace : this.place()), 104, 23, C.yellow, 1); }
    /* oval-minikart */
    hudBox(254, 4, 86, 40);
    drawOval(297, 24, 32, 12);
    const dots = this.cpus.map(c => [c.ci, this.cpuS(c, this.realT)]).concat([[Game.club, p.s]]);
    dots.forEach(([ci, s]) => {
      const a = Math.PI / 2 - 6.283 * ((s % 400) / 400), x = 297 + Math.cos(a) * 32, y = 24 + Math.sin(a) * 12, me = ci === Game.club;
      disc(g, x, y, me ? 3.2 : 2.2, me ? C.yellow : '#000'); disc(g, x, y, me ? 2.4 : 1.5, CLUBS[ci].c1);
    });
    if (p.rtT > 0) txt('REAKSJON ' + (p.rt / 1000).toFixed(3) + ' S', 200, 98, p.rt < 200 ? C.yellow : C.white, 1, 'c');
    sq.drawText(60);
    if (this.belled && this.bellT < 2.6 && this.phase === 'race') {
      const k = Math.min(1, this.bellT * 6), sh = this.bellT < 1.6 ? Math.round(Math.sin(this.bellT * 40) * 1.2) : 0;
      g.save(); g.globalAlpha = k; slant(g, 66, 50, 268, 38, 10, 'rgba(8,13,38,.88)'); slant(g, 66, 50, 70, 38, 10, BC.red); g.fillStyle = BC.gold; g.fillRect(76, 87, 248, 1.4); g.restore();
      txt('SISTE RUNDE', 214 + sh, 57, C.white, 3, 'c', BC.dred);
      /* bjelle-ikon */
      const bx = 100, by = 64;
      g.save(); g.translate(bx, by); g.rotate(Math.sin(this.bellT * 40) * (this.bellT < 1.6 ? .22 : 0));
      g.fillStyle = lgrad(g, -8, 10, [[0, '#ffe68a'], [1, '#c98f00']]); g.beginPath(); g.moveTo(-8, 9); g.quadraticCurveTo(-8, -8, 0, -9); g.quadraticCurveTo(8, -8, 8, 9); g.closePath(); g.fill();
      g.fillRect(-10, 8, 20, 2.6); ball(g, 0, 13, 2.2, '#7a5a00', .2); g.restore();
    }
    if (this.phase === 'race' && p.started && !p.sprint && rem <= (EZ() ? 220 : 150) && !p.fin && Math.floor(this.t * 4) % 2 === 0 && !(this.belled && this.bellT < 2.6)) txt(isTouch() ? 'TRYKK SPURT!' : 'TRYKK A = SPURT!', 200, 70, C.yellow, 2, 'c', C.dred);
    if (this.phase === 'start' && sq.state === 'pre') txt(this.training ? 'TRENING - 800 M' : '800 M', 200, 40, C.white, 2, 'c');
    if (this.phase === 'race' && !p.started) txt('LØP!', 200, 70, C.yellow, 2, 'c');
    if (this.phase === 'finish') {
      panel(100, 50, 200, 56, .85);
      txt('MÅL!', 200, 56, C.yellow, 2, 'c');
      txt(fmtTime(Cls.real(4, p.tf)), 200, 76, C.white, 2, 'c');
      txt(this.pPlace + '. PLASS', 200, 94, this.pPlace === 1 ? C.yellow : C.white, 1, 'c');
      if (this.endT > 1.5 && Math.floor(this.endT * 2) % 2 === 0) txt('A = FORTSETT', 200, 112, C.white, 1, 'c');
    }
  }
}
