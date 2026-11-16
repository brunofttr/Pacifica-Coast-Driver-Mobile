// Pacifica Coast — sentezlenmiş ses: motor, lastik, rüzgâr, yol, korna, sinyal
(function () {
  'use strict';
  const PC = window.PC, U = PC.U;
  const A = (PC.Audio = { ctx: null, vol: 0.7, ok: false, kEng: 1, kTire: 1 });
  A.init = function () {
    if (A.ctx) { A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = (A.ctx = new AC()), master = (A.master = c.createGain()); master.gain.value = A.vol;
    const comp = c.createDynamicsCompressor(); master.connect(comp); comp.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = (type, f, q) => { const s = c.createBufferSource(); s.buffer = nb; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7; const g = c.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(master); s.start(); return { g, fl }; };
    // motor: harmonikler -> alçak geçiren
    const eg = (A.engGain = c.createGain()); eg.gain.value = 0; const lp = (A.engLP = c.createBiquadFilter()); lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 1.2;
    const ws = c.createWaveShaper(), cv = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cv[i] = Math.tanh(x * 2.2); } ws.curve = cv;
    lp.connect(ws); ws.connect(eg); eg.connect(master);
    A.osc = [['sawtooth', 1, 0.5], ['square', 0.5, 0.42], ['sawtooth', 2, 0.16], ['triangle', 1.5, 0.2]].map((o) => { const os = c.createOscillator(); os.type = o[0]; const g = c.createGain(); g.gain.value = o[2]; os.connect(g); g.connect(lp); os.start(); return { os, mul: o[1], g }; });
    A.rasp = noise('bandpass', 240, 1.2); A.squeal = noise('bandpass', 1150, 7); A.scrub = noise('bandpass', 380, 1.5); A.wind = noise('lowpass', 520, 0.5); A.road = noise('lowpass', 150, 0.6);
    A.hornG = c.createGain(); A.hornG.gain.value = 0; A.hornG.connect(master);
    for (const f of [415, 523]) { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f; const lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 2200; o.connect(lp2); lp2.connect(A.hornG); o.start(); }
    A.ok = true;
    A.loadSamples();
  };
  function f0Of(buf) {
    const d = buf.getChannelData(0), sr = buf.sampleRate, N = Math.min(d.length - 1, 12000), lo = Math.floor(sr / 420), hi = Math.min(Math.floor(sr / 18), N >> 1);
    let best = 0; const cs = [];
    for (let lag = lo; lag < hi; lag += 2) { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i < N - hi; i += 3) { const a = d[i], b = d[i + lag]; s += a * b; e1 += a * a; e2 += b * b; } const c = s / (Math.sqrt(e1 * e2) + 1e-9); cs.push([lag, c]); if (c > best) best = c; }
    for (const [lag, c] of cs) if (c > best * 0.92) return sr / lag;
    return 100;
  }
  A.loadSamples = function () {
    if (!PC.Assets || A.loops) return;
    const c = A.ctx, dec = (n) => PC.Assets.get(n).then((ab) => c.decodeAudioData(ab.slice(0)));
    const mk = (buf, out) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; const g = c.createGain(); g.gain.value = 0; s.connect(g); g.connect(out); s.start(); return { s, g }; };
    Promise.all([0, 1, 2, 3, 4, 5].map((i) => dec('audio/loop_' + i + '.wav'))).then((bufs) => {
      const bus = c.createGain(); bus.gain.value = 0.9; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000; bus.connect(lp); lp.connect(A.master); A.smpLP = lp;
      const f = bufs.map(f0Of); let ok = true; for (let i = 1; i < 6; i++) if (f[i] <= f[i - 1]) ok = false;
      const ref = ok ? f.map((x) => (x / f[0]) * 1000) : [1000, 2000, 3100, 4300, 5600, 7000];
      A.loops = bufs.map((b, i) => Object.assign(mk(b, bus), { ref: ref[i] })); A.f0 = f.map((x) => Math.round(x)); A.refOk = ok;
    }).catch((e) => console.warn('ses kaydı yok', e));
    dec('audio/squeal.wav').then((b) => { A.sq = mk(b, A.master); }).catch(() => {});
  };
  A.setVolume = (v) => { A.vol = v; if (A.master) A.master.gain.value = v; };
  A.update = function (v, inside) {
    if (!A.ok) return;
    const c = A.ctx, t = c.currentTime, s = v.spec;
    const f = Math.max(12, (v.rpm / 60) * (s.cyl / 2));
    const load = v.engineOn ? 0.25 + 0.75 * v.throttleOut : 0, rr = v.rpm / s.redline;
    for (const o of A.osc) o.os.frequency.setTargetAtTime(f * o.mul, t, 0.03);
    A.engLP.frequency.setTargetAtTime(300 + rr * 2600 * (0.35 + 0.65 * load), t, 0.05);
    const smp = !!A.loops;
    A.engGain.gain.setTargetAtTime(v.rpm > 100 ? (0.1 + 0.2 * load + 0.08 * rr) * (inside ? 0.75 : 1) * (smp ? 0.22 : 1) * A.kEng : 0, t, 0.05);
    if (smp) {
      const L = A.loops, rn = L[0].ref * (0.8 + 3.7 * (v.rpm / s.redline)), vol = v.rpm > 100 ? (0.3 + 0.5 * load + 0.2 * rr) * (inside ? 0.7 : 1) * A.kEng : 0;
      let k = 0; while (k < 4 && rn > L[k + 1].ref) k++;
      const tt = U.clamp((rn - L[k].ref) / (L[k + 1].ref - L[k].ref), 0, 1);
      for (let i = 0; i < 6; i++) { const w = i === k ? Math.cos((tt * Math.PI) / 2) : i === k + 1 ? Math.sin((tt * Math.PI) / 2) : 0; L[i].g.gain.setTargetAtTime(w * vol, t, 0.04); L[i].s.playbackRate.setTargetAtTime(U.clamp(rn / L[i].ref, 0.4, 3), t, 0.03); }
      A.smpLP.frequency.setTargetAtTime(1400 + 5200 * (0.3 + 0.7 * load) * (0.4 + 0.6 * rr), t, 0.06);
    }
    A.rasp.fl.frequency.setTargetAtTime(160 + rr * 700, t, 0.05); A.rasp.g.gain.setTargetAtTime(v.engineOn ? load * rr * 0.22 : 0, t, 0.05);
    const sl = Math.max(v.slipF, v.slipR), asph = v.surf === 0 || v.surf === 4;
    A.squeal.g.gain.setTargetAtTime(asph && !A.sq ? sl * 0.2 * A.kTire : 0, t, 0.06);
    if (A.sq) { A.sq.g.gain.setTargetAtTime(asph ? Math.pow(sl, 1.4) * 0.55 * A.kTire : 0, t, 0.07); A.sq.s.playbackRate.setTargetAtTime(0.85 + Math.min(0.5, v.speed * 0.008), t, 0.1); } A.squeal.fl.frequency.setTargetAtTime(950 + v.speed * 9, t, 0.1);
    A.scrub.g.gain.setTargetAtTime(asph ? sl * 0.1 : Math.min(0.3, v.speed * 0.02), t, 0.08);
    A.wind.g.gain.setTargetAtTime(Math.min(0.42, v.speed * v.speed * 0.00022) * (inside ? 0.7 : 1), t, 0.2);
    A.road.g.gain.setTargetAtTime(Math.min(0.5, v.speed * 0.012) * A.kTire, t, 0.2);
  };
  A.horn = (on) => { if (A.ok) A.hornG.gain.setTargetAtTime(on ? 0.2 : 0, A.ctx.currentTime, 0.015); };
  A.trafficHorn = function (dist, pan) {
    if (!A.ok) return; const c = A.ctx, t = c.currentTime, g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null;
    const vol = U.clamp(0.28 * (1 - dist / 90), 0.02, 0.28), dur = 0.35 + Math.random() * 0.5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.setValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.05);
    const base = 380 + Math.random() * 90;
    for (const f of [base, base * 1.26]) { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; o.connect(lp); lp.connect(g); o.start(t); o.stop(t + dur + 0.1); }
    if (p) { p.pan.value = U.clamp(pan, -1, 1); g.connect(p); p.connect(A.master); } else g.connect(A.master);
  };
  A.tick = function (hi) {
    if (!A.ok) return; const c = A.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = hi ? 1900 : 1500; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.04);
  };
  A.thud = function (power) {
    if (!A.ok) return; const c = A.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.18); g.gain.setValueAtTime(U.clamp(power * 0.05, 0.05, 0.5), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.3);
  };
})();
