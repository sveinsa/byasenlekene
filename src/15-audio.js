/* =====================================================================
   DEL 1b: LYD – Web Audio med romklang, kompressor, publikum, bjelle og 8-bit-musikk
   (alt syntetiseres i koden – ingen lydfiler)
   ===================================================================== */
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const Snd = {
  ctx: null, master: null, bus: null, musBus: null, nbuf: null, pbuf: null, muted: false, vol: .85,
  init() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const c = this.ctx = new AC();
        this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : this.vol;
        const comp = c.createDynamicsCompressor();
        comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = .003; comp.release.value = .2;
        this.master.connect(comp); comp.connect(c.destination);
        /* effekt-buss: tørr lyd + stadion-romklang */
        this.bus = c.createGain(); this.bus.connect(this.master);
        const rev = c.createConvolver(); rev.buffer = this.impulse(c, 2.4, 2.4);
        const send = c.createGain(); send.gain.value = .26;
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4800;
        this.bus.connect(send); send.connect(lp); lp.connect(rev); rev.connect(this.master);
        /* musikk-buss med lett ekko */
        this.musBus = c.createGain(); this.musBus.gain.value = .55; this.musBus.connect(this.master);
        const dl = c.createDelay(1); dl.delayTime.value = .234;
        const fb = c.createGain(); fb.gain.value = .28; const dg = c.createGain(); dg.gain.value = .2;
        this.musBus.connect(dg); dg.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(this.master);
        /* støybuffere (hvit + rosa), 4 s */
        const n = Math.floor(c.sampleRate * 4);
        this.nbuf = c.createBuffer(1, n, c.sampleRate); this.pbuf = c.createBuffer(1, n, c.sampleRate);
        const d = this.nbuf.getChannelData(0), p = this.pbuf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1; d[i] = w;
          b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
          b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
          p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
        }
        Voice.init(); Amb.start();
        if (Music.pending) { const s = Music.pending; Music.pending = null; Music.play(s); }
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  impulse(c, dur, dec) {
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, dec); }
    return b;
  },
  setMuted(m) {
    this.muted = m; store.set('muted', m);
    if (this.master) this.master.gain.value = m ? 0 : this.vol;
    if (m) { try { speechSynthesis.cancel(); } catch (e) { } }
    document.getElementById('bMute').innerHTML = m ? '&#128263;' : '&#128266;';
  },
  /* én tonestemme: type, volum, glid (to), lavpass (lp/lpTo), pan, sustain (sus) */
  tone(f, d, o = {}) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const os = c.createOscillator(), gn = c.createGain();
    os.type = o.type || 'square';
    os.frequency.setValueAtTime(f, t);
    if (o.to) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + d);
    if (o.det) os.detune.value = o.det;
    const v = o.vol == null ? .18 : o.vol, a = o.att == null ? .006 : o.att;
    gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(v, t + a);
    if (o.sus == null) gn.gain.exponentialRampToValueAtTime(.0001, t + Math.max(d, a + .01));
    else {
      const rel = o.rel || .05, t1 = t + Math.min(a + .12, d * .5), t2 = Math.max(t1, t + d - rel);
      gn.gain.linearRampToValueAtTime(Math.max(.0002, v * o.sus), t1); gn.gain.setValueAtTime(Math.max(.0002, v * o.sus), t2); gn.gain.linearRampToValueAtTime(.0001, t + d);
    }
    if (o.lp) {
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = o.q || .8; fl.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + (o.lpT || d));
      os.connect(fl); fl.connect(gn);
    } else os.connect(gn);
    let out = gn;
    if (o.pan && c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.value = o.pan; gn.connect(pn); out = pn; }
    out.connect(o.dest || this.bus);
    os.start(t); os.stop(t + d + .05);
  },
  noise(d, o = {}) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const s = c.createBufferSource(); s.buffer = o.pink ? this.pbuf : this.nbuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = o.type || 'lowpass';
    f.frequency.setValueAtTime(o.f || 3000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t + d);
    f.Q.value = o.q || .7;
    const gn = c.createGain(), v = o.vol == null ? .2 : o.vol, a = o.att || .004;
    gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(v, t + a); gn.gain.exponentialRampToValueAtTime(.0001, t + Math.max(d, a + .01));
    s.connect(f); f.connect(gn);
    let out = gn;
    if (o.pan && c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.value = o.pan; gn.connect(pn); out = pn; }
    out.connect(o.dest || this.bus);
    s.start(t, Math.random() * 3); s.stop(t + d + .05);
  },
  /* ---------- effekter ---------- */
  step(v) { v = v || .5; const j = rnd(.85, 1.2); this.noise(.045, { f: 2400 * j, type: 'bandpass', q: .9, vol: .05 + .06 * v, att: .002, pan: rnd(-.25, .25) }); this.tone(125 * j, .06, { type: 'sine', to: 70, vol: .05 + .04 * v, att: .002 }); },
  select() { this.tone(880, .07, { type: 'triangle', vol: .11 }); },
  ok() { this.tone(660, .09, { type: 'triangle', vol: .13 }); this.tone(990, .16, { type: 'triangle', vol: .13, delay: .07 }); },
  back() { this.tone(520, .12, { type: 'triangle', vol: .12, to: 330 }); },
  beep(f = 880, d = .12) { this.tone(f, d, { type: 'triangle', vol: .15 }); },
  jump() { this.noise(.2, { f: 500, to: 1800, type: 'bandpass', q: 1.2, vol: .13, att: .05 }); this.tone(240, .16, { type: 'sine', to: 520, vol: .09 }); },
  whoosh() { this.noise(.45, { f: 300, to: 3200, type: 'bandpass', q: .8, vol: .22, att: .15 }); },
  thud() { this.noise(.25, { f: 700, to: 90, vol: .5 }); this.tone(95, .22, { type: 'sine', to: 38, vol: .6, att: .002 }); },
  sand() { this.noise(.32, { f: 2200, to: 260, vol: .34, pink: true }); this.tone(80, .15, { type: 'sine', to: 45, vol: .3 }); },
  hit() { /* hekk i bakken: metallisk skramling */
    for (let i = 0; i < 5; i++) this.noise(.06, { f: 2600 + rnd(0, 2600), type: 'bandpass', q: 5, vol: .2, delay: i * .037, att: .002, pan: rnd(-.3, .3) });
    this.tone(1100, .3, { type: 'triangle', to: 780, vol: .1 }); this.tone(190, .14, { type: 'sine', to: 70, vol: .35 });
  },
  bar() { /* lista rasler */
    this.tone(1320, .6, { type: 'sine', vol: .12 }); this.tone(1980, .4, { type: 'sine', vol: .06 });
    for (let i = 0; i < 4; i++) this.noise(.05, { f: 3500, type: 'bandpass', q: 6, vol: .18, delay: i * .06 });
  },
  gun() { /* startpistol: skarpt smell + kropp + ekko fra stadion */
    this.noise(.07, { f: 1500, type: 'highpass', vol: .95, att: .001 });
    this.noise(.4, { f: 4500, to: 500, vol: .55, att: .001 });
    this.tone(180, .24, { type: 'sine', to: 48, vol: .75, att: .001 });
    this.noise(.06, { f: 1400, type: 'highpass', vol: .26, delay: .2 }); this.noise(.3, { f: 2600, to: 400, vol: .14, delay: .2 });
    this.noise(.06, { f: 1200, type: 'highpass', vol: .11, delay: .44 });
  },
  foul() { /* sur dommersummer */
    this.tone(155, .32, { type: 'sawtooth', vol: .2, lp: 900, att: .01, sus: .9 });
    this.tone(155 * 1.5, .32, { type: 'sawtooth', vol: .1, lp: 900, att: .01, sus: .9, delay: .0 });
    this.tone(130, .4, { type: 'sawtooth', vol: .2, lp: 800, att: .01, sus: .9, delay: .3 });
  },
  good() { [523, 659, 784, 1047].forEach((f, i) => { this.tone(f, .5, { type: 'sine', vol: .12, delay: i * .07 }); this.tone(f * 2, .3, { type: 'sine', vol: .04, delay: i * .07 }); }); },
  perfect() { [784, 988, 1319].forEach((f, i) => { this.tone(f, .35, { type: 'sine', vol: .12, delay: i * .05 }); this.tone(f * 2, .2, { type: 'triangle', vol: .04, delay: i * .05 }); }); },
  tick(k = 1) { this.tone(k > .7 ? 2300 : 1500, .03, { type: 'triangle', vol: .05 + .05 * k }); },
  click() { /* kameralukker */
    this.noise(.03, { f: 3200, type: 'highpass', vol: .3, att: .001 }); this.tone(2200, .03, { type: 'square', vol: .05 });
    this.noise(.05, { f: 1800, type: 'highpass', vol: .25, delay: .07, att: .001 }); this.tone(1400, .04, { type: 'square', vol: .04, delay: .07 });
  },
  /* bjelle: uharmoniske overtoner med lange etterklang – ringes flere ganger (siste runde) */
  bell(n = 1, gap = .3) { for (let k = 0; k < n; k++) this.bellHit(k * gap + (k ? rnd(-.03, .03) : 0), k ? rnd(.75, 1) : 1); },
  bellHit(delay, vel) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime + delay, f0 = 640;
    [[.5, .5, 2.4], [1, 1, 2.0], [1.19, .6, 1.5], [1.5, .25, 1.1], [2, .7, 1.3], [2.76, .5, 1.0], [4.07, .35, .65], [5.43, .25, .45], [6.8, .14, .3]].forEach(([r, gv, dc]) => {
      const os = c.createOscillator(), gn = c.createGain();
      os.type = 'sine'; os.frequency.value = f0 * r * (1 + rnd(-.002, .002));
      gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(.2 * gv * vel, t + .002); gn.gain.exponentialRampToValueAtTime(.0001, t + dc);
      os.connect(gn); gn.connect(this.bus); os.start(t); os.stop(t + dc + .05);
    });
    this.noise(.03, { f: 5000, type: 'highpass', vol: .22 * vel, delay, att: .001 });
  },
  /* publikum: tre formantbånd med flagrende volum */
  cheer(d = 1.6, vol = .22) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime;
    [[650, .8], [1350, 1], [2600, .5]].forEach(([fq, gv]) => {
      const s = c.createBufferSource(); s.buffer = this.pbuf; s.loop = true;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = .9;
      const gn = c.createGain(), v = vol * gv * 2.4;
      gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(v, t + .3);
      for (let u = .35; u < d - .3; u += .1) gn.gain.linearRampToValueAtTime(v * rnd(.55, 1), t + u);
      gn.gain.linearRampToValueAtTime(.0001, t + d);
      s.connect(f); f.connect(gn); gn.connect(this.bus); s.start(t, Math.random() * 3); s.stop(t + d + .05);
    });
    Amb.swell(vol * .2, d);
  },
  applause(d = 3, vol = .2) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.nbuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .5;
    const gn = c.createGain();
    gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(vol, t + .3);
    for (let u = .3; u < d - .4; u += .028) gn.gain.setValueAtTime(vol * rnd(.15, 1) * (.6 + .4 * Math.sin(u * 2.3)), t + u);
    gn.gain.linearRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(gn); gn.connect(this.bus); s.start(t, Math.random() * 3); s.stop(t + d + .05);
  },
  groan() { this.tone(240, .6, { type: 'sawtooth', to: 110, vol: .12, lp: 700, sus: .8, att: .04 }); this.noise(.5, { f: 600, to: 250, type: 'bandpass', q: .8, vol: .1, pink: true }); }
};

/* publikumsmumling (lav bakgrunnsstøy som svulmer opp ved jubel) */
const Amb = {
  g: null, lvl: .03,
  start() {
    if (this.g || !Snd.ctx) return;
    const c = Snd.ctx, s = c.createBufferSource(); s.buffer = Snd.pbuf; s.loop = true;
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 520; f1.Q.value = .5;
    const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 1800;
    this.g = c.createGain(); this.g.gain.value = 0;
    s.connect(f1); f1.connect(f2); f2.connect(this.g); this.g.connect(Snd.master); s.start();
    const lfo = c.createOscillator(); lfo.frequency.value = .13; const ld = c.createGain(); ld.gain.value = 120; lfo.connect(ld); ld.connect(f1.frequency); lfo.start();
    this.set(this.lvl);
  },
  set(l, tc = .8) { this.lvl = l; if (this.g) this.g.gain.setTargetAtTime(l * 1.8, Snd.ctx.currentTime, tc); },
  swell(add, dur) {
    if (!this.g) return;
    const t = Snd.ctx.currentTime, base = this.lvl * 1.8;
    this.g.gain.cancelScheduledValues(t); this.g.gain.setValueAtTime(this.g.gain.value, t);
    this.g.gain.linearRampToValueAtTime(base + add, t + .4); this.g.gain.linearRampToValueAtTime(base, t + Math.max(dur, 1) + .8);
  }
};

/* ---------- musikk: liten flerkanals sekvenser (lead, arpeggio, bass, trommer, messing) ---------- */
const INST = {
  lead: (d, m, L, v, dst) => {
    const f = mtof(m);
    Snd.tone(f, L, { type: 'square', vol: .05 * v, det: -7, delay: d, dest: dst, lp: 5200, att: .008, sus: .75, rel: .05 });
    Snd.tone(f, L, { type: 'sawtooth', vol: .028 * v, det: 6, delay: d, dest: dst, lp: 3800, att: .008, sus: .7, rel: .05 });
  },
  arp: (d, m, L, v, dst) => Snd.tone(mtof(m), .2, { type: 'triangle', vol: .075 * v, delay: d, dest: dst, att: .004, pan: .25 }),
  bass: (d, m, L, v, dst) => {
    Snd.tone(mtof(m), L, { type: 'triangle', vol: .22 * v, delay: d, dest: dst, lp: 700, att: .008, sus: .8, rel: .04 });
    Snd.tone(mtof(m), L, { type: 'sine', vol: .12 * v, delay: d, dest: dst, att: .008, sus: .8, rel: .04 });
  },
  brass: (d, m, L, v, dst) => {
    const f = mtof(m);
    Snd.tone(f, L, { type: 'sawtooth', vol: .045 * v, det: -6, delay: d, dest: dst, lp: 700, lpTo: 3200, lpT: .09, att: .02, sus: .85, rel: .06 });
    Snd.tone(f, L, { type: 'sawtooth', vol: .045 * v, det: 6, delay: d, dest: dst, lp: 700, lpTo: 3200, lpT: .09, att: .02, sus: .85, rel: .06 });
  },
  kick: (d, _, L, v, dst) => { Snd.tone(150, .17, { type: 'sine', to: 42, vol: .55 * v, delay: d, dest: dst, att: .001 }); Snd.noise(.02, { f: 3000, type: 'highpass', vol: .06 * v, delay: d, dest: dst, att: .001 }); },
  snare: (d, _, L, v, dst) => { Snd.noise(.15, { f: 2300, type: 'bandpass', q: .7, vol: .22 * v, delay: d, dest: dst, att: .001 }); Snd.tone(210, .1, { type: 'triangle', to: 150, vol: .14 * v, delay: d, dest: dst, att: .001 }); },
  hat: (d, _, L, v, dst) => Snd.noise(.04, { f: 8000, type: 'highpass', vol: .07 * v, delay: d, dest: dst, att: .001 }),
  ohat: (d, _, L, v, dst) => Snd.noise(.14, { f: 7500, type: 'highpass', vol: .07 * v, delay: d, dest: dst, att: .001 }),
  crash: (d, _, L, v, dst) => Snd.noise(1.2, { f: 6000, type: 'highpass', vol: .11 * v, delay: d, dest: dst, att: .002 })
};
const CH = { C: [48, 52, 55], G: [43, 47, 50], Am: [45, 48, 52], F: [41, 45, 48] };
const SONGS = {
  title: {
    bpm: 126, bars: 8,
    build(add) {
      const prog = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'];
      prog.forEach((nm, b) => {
        const s0 = b * 16, ch = CH[nm], r = ch[0];
        [[0, r, 3], [3, r, 3], [6, r + 7, 2], [8, r, 3], [11, r, 3], [14, r + 7, 2]].forEach(([st, n, l]) => add('bass', s0 + st, n - 12 + 12, l));
        for (let i = 0; i < 16; i++) add('arp', s0 + i, ch[[0, 1, 2, 1][i % 4]] + 12, 1, i % 2 ? .6 : 1);
        add('kick', s0, 0); add('kick', s0 + 8, 0); if (b % 2) add('kick', s0 + 6, 0, 1, .7);
        add('snare', s0 + 4, 0); add('snare', s0 + 12, 0);
        for (let i = 0; i < 16; i += 2) add('hat', s0 + i, 0, 1, i % 4 ? .6 : 1);
        add('ohat', s0 + 14, 0);
      });
      [[0, 76, 4], [4, 79, 4], [8, 84, 4], [12, 79, 2], [14, 76, 2], [16, 74, 4], [20, 79, 4], [24, 83, 4], [28, 79, 2], [30, 74, 2],
      [32, 76, 2], [34, 81, 2], [36, 84, 4], [40, 81, 2], [42, 76, 2], [44, 81, 4], [48, 77, 2], [50, 81, 2], [52, 84, 4], [56, 81, 4], [60, 77, 4],
      [64, 79, 2], [66, 79, 2], [68, 88, 4], [72, 86, 2], [74, 84, 2], [76, 83, 2], [78, 84, 2], [80, 83, 4], [84, 86, 4], [88, 91, 4], [92, 86, 4],
      [96, 81, 2], [98, 84, 2], [100, 89, 4], [104, 88, 2], [106, 84, 2], [108, 81, 4], [112, 86, 4], [116, 83, 4], [120, 79, 8]].forEach(([st, n, l]) => add('lead', st, n, l));
      add('crash', 0, 0);
    }
  },
  fanfare: {
    bpm: 124, bars: 8,
    build(add) {
      const prog = [['C', 0], ['C', 0], ['F', 0], ['G', 0], ['C', 0], ['Am', 0], ['G', 0], ['C', 0]];
      prog.forEach(([nm], b) => {
        const s0 = b * 16, ch = CH[nm];
        [0, 6, 8, 14].forEach((st, k) => ch.forEach(n => add('brass', s0 + st, n + 12 + (k === 3 ? 0 : 0), k === 1 ? 2 : 4, .8)));
        [0, 4, 8, 12].forEach(st => add('bass', s0 + st, ch[0] - 0, 3));
        add('kick', s0, 0); add('kick', s0 + 8, 0); add('snare', s0 + 4, 0); add('snare', s0 + 12, 0); add('snare', s0 + 14, 0, 1, .6); add('snare', s0 + 15, 0, 1, .7);
        for (let i = 0; i < 16; i += 2) add('hat', s0 + i, 0, 1, .8);
      });
      [[0, 67, 3], [4, 72, 3], [8, 76, 3], [12, 79, 4], [16, 84, 12], [28, 79, 2], [30, 84, 2],
      [32, 81, 3], [36, 84, 3], [40, 89, 3], [44, 88, 2], [46, 84, 2], [48, 83, 3], [52, 86, 3], [56, 91, 4], [60, 86, 2], [62, 83, 2],
      [64, 84, 3], [68, 79, 3], [72, 76, 3], [76, 79, 2], [78, 84, 2], [80, 81, 3], [84, 84, 3], [88, 81, 2], [90, 77, 2], [92, 81, 4],
      [96, 79, 3], [100, 83, 3], [104, 86, 3], [108, 83, 2], [110, 79, 2], [112, 84, 12], [124, 88, 2], [126, 84, 2]].forEach(([st, n, l]) => { add('brass', st, n - 12, l, 1.15); add('lead', st, n, l, .6); });
      add('crash', 0, 0); add('crash', 64, 0); add('crash', 112, 0);
    }
  }
};
const Music = {
  gain: null, timer: null, cur: null, pending: null,
  play(name) {
    this.stop();
    if (!Snd.ctx) { this.pending = name; return; }
    this.cur = name; this.loop(name);
  },
  loop(name) {
    if (this.cur !== name || !Snd.ctx) return;
    const S = SONGS[name], c = Snd.ctx, sp = 60 / S.bpm / 4, T0 = .06;
    const dst = this.gain = c.createGain(); dst.connect(Snd.musBus);
    S.build((kind, step, a, len = 2, vol = 1) => INST[kind](T0 + step * sp, a, Math.max(.04, len * sp * .92), vol, dst));
    this.timer = setTimeout(() => this.loop(name), (S.bars * 16 * sp + T0) * 1000 - 60);
  },
  stop() {
    this.cur = null; this.pending = null; clearTimeout(this.timer);
    if (this.gain && Snd.ctx) { const g0 = this.gain; try { g0.gain.cancelScheduledValues(0); g0.gain.setValueAtTime(0, Snd.ctx.currentTime); } catch (e) { } this.gain = null; }
  }
};

/* tale: Web Speech (nb-NO) – startkommandoer */
const Voice = {
  v: null,
  init() {
    try {
      const pickV = () => {
        const vs = speechSynthesis.getVoices();
        this.v = vs.find(v => /^nb/i.test(v.lang)) || vs.find(v => /^no/i.test(v.lang)) || vs.find(v => /^nn/i.test(v.lang)) || null;
      };
      pickV(); speechSynthesis.onvoiceschanged = pickV;
    } catch (e) { }
  },
  say(t, rate = .86, pitch = .6) {
    if (Snd.muted) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'nb-NO'; if (this.v) u.voice = this.v;
      u.rate = rate; u.pitch = pitch; u.volume = 1;
      speechSynthesis.speak(u);
    } catch (e) { }
  }
};
