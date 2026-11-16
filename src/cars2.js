// Pacifica Coast — ek prosedürel araçlar (gerçek modellerden esinlenme; marka adı / logo yok) + ortak ışık parlamaları
(function () {
  'use strict';
  const PC = window.PC, T = THREE;
  const small = { cg: 0.6, cgH: 0.55, drive: 'fwd', awdFront: 1, idle: 800, stall: 2000, rev: 3.5, shiftT: 0.24, mu: 0.98, tireB: 9.5, brakeG: 1.02, bias: 0.67, cdA: 0.46, rollF: 0.62, lock: 0.62, rollGain: 0.0085, pitchGain: 0.0046, suspHz: 1.5, cyl: 4, vmaxDial: 220, dash: 'modern' };
  const add = (o) => PC.CarSpecs.push(o);
  // 80'lerin köşeli aile sedanı
  add(Object.assign({}, small, {
    id: 'kartal', name: 'Kartal S', cls: 'Klasik köşeli sedan · RWD · 85 hp', colors: [0xe8e6de, 0x8a1a1a, 0x1d3557, 0x0f0f10, 0xc2b280],
    mass: 960, L: 2.42, cg: 0.55, track: 1.33, cgH: 0.52, R: 0.29, width: 1.62, len: 4.26, drive: 'rwd', awdFront: 0,
    torque: [[900, 95], [2800, 130], [4000, 128], [5600, 105], [6200, 88]], redline: 6200, stall: 1900, powerKw: 62, gears: [3.67, 2.1, 1.36, 1.0, 0.86], rev: 3.2, final: 3.9, shiftT: 0.32,
    mu: 0.88, tireB: 8.5, brakeG: 0.9, bias: 0.62, cdA: 0.5, rollF: 0.6, rollGain: 0.011, pitchGain: 0.006, suspHz: 1.4, tank: 50, vmaxDial: 180, dash: 'rugged', seat: { x: 2.1, y: 0.42 },
    body: {
      rearOH: 0.98, sq: 0.85, rw: 0.62, clear: 0.19,
      top: [[0, 0.86], [0.05, 0.94], [0.95, 0.955], [1.02, 0.975], [1.45, 1.36], [2.5, 1.385], [2.75, 1.345], [3.2, 0.935], [4.2, 0.885], [4.26, 0.8]],
      belt: [[0, 0.84], [0.3, 0.905], [3.2, 0.885], [4.26, 0.78]],
      hw: [[0, 0.77], [0.08, 0.805], [4.15, 0.805], [4.26, 0.77]],
      bot: [[0, 0.4], [0.12, 0.25], [0.5, 0.2], [3.9, 0.2], [4.15, 0.25], [4.26, 0.38]],
      cowl: 3.2, roofF: 2.75, roofR: 1.45, deck: 1.02, gx0: 1.12, gx1: 3.05, pillars: [[2.0, 2.1]],
      grille: { style: 'bar', y: 0.6, w: 0.86, h: 0.15 }, head: { style: 'block', y: 0.62, z: 0.74, w: 0.24, h: 0.13 }, intake: { y: 0.36, w: 1.3, h: 0.1, bumper: true },
      tail: { style: 'vert', y: 0.7, z: 0.76, w: 0.22, h: 0.13 }, exhaust: [0.42], wheel: { style: 'steel', w: 0.175, rimF: 0.62, cal: 0x333333 }, mirrorY: 0.97, handleY: 0.82, doors: [1.2, 2.05, 3.05],
    },
  }));
  // Fransız tarzı yüksek kompakt
  add(Object.assign({}, small, {
    id: 'lumiere', name: 'Lumière C-Quatre', cls: 'Kompakt crossover · FWD · 130 hp', colors: [0x9c1f2e, 0xf0efe9, 0x35454f, 0x101214, 0x2c5f8a],
    mass: 1320, L: 2.67, track: 1.56, R: 0.33, width: 1.8, len: 4.36, torque: [[900, 120], [1750, 230], [3500, 230], [5500, 180], [6200, 150]], redline: 6200, powerKw: 96,
    gears: [3.54, 1.92, 1.28, 0.95, 0.76, 0.62], final: 4.2, tank: 50, seat: { x: 2.3, y: 0.56 },
    body: {
      rearOH: 0.85, sq: 0.4, rw: 0.62, clear: 0.18,
      top: [[0, 0.85], [0.06, 1.05], [0.3, 1.2], [0.72, 1.4], [1.4, 1.51], [2.4, 1.52], [2.85, 1.46], [3.55, 1.02], [4.1, 0.9], [4.3, 0.8], [4.36, 0.66]],
      belt: [[0, 0.83], [0.3, 1.02], [1.2, 1.04], [3.5, 0.98], [4.1, 0.86], [4.36, 0.64]],
      hw: [[0, 0.74], [0.1, 0.86], [0.6, 0.9], [2.5, 0.9], [3.9, 0.89], [4.25, 0.83], [4.36, 0.68]],
      bot: [[0, 0.4], [0.14, 0.24], [0.5, 0.18], [4.1, 0.17], [4.28, 0.21], [4.36, 0.32]],
      cowl: 3.55, roofF: 2.85, roofR: 0.75, deck: 0.3, gx0: 0.66, gx1: 3.35, pillars: [[1.3, 1.42], [2.25, 2.35]], clad: 1, flare: 0.06, patches: [[3.96, 4.36, 6, 8, 'head'], [0, 0.24, 6, 8, 'tail']],
      grille: { style: 'hex', y: 0.6, w: 1.0, h: 0.12 }, head: { style: 'slim', y: 0.8, z: 0.66, sx: 0.18, sy: 0.04, sz: 0.2 }, intake: { y: 0.34, w: 1.3, h: 0.16 },
      tail: { style: 'L', y: 0.95, z: 0.6, w: 0.4, h: 0.07 }, exhaust: [], spoiler: 'roof', wheel: { style: 'multi', w: 0.215, rimF: 0.68, cal: 0x444444 }, mirrorY: 1.1, handleY: 0.96, doors: [1.36, 2.3, 3.36],
    },
  }));
  // Kore tarzı küçük hatchback
  add(Object.assign({}, small, {
    id: 'imini', name: 'Koryo i-Mini', cls: 'Küçük hatchback · FWD · 100 hp', colors: [0x1f6fb2, 0xe9e9e6, 0xb3261e, 0x2b2d31, 0x6d7a80],
    mass: 1080, L: 2.58, track: 1.52, R: 0.31, width: 1.75, len: 4.04, torque: [[900, 95], [1500, 172], [4000, 172], [5500, 140], [6300, 115]], redline: 6300, powerKw: 74,
    gears: [3.62, 1.95, 1.28, 0.97, 0.78, 0.65], final: 4.06, tank: 40, mu: 1.0, seat: { x: 2.2, y: 0.46 },
    body: {
      rearOH: 0.78, sq: 0.3, rw: 0.6, clear: 0.15,
      top: [[0, 0.8], [0.06, 1.0], [0.28, 1.14], [0.64, 1.32], [1.3, 1.44], [2.2, 1.45], [2.62, 1.4], [3.28, 0.98], [3.8, 0.86], [3.98, 0.76], [4.04, 0.64]],
      belt: [[0, 0.78], [0.3, 0.98], [1.1, 1.0], [3.2, 0.94], [3.8, 0.82], [4.04, 0.62]],
      hw: [[0, 0.72], [0.1, 0.83], [0.55, 0.875], [2.3, 0.875], [3.6, 0.865], [3.93, 0.8], [4.04, 0.66]],
      bot: [[0, 0.38], [0.14, 0.22], [0.5, 0.16], [3.8, 0.15], [3.96, 0.19], [4.04, 0.3]],
      cowl: 3.28, roofF: 2.62, roofR: 0.68, deck: 0.28, gx0: 0.6, gx1: 3.1, pillars: [[1.22, 1.32], [2.1, 2.2]], patches: [[3.66, 4.04, 6, 8, 'head'], [0, 0.22, 6, 8, 'tail']],
      grille: { style: 'hex', y: 0.5, w: 1.1, h: 0.2 }, head: { style: 'slim', y: 0.74, z: 0.64, sx: 0.18, sy: 0.04, sz: 0.2 }, intake: { y: 0.3, w: 1.2, h: 0.1 },
      tail: { style: 'L', y: 0.9, z: 0.58, w: 0.38, h: 0.07, bar: true }, exhaust: [0.45], spoiler: 'roof', wheel: { style: 'twin5', w: 0.195, rimF: 0.7, cal: 0x444444 }, mirrorY: 1.04, handleY: 0.9, doors: [1.26, 2.15, 3.12],
    },
  }));
  // modern küçük şehir arabası
  add(Object.assign({}, small, {
    id: 'metro', name: 'Metro e-One', cls: 'Şehir arabası · FWD · 95 hp', colors: [0x3fb3a4, 0xf2f2ef, 0xf2b705, 0x24262b, 0xd85c8a],
    mass: 1040, L: 2.36, track: 1.46, cgH: 0.6, R: 0.3, width: 1.66, len: 3.62, torque: [[800, 150], [1200, 185], [3800, 185], [5500, 140], [6500, 110]], redline: 6500, powerKw: 70,
    gears: [3.4, 1.9, 1.25, 0.94, 0.76], final: 4.1, tank: 35, lock: 0.66, suspHz: 1.55, vmaxDial: 180, seat: { x: 2.0, y: 0.56 },
    body: {
      rearOH: 0.62, sq: 0.5, rw: 0.6, clear: 0.15,
      top: [[0, 0.85], [0.05, 1.1], [0.2, 1.3], [0.5, 1.5], [1.2, 1.55], [2.0, 1.55], [2.4, 1.5], [3.0, 1.02], [3.4, 0.9], [3.56, 0.8], [3.62, 0.66]],
      belt: [[0, 0.83], [0.25, 1.04], [1.0, 1.06], [2.95, 1.0], [3.4, 0.86], [3.62, 0.64]],
      hw: [[0, 0.7], [0.08, 0.8], [0.5, 0.83], [2.2, 0.83], [3.25, 0.82], [3.52, 0.76], [3.62, 0.63]],
      bot: [[0, 0.38], [0.12, 0.22], [0.45, 0.16], [3.4, 0.15], [3.55, 0.19], [3.62, 0.3]],
      cowl: 3.0, roofF: 2.4, roofR: 0.5, deck: 0.2, gx0: 0.45, gx1: 2.85, pillars: [[1.5, 1.6]], sunroof: [0.9, 2.1], patches: [[3.28, 3.62, 6, 8, 'head'], [0, 0.2, 6, 8, 'tail']],
      grille: { style: 'none' }, head: { style: 'slim', y: 0.8, z: 0.6, sx: 0.16, sy: 0.04, sz: 0.18 }, intake: { y: 0.32, w: 1.1, h: 0.14 },
      tail: { style: 'L', y: 0.95, z: 0.55, w: 0.34, h: 0.07, bar: true }, exhaust: [], wheel: { style: 'multi', w: 0.185, rimF: 0.7, cal: 0x3fb3a4 }, mirrorY: 1.1, handleY: 0.96, doors: [1.55, 2.9],
    },
  }));

  // ---- ışık parlamaları: sinyal (dört köşe) + geri vites; modelde ayrı lamba parçası olmayan araçlar için ----
  let _tex = null;
  PC.lightSprites = function (parent, xf, xr, hw, y) {
    if (!_tex) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _tex = new T.CanvasTexture(c); }
    const mk = (col, x, z, s) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: _tex, color: col, blending: T.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); sp.scale.setScalar(s); sp.position.set(x, y, z); sp.visible = false; parent.add(sp); return sp; };
    const L = [mk(0xff8a10, xf, -hw, 0.42), mk(0xff8a10, xr, -hw, 0.42)], R = [mk(0xff8a10, xf, hw, 0.42), mk(0xff8a10, xr, hw, 0.42)], V = [mk(0xffffff, xr, -hw * 0.5, 0.36), mk(0xffffff, xr, hw * 0.5, 0.36)];
    return function (il, ir, rev) { L[0].visible = L[1].visible = !!il; R[0].visible = R[1].visible = !!ir; V[0].visible = V[1].visible = !!rev; };
  };
})();
