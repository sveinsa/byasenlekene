/* =====================================================================
   DEL 4c: PREMIEUTDELING – seierspall, fanfare, fotograf, morsom premie
   ===================================================================== */
/* ---------- premier: alt fra ei bøtte sild til gavekort på reise til Stjørdal (barnevennlig humor) ---------- */
const PRIZES = [
  'Ei bøtte sild', 'Et gavekort på reise til Stjørdal', 'Ei lefse stor som en bordtennisplate', 'Ei pølse i lompe med alt på',
  'Et års forsyning av brunost (tynne skiver)', 'En vaffel med ekstra mye syltetøy, levert av treneren', 'Ei skål rømmegrøt med smørøye',
  'Tolv fiskekaker på rad', 'En hel kasse med epler fra Byåsen', 'Ei pakke gummibjørner som må deles med hele laget',
  'En gullmedalje i sjokolade (spises før den smelter)', 'Ei kanelbolle stor som en lastebildekk', 'Fem liter blåbærsaft',
  'En gigantisk ostehøvel', 'Ei bøtte lunken havregrøt', 'Ti kilo poteter, rett fra jorda', 'En pose lompe i gull',
  'En sparkesykkel med bare ett hjul', 'Et par shorts med ekstra mange lommer', 'Et par ullsokker med hull på tærne',
  'En gul gummiand med eget startnummer', 'En stoppeklokke som går baklengs', 'En hekk i miniformat til lillebror',
  'En drikkeflaske som lager lyd som en traktor', 'Et kosteskaft å ri på (hest ikke inkludert)', 'En sprettball med eget pass',
  'Et diplom som verdens raskeste på å knyte skoene', 'Et diplom i å løpe baklengs', 'En medalje av pepperkaker',
  'En trofékopp av papp, med lokk', 'En pingvindrakt (ikke egnet i Dalgård-sola)', 'En hatt med propell på',
  'Et klistremerke av en sild', 'En lommelykt som bare lyser på mandager', 'Et diplom som er to meter bredt',
  'En personlig fanfare, spilt på kam av treneren', 'En paraply som bare virker når sola skinner', 'Et års abonnement på regn i Trondheim',
  'Retten til å velge fredagsfilm hjemme i en hel måned', 'En hel dag uten lekser (gjelder bare dager uten lekser)',
  'Ti minutter ekstra skjermtid, brukes med måte', 'Et gavekort på skyss hjem i trillebår', 'Retten til å bli kalt «Sir» resten av dagen',
  'Retten til å dele ut high five til alle på banen', 'Retten til å stå først i matkøen på neste stevne',
  'Retten til å velge oppvarmingsdansen på neste trening', 'En hel dag som trener (du får peke og rope)',
  'Et gavekort på en tur til Munkholmen, bading er valgfritt', 'En tur opp Tyholttårnet for å vinke til alle',
  'Et gavekort på en tur i Bymarka uten å møte en eneste elg', 'Et bilde av deg selv i gullramme av gjenbrukspapp',
  'Nøkkelen til gullskapet (det er egentlig bare et skap)', 'En fyldig kakeoppskrift (kaken må du bake selv)', 'En pose med en tilfeldig sokk',
  'Verdens beste high five, levert av treneren', 'Tre dager som sjef hjemme (mamma og pappa bestemmer ellers)', 'Ei bøtte med litt for mange ispinner',
  'En stor ballong som sjelden sprekker', 'En tegneserie om en elg som løper 800 m', 'Et bilde av en snømann i juli',
  'En hund av papir som ligner veldig på en kanin', 'En ekte (litt brukt) målsnor', 'Gratis parkering for sparkesykkelen din i en uke',
  'Ei lykkemynt fra bunnen av Nidelva (nyvasket)', 'Et sett vannballonger til neste varme dag', 'Et par solbriller for gule sommerdager',
  'Ei lue med øyne, for dugnad i regnvær', 'En trillebår full av konfetti (du må feie)', 'En stor pose med peanøttfri sjokolade',
  'En kjempestor boks med knekkebrød', 'Et gavekort på bursdagskake med mye krem', 'En hel kasse med kosedyr som vil bli adoptert',
  'En t-skjorte med trykket «Jeg vant, og det var gøy»', 'Et skilt der det står «Her bor Byåsenlekenes beste»', 'Ei bok med fine vitser (og noen dårlige)',
  'Retten til å lede ordentlig høy applaus i 30 sekunder', 'En skive med brunost og en hel høyde av jordbærsyltetøy', 'Et gavekort på ei pølse med ketchup',
  'En racerbil av papp med eget førerkort', 'Ei bøtte makrell i tomat (til hele familien)', 'Retten til å velge middag en hel uke',
  'Et gavekort på ti runder på sparkesykkelen rundt Dalgård', 'En kosebamse som kan telle til tre', 'En snurretopp som snurrer litt for lenge',
  'Ei bøtte seigmenn (kun én farge)', 'En gigantisk fjær fra en ekte (tenkt) fugl', 'Et års forsyning av reflekser til sekken',
  'Et gavekort på tjue minutter i trampolinepark', 'Et gavekort på ei stor skål med smoothie', 'En myk pute i form av en pølse',
  'En sprø overraskelse fra kiosken (ingen vet hva det er)', 'En pose popcorn som du ikke trenger å dele (men bør)', 'Et gavekort på en skål med is',
  'En stjerne som lyser i mørket, til taket på rommet', 'Et pass som gjelder til alle badebassenger i stua', 'En hel bøtte med glitter (beklager til foreldrene)'
];
const PRIZE_NOUNS = [['en', 'startblokk'], ['en', 'stoppeklokke'], ['en', 'hekk'], ['en', 'målsnor'], ['en', 'drikkeflaske'], ['en', 'sparkesykkel'], ['en', 'gummiand'], ['en', 'snømann'],
  ['en', 'ryggsekk'], ['en', 'lue'], ['en', 'pølse'], ['en', 'ostehøvel'], ['en', 'lefse'], ['en', 'fiskekake'], ['et', 'kosedyr'], ['et', 'diplom'], ['et', 'klistremerke'], ['et', 'skilt'], ['et', 'trofé'], ['et', 'flagg'], ['et', 'pepperkakehus'], ['et', 'blåbærsyltetøyglass']];
const PRIZE_ADJ = ['gigantisk', 'signert', 'pent brukt', 'gullbelagt', 'nyvasket', 'ekte', 'litt for stor', 'helt vanlig', 'hjemmelaget', 'innpakket', 'ganske verdifull', 'litt for liten', 'upåklagelig'];
const PRIZE_PLACE = ['Byåsen', 'Dalgård', 'Bakklandet', 'Munkholmen', 'Stjørdal', 'Lade', 'Tyholt', 'Ila', 'Heimdal', 'Tiller', 'Klæbu', 'Bymarka', 'bestemor', 'Nidelva', 'Solsiden'];
const PRIZE_TRIP = ['Stjørdal', 'Hell', 'Malvik', 'Støren', 'Melhus', 'Orkanger', 'Levanger', 'Steinkjer', 'Rissa', 'Klæbu', 'Frosta', 'Ørland', 'Selbu', 'Munkholmen', 'Bymarka'];
const PRIZE_TRIPX = ['', '', ' (enveis)', ' (med niste)', ' (dagstur)', ' (ta med genser)', ' (billett kjøpes på bussen)', ' (stopp på Hell for kaffe)', ' (nesten helt gratis)'];
const PRIZE_BUCKET = ['sild', 'makrell', 'blåbær', 'poteter', 'brunost', 'havregrøt', 'seigmenn', 'ispinner', 'fiskeboller', 'multer', 'lompe', 'epler', 'pepperkaker', 'konfetti', 'rømme'];
const PRIZE_USE = ['vaffelrøre', 'sportsdrikk med bringebærsmak', 'skolebrød fra dugnadskiosken', 'kakao på termos', 'pølser med lompe', 'varm vaffel', 'saft', 'rosiner'];
const PRIZE_RIGHT = ['bære flagget ved neste dugnad', 'velge musikk i høyttaleren en hel runde', 'rake lengdegropa alene', 'rope «PÅ PLASS» neste søndag', 'sette ut kjeglene i hele sesongen',
  'sitte på dommerbordet og vifte med flagget', 'bestemme hvilken hekk som skal hete Per', 'få første vaffel på neste dugnad', 'velge pause-øvelse på neste trening', 'dele ut medaljene på neste stevne'];
let lastPrize = '';
function makePrize() {
  const gens = [
    () => 'Et gavekort på reise til ' + pick(PRIZE_TRIP) + pick(PRIZE_TRIPX),
    () => 'Ei bøtte ' + pick(PRIZE_BUCKET),
    () => 'Ett års forbruk av ' + pick(PRIZE_USE),
    () => 'Retten til å ' + pick(PRIZE_RIGHT),
    () => { const n = pick(PRIZE_NOUNS); return cap(n[0] + ' ' + pick(PRIZE_ADJ) + ' ' + n[1] + (Math.random() < .55 ? ' fra ' + pick(PRIZE_PLACE) : '')); }
  ];
  let r = '', n = 0;
  do { r = Math.random() < .6 ? pick(PRIZES) : pick(gens)(); } while ((r === lastPrize || r.length > 100) && ++n < 20);
  lastPrize = r; return r;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
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
    this.order = Game.field.slice().sort((a, b) => Game.totals[b] - Game.totals[a] || (a === Game.club ? -1 : 0));
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
    /* fotograf med pressevest */
    const px = 82, shoot = this.flash > 0;
    const fcol = { c1: '#f2b21c', c2: '#2b2f3e', skin: C.skin1, skinD: shade(C.skin1, .8), hair: '#5a3a1e', shoe: '#222' };
    const kneel = Math.floor(T / 3.2) % 2 === 1;
    const pf = poseCamera(T); if (kneel) { pf.h = .52; pf.tl = 80; pf.sl = -5; pf.tr = 20; pf.sr = -90; pf.to = 10; }
    groundShadow(px, PY + .5, 13, 2.4, .38);
    drawFigure(g, px, PY, 30, pf, fcol, 1, shoot ? .0 : Math.sin(T * 3) * .01);
    const camX = px + 17, camY = PY - (kneel ? 30 : 47);
    g.fillStyle = '#15171f'; rrect(g, camX, camY, 9, 6, 1); g.fill(); g.fillStyle = '#4a4f66'; rrect(g, camX + 1, camY - 1.4, 4, 1.8, .6); g.fill(); ball(g, camX + 9, camY + 3, 2.2, '#8ea2ff', .6);
    /* banner med arrangementsnavn */
    g.fillStyle = '#d9d9d9'; g.fillRect(14, PY - 6, 2, 8); g.fillRect(52, PY - 6, 2, 8);
    rrect(g, 5, PY - 23, 58, 18, 2.5); g.fillStyle = '#fff'; g.fill(); rrect(g, 6.2, PY - 21.8, 55.6, 15.6, 1.8); g.fillStyle = lgrad(g, PY - 22, PY - 6, [[0, '#1c2a63'], [1, '#0c1535']]); g.fill();
    g.fillStyle = BC.red; g.fillRect(7, PY - 21, 54, 2);
    txt('DALGÅRD', 34, PY - 15, C.white, 1, 'c', null);
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
      txt('PREMIE TIL VINNEREN', 200, y0 + 4, C.orange, 1, 'c');
      this.prizeLines.forEach((l, i) => txt(l, 200, y0 + 16 + i * 10, C.white, 1, 'c'));
    }
    const mine = this.order.indexOf(Game.club) + 1;
    if (this.t > 3 && Math.floor(this.t * 2) % 2 === 0) txt((isTouch() ? 'TRYKK TIL MENY' : 'A = TILBAKE TIL MENY') + (mine > 3 ? '   (DU BLE NR ' + mine + ')' : ''), 200, 211, C.white, 1, 'c');
  }
}
