/* =====================================================================
   DEL 4c: PREMIEUTDELING – seierspall, fanfare, laviso.no-fotograf, rar premie
   ===================================================================== */
function makePrize() {
  const fixed = [
    'Et gavekort på 3 vafler i kiosken', 'En signert startblokk fra 1994', 'Årsforbruk av sportsdrikk med lakrissmak',
    'En pent brukt piggsko i str. 46', 'Livslang rabatt på tomme pantebokser', 'En stoppeklokke som går litt for fort',
    'En halv termos kaffe fra dugnadskiosken', 'Ett års abonnement på Byåsen-bakken (kun nedover)',
    'En gyllen hekk (ikke ekte gull, ikke ekte hekk)', 'Et diplom du må laminere selv', 'En brukt startpistol (uten krutt)',
    'Tre ukers fri parkering på Dalgård (gjelder bare søndager)', 'Et signert fotografi av en sko', 'En kasse litt for gamle energibarer'
  ];
  const gens = [
    () => pick(['Et gavekort på', 'Gratis', 'Årsforbruk av']) + ' ' + pick(['vafler i kiosken', 'sportsdrikk med lakrissmak', 'skolebrød fra dugnadskiosken', 'energigel med brunostsmak', 'kaffe på termos', 'pølser med lompe']),
    () => pick(['En signert', 'En pent brukt', 'En ekte', 'En litt for liten']) + ' ' + pick(['startblokk fra 1994', 'piggsko i str. 46', 'stoppeklokke fra Dalgård', 'hekk uten hekkeføtter', 'målsnor', 'målfoto av en ukjent mann', 'drikkebelte']),
    () => 'Retten til å ' + pick(['bære flagget ved neste dugnad', 'velge musikk i høyttaleren i en hel runde', 'rake lengdegropa alene', 'rope «PÅ PLASS» neste søndag', 'sitte i dommertelt på dugnad', 'sette ut kjegler i hele sesongen'])
  ];
  return Math.random() < .45 ? pick(fixed) : pick(gens)();
}
function wrapText(s, n) {
  const out = []; let line = '';
  s.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; });
  if (line.trim()) out.push(line.trim());
  return out;
}
class PodiumScene {
  constructor() { this.pausable = false; this.amb = .09; }
  ctl() { return { pad: 'none', a: 'TIL MENY', b: '' }; }
  enter() {
    Music.play('fanfare'); Snd.cheer(4, .25);
    this.order = [0, 1, 2, 3, 4].sort((a, b) => Game.totals[b] - Game.totals[a] || (a === Game.club ? -1 : 0));
    this.prize = makePrize(); this.prizeLines = wrapText(this.prize, 34);
    this.flash = 0; this.next = 1.1; this.conf = []; this.sparks = []; this.cheerT = 3.5; this.cams = 0;
  }
  update(dt) {
    this.next -= dt;
    this.flash = Math.max(0, this.flash - dt);
    if (this.next <= 0) { this.flash = .13; this.next = rnd(.9, 2.1); Snd.click(); this.cams++; for (let i = 0; i < 5; i++) this.sparks.push({ x: rnd(10, 390), y: rnd(80, 105), t: rnd(.06, .16) }); }
    this.cheerT -= dt; if (this.cheerT <= 0) { this.cheerT = 4.2; Snd.cheer(3, .18); }
    if (Math.random() < .55) this.conf.push({ x: rnd(0, W), y: -4, vx: rnd(-10, 10), vy: rnd(30, 70), c: pick([C.red, C.yellow, C.white, C.blue, C.green, C.pink, C.orange]), t: 0 });
    this.conf.forEach(c => { c.t += dt; c.x += (c.vx + Math.sin(c.t * 6) * 14) * dt; c.y += c.vy * dt; }); this.conf = this.conf.filter(c => c.y < H);
    this.sparks.forEach(s => s.t -= dt); this.sparks = this.sparks.filter(s => s.t > 0);
    if (this.t > 3 && Input.hit.a) { Snd.ok(); Game.toTitle(); }
  }
  draw() {
    const T = this.t, PY = 196;
    drawBackdrop(0, T, { dusk: true });
    fieldBand(0, 150, 206, 'track');
    g.fillStyle = 'rgba(30,40,90,.3)'; g.fillRect(0, 150, W, 57);
    /* lyspytt under seierspallen */
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(200, PY + 2); g.scale(1, .12);
    g.fillStyle = rgrad(g, 0, 0, 0, 140, [[0, 'rgba(255,238,180,.5)'], [1, 'rgba(255,238,180,0)']]); g.beginPath(); g.arc(0, 0, 140, 0, 6.2832); g.fill(); g.restore();
    /* lyskjegler fra lysmastene mot seierspallen */
    g.save(); g.globalCompositeOperation = 'lighter';
    [[40, 144], [200, 200], [360, 256]].forEach(([mx, tx]) => { const gr = g.createLinearGradient(0, 20, 0, 190); gr.addColorStop(0, 'rgba(255,240,190,.22)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(mx - 3, 20); g.lineTo(mx + 3, 20); g.lineTo(tx + 34, 196); g.lineTo(tx - 34, 196); g.closePath(); g.fill(); });
    g.restore();
    /* lysglimt i publikum */
    this.sparks.forEach(s => { g.fillStyle = '#fff'; g.fillRect(Math.round(s.x) - 1, Math.round(s.y), 3, 1); g.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 3); });
    /* seierspall */
    const slots = [[144, 2, 28], [200, 1, 38], [262, 3, 20]];
    const medals = { 1: '#ffd23f', 2: '#d0d6e2', 3: '#c9803a' };
    const dd = 7;
    slots.forEach(([cx, rank, h]) => {
      const x0 = cx - 27, x1 = cx + 27, top = PY - h, hot = rank === 1;
      groundShadow(cx + 6, PY + 1, 40, 3.4, .4);
      /* høyre sideflate */
      g.fillStyle = hot ? '#5e0e16' : '#0c1236'; g.beginPath(); g.moveTo(x1, top); g.lineTo(x1 + dd, top - dd * .6); g.lineTo(x1 + dd, PY - dd * .6); g.lineTo(x1, PY); g.closePath(); g.fill();
      /* forside */
      g.fillStyle = lgrad(g, top, PY, hot ? [[0, '#ee2b33'], [1, '#98151e']] : [[0, '#2c4096'], [1, '#141f55']]); g.fillRect(x0, top, 54, h);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x0, top, 8, h);
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x0, top, 54, 1.6);
      /* toppflate */
      g.fillStyle = lgrad(g, top - dd * .6, top, [[0, '#f2f4fa'], [1, '#c3c9da']]); g.beginPath(); g.moveTo(x0 + dd, top - dd * .6); g.lineTo(x1 + dd, top - dd * .6); g.lineTo(x1, top); g.lineTo(x0, top); g.closePath(); g.fill();
      txt(String(rank), cx, top + (h < 30 ? 5 : 9), medals[rank], h < 30 ? 2 : 3, 'c', 'rgba(0,0,0,.55)');
      const ci = this.order[rank - 1], me = ci === Game.club, cl = CLUBS[ci];
      const f = rank === 1 ? poseCheer(T + rank) : poseStand();
      if (rank === 2) { f.ar = 120 + Math.sin(T * 6) * 18; f.er = 130 + Math.sin(T * 6) * 18; }
      if (rank === 3) { f.al = 140 + Math.sin(T * 7) * 16; f.el = 150 + Math.sin(T * 7) * 16; }
      const jump = hot ? Math.abs(Math.sin(T * 5)) * .06 : 0, gyP = top - dd * .28;
      groundShadow(cx + 1, gyP + .4, 11, 2.2, .4 * (1 - jump * 2));
      drawFigure(g, cx, gyP, 30, f, athCols(ci), 1, jump);
      ball(g, cx + 2, gyP - 30 * .8, 2.5, medals[rank], .45);
      /* navneplate i sendingsstil */
      const lab = me ? 'DU!' : cl.ab, lw = tw(lab, 1) + 17, lx = cx - lw / 2, ly = top - 80;
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 3; slant(g, lx, ly, lw, 10.4, 3.2, me ? BC.gold : 'rgba(10,18,50,.92)'); g.restore();
      g.fillStyle = cl.c1; g.fillRect(lx + 4.5, ly + 2.2, 2.6, 6); g.fillStyle = cl.c2; g.fillRect(lx + 7.1, ly + 2.2, 2.6, 6);
      txt(lab, lx + 12.5, ly + 1.2, me ? BC.navy : C.white, 1);
      txt(String(Game.totals[ci]) + ' P', cx, PY + 1.6, C.white, 1, 'c');
    });
    /* 4. og 5. plass */
    [3, 4].forEach((k, i) => { const ci = this.order[k]; txt((k + 1) + '. ' + (ci === Game.club ? 'DU' : CLUBS[ci].ab) + '  ' + Game.totals[ci] + ' P', 322 + 0, 160 + i * 11, ci === Game.club ? C.yellow : '#dfe7ff', 1); });
    /* fotograf med laviso.no-vest */
    const px = 82, shoot = this.flash > 0;
    const fcol = { c1: '#a6e800', c2: '#2b2f3e', skin: C.skin1, skinD: shade(C.skin1, .8), hair: '#5a3a1e', shoe: '#222' };
    const kneel = Math.floor(T / 3.2) % 2 === 1;
    const pf = poseCamera(T); if (kneel) { pf.h = .52; pf.tl = 80; pf.sl = -5; pf.tr = 20; pf.sr = -90; pf.to = 10; }
    groundShadow(px, PY + .5, 13, 2.4, .38);
    drawFigure(g, px, PY, 30, pf, fcol, 1, shoot ? .0 : Math.sin(T * 3) * .01);
    const camX = px + 17, camY = PY - (kneel ? 30 : 47);
    g.fillStyle = '#15171f'; rrect(g, camX, camY, 9, 6, 1); g.fill(); g.fillStyle = '#4a4f66'; rrect(g, camX + 1, camY - 1.4, 4, 1.8, .6); g.fill(); ball(g, camX + 9, camY + 3, 2.2, '#8ea2ff', .6);
    txt('L', px - 3, PY - (kneel ? 24 : 36), '#222', 1, 'c', null);
    /* laviso.no-skilt */
    g.fillStyle = '#d9d9d9'; g.fillRect(14, PY - 6, 2, 8); g.fillRect(52, PY - 6, 2, 8);
    rrect(g, 5, PY - 23, 58, 18, 2.5); g.fillStyle = '#fff'; g.fill(); rrect(g, 6.2, PY - 21.8, 55.6, 15.6, 1.8); g.fillStyle = lgrad(g, PY - 22, PY - 6, [[0, '#1c46a0'], [1, '#0e2260']]); g.fill();
    g.fillStyle = '#a6e800'; g.fillRect(7, PY - 21, 54, 2);
    txt('laviso.no', 34, PY - 15, C.white, 1, 'c', null);
    if (shoot) {
      const fx = camX + 10, fy = camY + 3;
      g.fillStyle = '#fff';
      for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4, l = a % 2 ? 7 : 11; pline(g, fx, fy, fx + Math.cos(ang) * l, fy + Math.sin(ang) * l, 1, '#fff'); }
      disc(g, fx, fy, 3, '#fff');
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, 0, W, H);
    }
    /* konfetti */
    this.conf.forEach(c => { g.fillStyle = c.c; g.save(); g.translate(c.x, c.y); g.rotate(c.t * 5); g.fillRect(-1.2, -.8, 2.4, 1.6); g.restore(); });
    /* overskrifter */
    const winner = this.order[0];
    panel(60, 5, 280, 33, .84);
    txt('PREMIEUTDELING', 200, 9, C.yellow, 2, 'c', C.dred);
    txt(winner === Game.club ? 'GRATULERER - DU VANT BYÅSENLEKENE!' : CLUBS[winner].name.toUpperCase() + ' VANT MANGEKAMPEN', 200, 26.5, C.white, 1, 'c');
    /* premietavle */
    if (this.t > 1.8) {
      const pe = Math.min(1, (this.t - 1.8) / .4), ph = 22 + this.prizeLines.length * 10;
      const y0 = 43 - (1 - pe) * 30;
      panel(30, y0, 340, ph, .88);
      txt('TILFELDIG PREMIE TIL VINNEREN', 200, y0 + 4, C.orange, 1, 'c');
      this.prizeLines.forEach((l, i) => txt(l, 200, y0 + 16 + i * 10, C.white, 1, 'c'));
    }
    const mine = this.order.indexOf(Game.club) + 1;
    if (this.t > 3 && Math.floor(this.t * 2) % 2 === 0) txt((isTouch() ? 'TRYKK TIL MENY' : 'A = TILBAKE TIL MENY') + (mine > 3 ? '   (DU BLE NR ' + mine + ')' : ''), 200, 211, C.white, 1, 'c');
  }
}
