/* =====================================================================
   DEL 3: SCENE-MASKIN, SPILLTILSTAND OG MENYER
   ===================================================================== */
const Scenes = {
  cur: null, fade: 0,
  go(s) { this.cur = s; s.t = 0; this.fade = 1; Input.clear(); Amb.set(s.amb != null ? s.amb : .035); if (s.enter) s.enter(); }
};
const Game = {
  mode: 'dec', club: 0, totals: [0, 0, 0, 0, 0], evIdx: 0, paused: false, trainEv: 0, bestHist: {},
  cpu() { return [0, 1, 2, 3, 4].filter(i => i !== this.club); },
  pause(p) { if (Scenes.cur && Scenes.cur.pausable) { this.paused = p; if (p) Input.clear(); } },
  toTitle() { this.paused = false; Music.stop(); Scenes.go(new TitleScene()); },
  startDecathlon() {
    this.mode = 'dec'; this.totals = [0, 0, 0, 0, 0]; this.evIdx = 0; this.history = []; this.newSkills();
    Scenes.go(new IntroScene(0, false));
  },
  newSkills() { this.skill = [0, 1, 2, 3, 4].map(() => clamp(gauss() * .7, -1.3, 1.3)); },
  startTraining() { this.mode = 'train'; this.newSkills(); Scenes.go(new TrainSelectScene()); },
  makeEvent(i, training) {
    return [new HurdlesScene(training), new LongJumpScene(training), new ShotScene(training), new HighJumpScene(training), new Run800Scene(training)][i];
  },
  /* vals[ci] = tall eller null, txt[ci] = tekst ved ugyldig/DQ/NM */
  eventDone(i, vals, txt, training) {
    const ev = EVENTS[i];
    const pts = vals.map(v => evPoints(ev, v));
    const order = [0, 1, 2, 3, 4].sort((a, b) => cmpVal(ev, vals[a], vals[b]) || (a === Game.club ? -1 : 0));
    if (training) { Scenes.go(new TrainResultScene(i, vals, txt, pts, order)); return; }
    pts.forEach((p, ci) => this.totals[ci] += p);
    this.history.push({ vals, pts, order });
    Scenes.go(new ResultScene(i, vals, txt, pts, order));
  }
};
function cmpVal(ev, a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return ev.kind === 'time' ? a - b : b - a;
}

/* ---------- felles tegning for løpebane (semi-3D: nære baner er større og lavere i bildet) ---------- */
const LANE_TOP = 120, LANE_HS = [13, 14.6, 16.2, 17.8, 19.4], LANE_H = 16;
const LANE_EDGE = (() => { const a = [LANE_TOP]; LANE_HS.forEach(h => a.push(a[a.length - 1] + h)); return a; })();
const LANE_BOT = LANE_EDGE[5];
const laneK = i => .84 + .085 * i;
const laneFeet = i => LANE_EDGE[i + 1] - 3.4 * laneK(i);
const BC = { navy: '#0c1535', navy2: '#18265a', red: '#e0242c', dred: '#8e1620', cyan: '#37d4ff', gold: '#ffd23f' };
function drawRunTrack(camPx) {
  /* indre kant (kantstein) */
  g.fillStyle = lgrad(g, LANE_TOP - 4, LANE_TOP, [[0, '#f4efe6'], [1, '#c9c2b4']]); g.fillRect(0, LANE_TOP - 3, W, 3);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, LANE_TOP - .4, W, .8);
  const tw0 = BG.lane.width / S, o = -(((camPx % tw0) + tw0) % tw0);
  for (let i = 0; i < 5; i++) {
    const y0 = LANE_EDGE[i], y1 = LANE_EDGE[i + 1], k = i / 4;
    g.fillStyle = lgrad(g, y0, y1, [[0, shade(C.track, .82 + .1 * k)], [.5, shade(C.track, .98 + .1 * k)], [1, shade(C.track, 1.04 + .08 * k)]]); g.fillRect(0, y0, W, y1 - y0);
    for (let px = o; px < W; px += tw0) g.drawImage(BG.lane, 0, 0, BG.lane.width, (y1 - y0) * S, px, y0, tw0, y1 - y0);
    /* banelinje: tykkere nærmere kamera */
    g.fillStyle = 'rgba(247,240,230,.96)'; g.fillRect(0, y1 - .35 - .16 * i, W, .7 + .32 * i);
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(0, y1 + .4 + .16 * i, W, .8);
  }
  g.fillStyle = lgrad(g, LANE_TOP, LANE_TOP + 8, [[0, 'rgba(0,0,0,.28)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, LANE_TOP, W, 8);
  g.fillStyle = lgrad(g, LANE_BOT, LANE_BOT + 6, [[0, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, LANE_BOT, W, 6);
  g.fillStyle = 'rgba(247,240,230,.95)'; g.fillRect(0, LANE_BOT - .6, W, 1.6);
}
/* vignett over hele bildet (kinoaktig ramme) */
function drawVignette() { blit(BG.vig, 0, 0); }
/* mykt skyggekast på bakken */
function groundShadow(x, y, rx, ry = rx * .2, a = .32) {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  g.fillStyle = rgrad(g, 0, 0, 0, rx, [[0, `rgba(0,0,0,${a})`], [1, 'rgba(0,0,0,0)']]);
  g.beginPath(); g.arc(0, 0, rx, 0, 6.2832); g.fill(); g.restore();
}
/* tegn en løper i bane (lane 0 = lengst bak, 4 = nærmest) */
function drawRunnerAt(ci, x, lane, f, dir = 1, ppm = 16, lift = 0) {
  const k = laneK(lane), gy = laneFeet(lane);
  groundShadow(x - 1, gy + .6, 9 * k * (1 - Math.min(.5, lift * .3)), 2 * k, .34 * (1 - Math.min(.5, lift * .4)));
  drawFigure(g, x, gy, ppm * k, f, athCols(ci), dir, lift);
}
function panel(x, y, w, h, a = .78) {
  g.save();
  rrect(g, x, y, w, h, 3.5);
  g.fillStyle = lgrad(g, y, y + h, [[0, `rgba(26,40,92,${Math.min(1, a + .06)})`], [1, `rgba(8,13,38,${Math.min(1, a + .12)})`]]); g.fill();
  g.strokeStyle = 'rgba(160,190,255,.35)'; g.lineWidth = .6; g.stroke();
  g.clip(); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x, y, w, h * .42);
  g.fillStyle = BC.red; g.fillRect(x, y, w * .36, 1.4);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + w * .36, y, w * .64, .5);
  g.restore();
}
function drawMenu(items, sel, cx, y0, step = 14, sc = 1) {
  Menu.rect = { cx, y0, step, n: items.length };
  items.forEach((it, i) => {
    const on = i === sel, y = y0 + i * step, bw = 190, bx = cx - bw / 2;
    if (on) {
      g.save(); g.shadowColor = 'rgba(224,36,44,.55)'; g.shadowBlur = 10 * S / 3; slant(g, bx - 2, y - 3, bw + 4, step - 1.4, 6, '#e0242c'); g.restore();
      g.fillStyle = lgrad(g, y - 3, y + step - 4, [[0, 'rgba(255,255,255,.28)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.2)']]);
      g.save(); g.beginPath(); g.moveTo(bx + 4, y - 3); g.lineTo(bx + bw + 2, y - 3); g.lineTo(bx + bw - 4, y + step - 4.4); g.lineTo(bx - 2, y + step - 4.4); g.closePath(); g.fill(); g.restore();
    } else slant(g, bx, y - 3, bw, step - 1.4, 6, 'rgba(10,18,50,.62)');
    txt(typeof it === 'function' ? it() : it, cx, y - .2, on ? C.white : '#c9d4ff', sc, 'c', on ? 'rgba(80,0,10,.7)' : C.black);
  });
}
/* trykk direkte på menypunkt (mobil): returnerer indeks eller -1 */
const Menu = {
  rect: null,
  tapped() {
    const t = Input.tap, r = this.rect;
    if (!t || !r) return -1;
    const i = Math.floor((t.y - (r.y0 - 3)) / r.step);
    return (Math.abs(t.x - r.cx) < 110 && i >= 0 && i < r.n) ? i : -1;
  }
};
function navIndex(sel, n, vertical = true) {
  const tp = Menu.tapped();
  if (tp >= 0) { Input.hit.a = 1; return tp; }
  if (Input.hit.u || Input.hit.l) { Snd.select(); return (sel + n - 1) % n; }
  if (Input.hit.d || Input.hit.r) { Snd.select(); return (sel + 1) % n; }
  return sel;
}

/* ---------- Tittelskjerm ---------- */
class TitleScene {
  constructor() { this.sel = 0; }
  ctl() { return { pad: 'nav', a: 'VELG', b: '' }; }
  enter() { Music.play('title'); }
  items() {
    return ['Mangekamp', 'Treningsmodus', 'Slik spiller du', () => 'Lyd: ' + (Snd.muted ? 'av' : 'på')];
  }
  update(dt) {
    this.sel = navIndex(this.sel, 4);
    if (this.t > .25 && Input.hit.a) {
      Snd.ok();
      if (this.sel === 0) { Game.mode = 'dec'; Scenes.go(new ClubScene()); }
      else if (this.sel === 1) { Game.mode = 'train'; Scenes.go(new ClubScene()); }
      else if (this.sel === 2) Scenes.go(new HelpScene());
      else Snd.setMuted(!Snd.muted);
    }
  }
  draw() {
    const t = this.t, cam = t * 40;
    drawBackdrop(cam, t);
    drawRunTrack(cam);
    for (let i = 0; i < 5; i++) {
      const sp = 70 + i * 9, x = ((t * sp + i * 97) % 560) - 80;
      drawRunnerAt(i, x, i, poseRun(t * (11 + i * .6) + i, 1, 9));
    }
    /* logo i sendingsstil */
    g.fillStyle = lgrad(g, 0, 78, [[0, 'rgba(6,10,30,.72)'], [1, 'rgba(6,10,30,0)']]); g.fillRect(0, 0, W, 78);
    const wob = Math.sin(t * 2) * .6;
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 8;
    slant(g, 64, 8 + wob, 272, 34, 14, BC.navy2); g.restore();
    slant(g, 64, 8 + wob, 272, 34, 14, 'rgba(255,255,255,.07)');
    g.fillStyle = BC.red; g.beginPath(); g.moveTo(64 + 14, 8 + wob); g.lineTo(64 + 24, 8 + wob); g.lineTo(64 + 10, 42 + wob); g.lineTo(64, 42 + wob); g.closePath(); g.fill();
    g.fillStyle = BC.gold; g.fillRect(64 + 14, 41 + wob, 258 - 14, 1.4);
    txt('BYÅSENLEKENE', 206, 12.5 + wob, C.white, 3, 'c', 'rgba(0,0,30,.65)');
    slant(g, 128, 46, 144, 13, 6, BC.red);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(134, 46, 138, 3.6);
    txt('MANGEKAMP', 200, 47.4, C.white, 1.5, 'c', C.dred);
    slant(g, 92, 62.4, 216, 11, 4, 'rgba(8,13,38,.8)');
    txt('DALGÅRD FRIIDRETTSBANE · TRONDHEIM', 200, 63.4, '#dfe7ff', 1, 'c');
    panel(120, 132, 160, 62, .72);
    drawMenu(this.items(), this.sel, 200, 138, 14);
    txt(isTouch() ? 'TRYKK PÅ ET VALG' : '< > ELLER OPP/NED = BLA   A = VELG', 200, 202, C.white, 1, 'c');
    txt('5 ØVELSER · 5 KLUBBER · 1 GULLMEDALJE', 200, 214, '#aab6dd', 1, 'c');
  }
}
class HelpScene {
  ctl() { return { pad: 'nav', a: 'OK', b: 'TILBAKE' }; }
  update() { if (this.t > .2 && (Input.hit.a || Input.hit.b || Input.tap)) { Snd.back(); Scenes.go(new TitleScene()); } }
  draw() {
    drawBackdrop(this.t * 10, this.t);
    panel(14, 10, 372, 205, .88);
    txt('SLIK SPILLER DU', 200, 16, C.yellow, 2, 'c');
    const tch = isTouch();
    const L = [
      ['KONTROLLER', C.yellow],
      tch ? ['MOBIL: STORT LØPEFELT = TRYKK RASKT OG JEVNT (FELTET VEKSLER SELV VENSTRE/HØYRE)', C.white]
          : ['VENSTRE/HØYRE (PILTASTER ELLER A/D) ETTER HVERANDRE = FART', C.white],
      tch ? ['KNAPPENE A OG B TIL HØYRE. NAVN OG FUNKSJON ENDRES ETTER ØVELSEN', C.grey]
          : ['Z/MELLOMROM = A,  X = B,  P = PAUSE,  M = LYD', C.grey],
      ['60 M HEKK: TRYKK A (HOPP) RETT FØR HEKKEN', C.white],
      ['LENGDE: LØP OPP FART, HOLD A FOR SATSVINKEL, SLIPP FØR PLANKEN', C.white],
      ['KULE: A = START OG KRAFT, B = STØT. IKKE TRÅKK OVER', C.white],
      ['HØYDE: LØP INN, TRYKK A NÅR MARKØREN ER I GRØNT. DU HOPPER SELV', C.white],
      ['800 M: JEVN RYTME, SPAR KREFTER. A = SPURT (150 M IGJEN)', C.white],
      ['LØPENE: INNTA PLASSENE - KLAR - SKUDD. TYVSTART = ADVARSEL', C.white],
      ['SISTE RUNDE PÅ 800 M MARKERES MED BJELLE', C.white],
      ['MANGEKAMP: POENG ETTER HVER ØVELSE. BESTE SAMMENLAGT VINNER', C.white]
    ];
    L.forEach((l, i) => txt(l[0], 200, 38 + i * 14, l[1], 1, 'c'));
    txt('TRYKK FOR Å GÅ TILBAKE', 200, 204, C.yellow, 1, 'c');
  }
}

/* ---------- Klubbvalg ---------- */
class ClubScene {
  constructor() { this.sel = Game.club; }
  ctl() { return { pad: 'nav', a: 'VELG', b: 'TILBAKE' }; }
  update() {
    const tp = Input.tap;
    if (tp && tp.y > 36 && tp.y < 176) { const i = clamp(Math.floor(tp.x / 80), 0, 4); this.sel = i; Input.hit.a = 1; }
    if (Input.hit.l || Input.hit.u) { this.sel = (this.sel + 4) % 5; Snd.select(); }
    if (Input.hit.r || Input.hit.d) { this.sel = (this.sel + 1) % 5; Snd.select(); }
    if (this.t > .2 && Input.hit.b) { Snd.back(); Scenes.go(new TitleScene()); }
    if (this.t > .2 && Input.hit.a) {
      Snd.ok(); Game.club = this.sel;
      if (Game.mode === 'dec') Game.startDecathlon(); else Game.startTraining();
    }
  }
  draw() {
    const t = this.t;
    drawBackdrop(t * 8, t);
    g.fillStyle = 'rgba(8,12,28,.55)'; g.fillRect(0, 0, W, H);
    txt('VELG KLUBB', 200, 10, C.yellow, 2, 'c');
    txt(Game.mode === 'dec' ? 'MANGEKAMP' : 'TREINING', 200, 30, C.white, 1, 'c');
    for (let i = 0; i < 5; i++) {
      const cx = 40 + i * 80, on = i === this.sel, k = CLUBS[i];
      /* kort i sendingsstil */
      g.save(); if (on) { g.shadowColor = 'rgba(224,36,44,.5)'; g.shadowBlur = 8; }
      rrect(g, cx - 36, 52, 72, 124, 4); g.fillStyle = on ? lgrad(g, 52, 176, [[0, 'rgba(60,84,170,.55)'], [1, 'rgba(12,20,56,.7)']]) : 'rgba(10,18,50,.42)'; g.fill(); g.restore();
      g.save(); rrect(g, cx - 36, 52, 72, 124, 4); g.strokeStyle = on ? 'rgba(255,255,255,.7)' : 'rgba(160,190,255,.22)'; g.lineWidth = on ? 1 : .6; g.stroke(); g.clip();
      g.fillStyle = on ? BC.red : k.c1; g.fillRect(cx - 36, 52, 72, 2.2); g.restore();
      if (on) youArrow(cx, 56);
      const f = on ? poseRun(t * 12, 1, 8) : poseStand();
      groundShadow(cx, 141, 12, 2.4, .4);
      drawFigure(g, cx, 140, 40, f, athCols(i), 1, on ? Math.abs(Math.sin(t * 12)) * .03 : 0);
      g.fillStyle = k.c1; g.fillRect(cx - 14, 150, 14, 5); g.fillStyle = k.c2; g.fillRect(cx, 150, 14, 5);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(cx - 14, 150, 28, 1.4);
      txt(k.ab, cx, 160, on ? C.yellow : C.white, 1, 'c');
    }
    panel(60, 180, 280, 30, .8);
    txt(CLUBS[this.sel].name, 200, 186, C.white, 2, 'c');
    txt(isTouch() ? 'TRYKK PÅ KLUBBEN DIN' : '< > BLA    A = OK    B = TILBAKE', 200, 214, C.white, 1, 'c');
  }
}

/* ---------- Trening: velg øvelse ---------- */
class TrainSelectScene {
  constructor() { this.sel = Game.trainEv; }
  ctl() { return { pad: 'nav', a: 'START', b: 'TILBAKE' }; }
  update() {
    this.sel = navIndex(this.sel, 5);
    if (this.t > .2 && Input.hit.b) { Snd.back(); Scenes.go(new ClubScene()); }
    if (this.t > .2 && Input.hit.a) { Snd.ok(); Game.trainEv = this.sel; Scenes.go(new IntroScene(this.sel, true)); }
  }
  draw() {
    drawBackdrop(this.t * 8, this.t);
    g.fillStyle = 'rgba(8,12,28,.6)'; g.fillRect(0, 0, W, H);
    txt('TRENINGSMODUS', 200, 16, C.yellow, 2, 'c');
    txt('VELG ØVELSE FRITT - INGEN POENGPRESS', 200, 40, C.white, 1, 'c');
    panel(110, 62, 180, 94, .8);
    drawMenu(EVENTS.map(e => e.name), this.sel, 200, 72, 17, 1);
    txt(isTouch() ? 'TRYKK PÅ ØVELSEN' : 'A = START    B = TILBAKE', 200, 190, C.white, 1, 'c');
  }
}

/* ---------- Instruksjon før hver øvelse ---------- */
const INTRO = [
  ['INNTA PLASSENE - KLAR - SKUDD! IKKE TRYKK FØR SKUDDET.', 'LØP MED RASKE TRYKK (VENSTRE/HØYRE ETTER HVERANDRE)', 'A = HOPP OVER HEKKEN. TIMING RETT FØR HEKKEN GIR', 'LAVT OG RASKT HOPP. FOR TIDLIG/SEN = RIV OG FARTSTAP.', '5 HEKKER. TYVSTART: ADVARSEL, ANDRE GANG = UTE.'],
  ['LØP OPP FART MED RASKE, JEVNE TRYKK.', 'NÆR PLANKEN: TRYKK OG HOLD A - VINKELMÅLER GÅR.', 'SLIPP A RETT FØR PLANKEN. IDEELL VINKEL = GRØNT.', 'TRÅKKER DU OVER PLANKEN ER HOPPET UGYLDIG.', '3 FORSØK - BESTE HOPP TELLER.'],
  ['A = START GLID/ROTASJON - TRYKK A GJENTATT FOR KRAFT.', 'B = STØT! VELGER UTKASTVINKEL OG LØSNING.', 'TRYKK B NÅR UTØVEREN NÆRMER SEG RINGENS KANT:', 'IDEELL VINKEL ER I DET GRØNNE. TRÅKK OVER = UGYLDIG.', '3 FORSØK - BESTE STØT TELLER.'],
  ['ENKELT: VELG HØYDE, LØP INN OG TRYKK A ÉN GANG.', 'TRYKK NÅR MARKØREN ER I DET GRØNNE FELTET,', 'DA HOPPER UTØVEREN SELV. TIDLIG ELLER SENT', 'GIR DÅRLIG SATS. 3 RIV PÅ SAMME HØYDE = UTE.', 'LISTA HEVES 5 CM. PASSE ELLER HOPP OVER FOR Å SPARE FORSØK.'],
  ['INNTA PLASSENE - KLAR - SKUDD! 2 RUNDER.', 'HOLD JEVN RYTME. TEMPO KOSTER ENERGI!', 'TOM FOR ENERGI = DU BLIR TUNG I BENA.', 'A = SPURT NÅR DET GJENSTÅR 150 M. BJELLA = SISTE RUNDE.', 'JO MER ENERGI IGJEN, JO STERKERE SPURT.']
];
class IntroScene {
  constructor(i, training) { this.i = i; this.training = training; }
  ctl() { return { pad: 'nav', a: 'START', b: 'TILBAKE' }; }
  enter() { Music.stop(); }
  update() {
    if (this.t > .3 && Input.hit.a) { Snd.ok(); Scenes.go(Game.makeEvent(this.i, this.training)); }
    if (this.t > .3 && Input.hit.b) { Snd.back(); if (this.training) Scenes.go(new TrainSelectScene()); else Game.toTitle(); }
  }
  draw() {
    const ev = EVENTS[this.i];
    drawBackdrop(this.t * 8, this.t);
    g.fillStyle = 'rgba(8,12,28,.5)'; g.fillRect(0, 0, W, H);
    panel(20, 12, 360, 200, .86);
    txt(Game.mode === 'dec' && !this.training ? 'ØVELSE ' + (this.i + 1) + ' AV 5' : 'TRENING', 200, 20, C.grey, 1, 'c');
    txt(ev.name, 200, 34, C.yellow, 3, 'c', C.dred);
    INTRO[this.i].forEach((l, k) => txt(l, 200, 68 + k * 14, C.white, 1, 'c'));
    txt('POENG: ' + ev.ref, 200, 146, C.orange, 1, 'c');
    const f = [poseMark, poseSet, poseShotStand, poseStand, poseStand][this.i];
    drawFigure(g, 70, 200, 30, this.i === 0 || this.i === 4 ? poseRun(this.t * 11, 1, 8) : poseCheer(this.t), athCols(Game.club), 1);
    drawFigure(g, 330, 200, 30, poseRun(this.t * 11 + 2, 1, 8), athCols(Game.club), -1);
    txt(isTouch() ? 'TRYKK START' : 'A = START       B = TILBAKE', 200, 196, C.yellow, 1, 'c');
  }
}

/* ---------- Resultat etter øvelse (mangekamp) ---------- */
function resultRow(ev, ci, y, x, v, tx, pts, rank, hl) {
  const k = CLUBS[ci];
  if (hl) { g.fillStyle = 'rgba(255,210,63,.22)'; g.fillRect(x - 3, y - 2, 188, 12); }
  txt(rank + '.', x, y, hl ? C.yellow : C.white, 1);
  box(g, x + 14, y, 6, 7, k.c1, '#000'); box(g, x + 20, y, 6, 7, k.c2, '#000');
  txt(ci === Game.club ? 'DU' : k.ab, x + 31, y, hl ? C.yellow : C.white, 1);
  txt(v != null ? ev.f(v) : (tx || 'NM'), x + 125, y, v != null ? (hl ? C.yellow : C.white) : C.red, 1, 'r');
  txt('+' + pts, x + 182, y, C.orange, 1, 'r');
}
class ResultScene {
  constructor(i, vals, txtA, pts, order) { Object.assign(this, { i, vals, txtA, pts, order }); this.shown = 0; }
  ctl() { return { pad: 'none', a: this.i < 4 ? 'NESTE' : 'PREMIE', b: '' }; }
  enter() {
    const me = this.order.indexOf(Game.club);
    if (me === 0) { Snd.cheer(2.2); Snd.good(); } else if (me <= 2) { Snd.cheer(1.4, .15); } else Snd.groan();
  }
  update() {
    if (this.t > .6 && Input.hit.a) {
      Snd.ok();
      if (this.i < 4) { Game.evIdx = this.i + 1; Scenes.go(new IntroScene(this.i + 1, false)); } else Scenes.go(new PodiumScene());
    }
  }
  draw() {
    const ev = EVENTS[this.i];
    drawBackdrop(this.t * 6, this.t, { still: true });
    g.fillStyle = 'rgba(8,12,28,.55)'; g.fillRect(0, 0, W, H);
    txt('RESULTAT ' + ev.name, 200, 8, C.yellow, 2, 'c', C.dred);
    panel(8, 30, 192, 120, .85); panel(204, 30, 188, 120, .85);
    txt('ØVELSEN', 104, 34, C.grey, 1, 'c'); txt('SAMMENLAGT', 298, 34, C.grey, 1, 'c');
    this.order.forEach((ci, r) => resultRow(ev, ci, 48 + r * 17, 14, this.vals[ci], this.txtA[ci], this.pts[ci], r + 1, ci === Game.club));
    const tot = [0, 1, 2, 3, 4].sort((a, b) => Game.totals[b] - Game.totals[a]);
    tot.forEach((ci, r) => {
      const y = 48 + r * 17, x = 206, k = CLUBS[ci], hl = ci === Game.club;
      if (hl) { g.fillStyle = 'rgba(255,210,63,.22)'; g.fillRect(x - 3, y - 2, 184, 12); }
      txt((r + 1) + '.', x, y, hl ? C.yellow : C.white, 1);
      box(g, x + 14, y, 6, 7, k.c1, '#000'); box(g, x + 20, y, 6, 7, k.c2, '#000');
      txt(hl ? 'DU' : k.ab, x + 31, y, hl ? C.yellow : C.white, 1);
      txt(CLUBS[ci].name.length > 14 ? '' : '', x + 60, y, C.grey, 1);
      txt(String(Game.totals[ci]), x + 176, y, hl ? C.yellow : C.white, 1, 'r');
    });
    const me = this.order.indexOf(Game.club) + 1;
    txt(me === 1 ? 'DU VANT ØVELSEN!' : 'DU BLE NR ' + me + ' I ØVELSEN', 200, 160, me === 1 ? C.yellow : C.white, 2, 'c');
    txt('+' + this.pts[Game.club] + ' POENG', 200, 180, C.orange, 1, 'c');
    if (this.t > .6 && Math.floor(this.t * 2) % 2 === 0) txt(this.i < 4 ? (isTouch() ? 'NESTE ØVELSE' : 'A = NESTE ØVELSE') : (isTouch() ? 'PREMIEUTDELING' : 'A = PREMIEUTDELING'), 200, 204, C.white, 1, 'c');
  }
}
class TrainResultScene {
  constructor(i, vals, txtA, pts, order) { Object.assign(this, { i, vals, txtA, pts, order }); }
  ctl() { return { pad: 'none', a: 'NY RUNDE', b: 'MENY' }; }
  enter() { const me = this.order.indexOf(Game.club); if (me === 0) Snd.cheer(1.6); }
  update() {
    if (this.t > .5 && Input.hit.a) { Snd.ok(); Scenes.go(new IntroScene(this.i, true)); }
    if (this.t > .5 && Input.hit.b) { Snd.back(); Scenes.go(new TrainSelectScene()); }
  }
  draw() {
    const ev = EVENTS[this.i];
    drawBackdrop(this.t * 6, this.t, { still: true });
    g.fillStyle = 'rgba(8,12,28,.55)'; g.fillRect(0, 0, W, H);
    txt('TRENING: ' + ev.name, 200, 10, C.yellow, 2, 'c', C.dred);
    panel(100, 40, 200, 118, .85);
    this.order.forEach((ci, r) => resultRow(ev, ci, 52 + r * 17, 106, this.vals[ci], this.txtA[ci], this.pts[ci], r + 1, ci === Game.club));
    const best = Game.bestHist[ev.id];
    const mine = this.vals[Game.club];
    if (mine != null && (best == null || cmpVal(ev, mine, best) < 0)) { Game.bestHist[ev.id] = mine; txt('NY REKORD I TRENING!', 200, 168, C.yellow, 1, 'c'); }
    else if (best != null) txt('DIN BESTE I TRENING: ' + ev.f(best), 200, 168, C.white, 1, 'c');
    txt(isTouch() ? 'NY RUNDE ELLER MENY' : 'A = PRØV IGJEN    B = ØVELSESMENY', 200, 200, C.white, 1, 'c');
  }
}

/* ---------- Pause ---------- */
function drawPause() {
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H);
  panel(100, 70, 200, 80, .95);
  txt('PAUSE', 200, 80, C.yellow, 3, 'c', C.dred);
  txt(isTouch() ? 'FORTSETT (KNAPP)' : 'A = FORTSETT', 200, 112, C.white, 1, 'c');
  txt(isTouch() ? 'AVSLUTT TIL MENY (KNAPP)' : 'B = AVSLUTT TIL MENY', 200, 126, C.white, 1, 'c');
}

/* ---------- hovedløkke (fast 60 Hz) ---------- */
let lastTs = 0, acc = 0, gtime = 0;
const STEP = 1 / 60;
function frame(ts) {
  g.setTransform(S, 0, 0, S, 0, 0);
  requestAnimationFrame(frame);
  const dtr = Math.min(0.1, (ts - lastTs) / 1000 || STEP); lastTs = ts;
  acc += dtr;
  let steps = 0;
  while (acc >= STEP && steps < 5) {
    acc -= STEP; steps++;
    const sc = Scenes.cur;
    if (!sc) break;
    if (Input.hit.m) Snd.setMuted(!Snd.muted);
    if (Game.paused) {
      if (Input.hit.a || Input.hit.p) { Game.paused = false; Snd.ok(); }
      else if (Input.hit.b) { Game.paused = false; Snd.back(); Game.toTitle(); }
    } else {
      if (Input.hit.p && sc.pausable) Game.pause(true);
      else { sc.t += STEP; sc.update(STEP); }
    }
    if (Scenes.fade > 0) Scenes.fade = Math.max(0, Scenes.fade - STEP * 3.5);
    Input.end();
  }
  if (steps === 5) acc = 0;
  if (Scenes.cur) {
    TUI.sync(Scenes.cur);
    Scenes.cur.draw();
    drawVignette();
    if (Game.paused) drawPause();
    if (Scenes.fade > 0) { g.fillStyle = `rgba(0,0,0,${Scenes.fade})`; g.fillRect(0, 0, W, H); }
  }
}
