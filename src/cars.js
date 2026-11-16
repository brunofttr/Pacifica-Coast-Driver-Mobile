// Pacifica Coast — araç özellikleri + prosedürel araç modelleri (loft gövde + detaylar)
(function () {
  'use strict';
  const PC = window.PC, U = PC.U, T = THREE;

  // ================= geometri yardımcıları =================
  const Geo = (PC.Geo = {});
  // parts: [{g:BufferGeometry | pos/nor/idx, m:key}]  ->  tek geometri + malzeme anahtar listesi
  Geo.merge = function (parts) {
    const keys = [];
    for (const p of parts) if (keys.indexOf(p.m) < 0) keys.push(p.m);
    let nv = 0, ni = 0;
    for (const p of parts) {
      if (p.g) { p.pos = p.g.attributes.position.array; p.nor = p.g.attributes.normal.array; p.uv = p.g.attributes.uv ? p.g.attributes.uv.array : null; p.idx = p.g.index ? p.g.index.array : null; }
      p.nv = p.pos.length / 3; p.ni = p.idx ? p.idx.length : p.nv;
      nv += p.nv; ni += p.ni;
    }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    const geo = new T.BufferGeometry();
    let vo = 0, io = 0;
    keys.forEach((k, ki) => {
      const start = io;
      for (const p of parts) {
        if (p.m !== k) continue;
        pos.set(p.pos, vo * 3); nor.set(p.nor, vo * 3); if (p.uv) uv.set(p.uv, vo * 2);
        if (p.idx) for (let i = 0; i < p.ni; i++) idx[io + i] = p.idx[i] + vo; else for (let i = 0; i < p.ni; i++) idx[io + i] = i + vo;
        vo += p.nv; io += p.ni;
      }
      geo.addGroup(start, io - start, ki);
    });
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
    geo.setIndex(new T.BufferAttribute(idx, 1));
    for (const p of parts) if (p.g) p.g.dispose();
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    return { geometry: geo, keys };
  };
  const _m = new T.Matrix4(), _e = new T.Euler(), _qt = new T.Quaternion(), _v = new T.Vector3(), _s = new T.Vector3();
  function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) {
    _e.set(rx || 0, ry || 0, rz || 0); _qt.setFromEuler(_e); _v.set(x, y, z); _s.set(sx || 1, sy || 1, sz || 1);
    _m.compose(_v, _qt, _s); g.applyMatrix4(_m); return g;
  }
  Geo.box = (m, w, h, d, x, y, z, rx, ry, rz) => ({ g: xf(new T.BoxGeometry(w, h, d), x, y, z, rx, ry, rz), m });
  Geo.ell = (m, rx, ry, rz, x, y, z, seg) => ({ g: xf(new T.SphereGeometry(1, seg || 14, (seg || 14) - 4), x, y, z, 0, 0, 0, rx, ry, rz), m });
  Geo.cyl = (m, r1, r2, h, x, y, z, rx, ry, rz, seg) => ({ g: xf(new T.CylinderGeometry(r1, r2, h, seg || 16), x, y, z, rx, ry, rz), m });
  Geo.tor = (m, R, r, x, y, z, rx, ry, rz, seg, arc) => ({ g: xf(new T.TorusGeometry(R, r, 8, seg || 24, arc || Math.PI * 2), x, y, z, rx, ry, rz), m });
  Geo.xf = xf;
  function rrect(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // x eksenine bakan (yz düzleminde) yuvarlatılmış levha: genişlik z, yükseklik y, kalınlık x
  Geo.plateX = (m, wz, hy, depth, r, x, y, z, rz) => {
    const g = new T.ExtrudeGeometry(rrect(wz, hy, r), { depth, bevelEnabled: false, curveSegments: 5 });
    g.rotateY(Math.PI / 2); g.translate(-depth / 2, 0, 0);
    return { g: xf(g, x, y, z, 0, 0, rz || 0), m };
  };

  // anahtar noktalardan yumuşak eğri
  function curve(pts) {
    return function (x) {
      const n = pts.length;
      if (x <= pts[0][0]) return pts[0][1];
      if (x >= pts[n - 1][0]) return pts[n - 1][1];
      let i = 0; while (x > pts[i + 1][0]) i++;
      const p1 = pts[i], p2 = pts[i + 1], p0 = pts[Math.max(0, i - 1)], p3 = pts[Math.min(n - 1, i + 2)];
      const t = (x - p1[0]) / (p2[0] - p1[0]);
      const m1 = i > 0 ? ((p2[1] - p0[1]) / (p2[0] - p0[0])) * (p2[0] - p1[0]) : p2[1] - p1[1];
      const m2 = i < n - 2 ? ((p3[1] - p1[1]) / (p3[0] - p1[0])) * (p2[0] - p1[0]) : p2[1] - p1[1];
      const t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
    };
  }

  // ================= araç tanımları =================
  // Gövde ölçüleri arka tampondan (x=0) öne (x=len) doğru, metre.
  const SPECS = (PC.CarSpecs = [
    {
      id: 'bavaro', name: 'Bavaro M-Sport 40', cls: 'Spor sedan · RWD · 510 hp', colors: [0x1f4a2c, 0x0d1a3a, 0x9aa0a6, 0x7a0f14, 0x0b0b0d],
      mass: 1730, L: 2.86, cg: 0.515, track: 1.62, cgH: 0.5, R: 0.345, width: 1.9, len: 4.79, drive: 'rwd', awdFront: 0,
      torque: [[900, 300], [1800, 560], [2700, 650], [5500, 650], [6300, 590], [7200, 480]], idle: 800, redline: 7200, stall: 2500, powerKw: 375,
      gears: [5.0, 3.2, 2.143, 1.72, 1.313, 1.0, 0.823, 0.64], rev: 3.5, final: 3.15, shiftT: 0.14,
      mu: 1.18, tireB: 11, brakeG: 1.2, bias: 0.62, cdA: 0.42, cl: 0.25, rollF: 0.6, lock: 0.62, rollGain: 0.0052, pitchGain: 0.0028, suspHz: 1.9, tank: 59, cyl: 6, vmaxDial: 330,
      body: {
        rearOH: 1.03, sq: 0.25, rw: 0.59, clear: 0.14,
        top: [[0, 0.9], [0.06, 0.985], [0.8, 1.035], [1.08, 1.07], [1.78, 1.395], [2.6, 1.43], [3.06, 1.385], [3.74, 0.99], [4.45, 0.88], [4.72, 0.78], [4.79, 0.66]],
        belt: [[0, 0.86], [0.4, 0.955], [1.2, 0.985], [3.7, 0.94], [4.4, 0.84], [4.79, 0.64]],
        hw: [[0, 0.76], [0.1, 0.88], [0.5, 0.94], [2.5, 0.95], [4.2, 0.93], [4.62, 0.87], [4.79, 0.7]],
        bot: [[0, 0.36], [0.12, 0.2], [0.5, 0.15], [4.5, 0.14], [4.7, 0.17], [4.79, 0.3]],
        cowl: 3.74, roofF: 3.06, roofR: 1.78, deck: 1.08, gx0: 1.42, gx1: 3.5, pillars: [[2.36, 2.47]], sunroof: null, patches: [[4.36, 4.79, 6, 8, 'head'], [0, 0.22, 6, 8, 'tail']],
        grille: { style: 'kidney', y: 0.6, w: 0.6, h: 0.22 }, head: { style: 'slim', y: 0.7, z: 0.66, sx: 0.2, sy: 0.055, sz: 0.2 }, intake: { y: 0.33, w: 1.3, h: 0.16 },
        tail: { style: 'L', y: 0.86, z: 0.6, w: 0.42, h: 0.085 }, exhaust: [-0.52, -0.38, 0.38, 0.52], spoiler: 'lip', wheel: { style: 'twin5', w: 0.265, rimF: 0.72, cal: 0x1e3fae }, mirrorY: 0.99, handleY: 0.9, doors: [1.5, 2.42, 3.5],
      },
      seat: { x: 2.3, y: 0.42 }, dash: 'sport',
    },
    {
      id: 'canyon', name: 'Canyon Rover 4x4', cls: 'Arazi aracı · 4x4 · 285 hp', colors: [0xc9a227, 0x556b2f, 0xb5462b, 0xe8e6df, 0x23262b],
      mass: 2010, L: 2.95, cg: 0.5, track: 1.6, cgH: 0.74, R: 0.405, width: 1.88, len: 4.62, drive: 'awd', awdFront: 0.5,
      torque: [[800, 230], [1800, 300], [3000, 335], [4800, 353], [5800, 330], [6500, 280]], idle: 700, redline: 6500, stall: 2300, powerKw: 212,
      gears: [4.71, 3.14, 2.1, 1.67, 1.29, 1.0, 0.84, 0.67], rev: 3.3, final: 3.73, shiftT: 0.3, lowRange: 2.72,
      mu: 0.92, tireB: 8, brakeG: 0.98, bias: 0.6, cdA: 0.78, rollF: 0.55, lock: 0.6, rollGain: 0.011, pitchGain: 0.0062, suspHz: 1.25, tank: 81, cyl: 6, vmaxDial: 200,
      body: {
        rearOH: 0.82, sq: 0.9, rw: 0.74, clear: 0.27,
        top: [[0, 1.3], [0.04, 1.82], [0.6, 1.85], [2.55, 1.85], [2.72, 1.82], [3.0, 1.2], [3.1, 1.17], [4.3, 1.13], [4.4, 1.08], [4.62, 1.0]],
        belt: [[0, 1.1], [0.3, 1.14], [3.0, 1.13], [4.3, 1.08], [4.62, 0.98]],
        hw: [[0, 0.84], [0.05, 0.9], [3.0, 0.9], [3.2, 0.82], [4.3, 0.76], [4.5, 0.74], [4.62, 0.7]],
        bot: [[0, 0.5], [0.2, 0.34], [0.5, 0.3], [4.2, 0.3], [4.5, 0.4], [4.62, 0.52]],
        cowl: 3.02, roofF: 2.72, roofR: 0.06, deck: 0.0, gx0: 0.25, gx1: 2.82, pillars: [[1.12, 1.24], [2.0, 2.1]], flare: 0.13, clad: 0,
        grille: { style: 'slots', y: 0.86, w: 0.7, h: 0.3 }, head: { style: 'round', y: 0.88, z: 0.53, r: 0.105 }, intake: { y: 0.52, w: 1.5, h: 0.14, bumper: true },
        tail: { style: 'vert', y: 0.95, z: 0.8, w: 0.1, h: 0.2 }, exhaust: [0.5], spare: true, wheel: { style: 'steel', w: 0.27, rimF: 0.56, cal: 0x333333 }, mirrorY: 1.2, handleY: 1.05, doors: [1.2, 2.05, 2.95], fenders: true,
      },
      seat: { x: 1.95, y: 0.72 }, dash: 'rugged',
    },
    {
      id: 'ironhorse', name: 'Ironhorse 1500', cls: 'Pickup · RWD/4x4 · 400 hp', colors: [0x10131a, 0x8a1c1c, 0xd9d9d6, 0x2c4a6e, 0x5b5f66],
      mass: 2440, L: 3.68, cg: 0.44, track: 1.74, cgH: 0.72, R: 0.41, width: 2.03, len: 5.9, drive: 'awd', awdFront: 0.35,
      torque: [[800, 380], [2000, 500], [3500, 540], [4500, 545], [5500, 500], [6200, 430]], idle: 650, redline: 6200, stall: 2200, powerKw: 298,
      gears: [4.7, 2.99, 2.15, 1.77, 1.52, 1.28, 1.0, 0.85, 0.69, 0.64], rev: 4.9, final: 3.55, shiftT: 0.28, lowRange: 2.64,
      mu: 0.94, tireB: 8, brakeG: 0.95, bias: 0.64, cdA: 0.82, rollF: 0.6, lock: 0.58, rollGain: 0.0095, pitchGain: 0.0058, suspHz: 1.3, tank: 98, cyl: 8, vmaxDial: 200,
      body: {
        rearOH: 1.25, sq: 0.8, rw: 0.74, clear: 0.26,
        top: [[0, 1.02], [0.04, 1.42], [1.7, 1.42], [1.8, 1.44], [1.84, 1.9], [2.2, 1.94], [3.5, 1.93], [3.75, 1.86], [4.42, 1.32], [4.5, 1.3], [5.6, 1.26], [5.82, 1.18], [5.9, 1.0]],
        belt: [[0, 1.0], [0.1, 1.38], [1.8, 1.4], [1.9, 1.3], [4.4, 1.27], [5.6, 1.22], [5.9, 0.98]],
        hw: [[0, 0.93], [0.06, 1.0], [4.4, 1.01], [5.5, 0.99], [5.8, 0.95], [5.9, 0.88]],
        bot: [[0, 0.55], [0.15, 0.4], [0.5, 0.32], [5.4, 0.32], [5.75, 0.38], [5.9, 0.5]],
        cowl: 4.42, roofF: 3.75, roofR: 1.84, deck: 1.8, gx0: 1.98, gx1: 4.25, pillars: [[2.98, 3.1]], clad: 0, bed: [0.12, 1.72],
        grille: { style: 'bar', y: 0.9, w: 1.25, h: 0.46 }, head: { style: 'block', y: 1.02, z: 0.84, w: 0.26, h: 0.2 }, intake: { y: 0.5, w: 1.7, h: 0.16, bumper: true },
        tail: { style: 'vert', y: 1.15, z: 0.93, w: 0.12, h: 0.36 }, exhaust: [0.72], wheel: { style: 'six', w: 0.285, rimF: 0.62, cal: 0x333333 }, mirrorY: 1.42, handleY: 1.24, doors: [2.0, 3.04, 4.3], steps: true,
      },
      seat: { x: 3.25, y: 0.82 }, dash: 'rugged',
    },
    {
      id: 'veloce', name: 'Veloce 9RS', cls: 'Arkadan motorlu coupe · RWD · 510 hp', colors: [0xb8c400, 0xc8102e, 0xf2f2f0, 0x1d2a44, 0x0c0c0e],
      mass: 1480, L: 2.457, cg: 0.39, track: 1.6, cgH: 0.45, R: 0.345, width: 1.85, len: 4.56, drive: 'rwd', awdFront: 0,
      torque: [[900, 280], [2500, 380], [4500, 440], [6300, 470], [8000, 440], [9000, 395]], idle: 900, redline: 9000, stall: 3200, powerKw: 375,
      gears: [3.75, 2.38, 1.72, 1.34, 1.11, 0.96, 0.84], rev: 3.42, final: 4.19, shiftT: 0.1,
      mu: 1.26, tireB: 12, brakeG: 1.28, bias: 0.58, cdA: 0.4, cl: 0.75, rollF: 0.47, lock: 0.6, rollGain: 0.0042, pitchGain: 0.0024, suspHz: 2.2, tank: 64, cyl: 6, vmaxDial: 350,
      body: {
        rearOH: 1.05, sq: 0.1, rw: 0.56, clear: 0.11,
        top: [[0, 0.74], [0.08, 0.86], [0.5, 0.96], [1.0, 1.08], [1.9, 1.275], [2.45, 1.3], [2.85, 1.25], [3.5, 0.9], [4.0, 0.79], [4.4, 0.67], [4.56, 0.55]],
        belt: [[0, 0.72], [0.4, 0.9], [1.1, 0.95], [3.4, 0.86], [4.0, 0.76], [4.4, 0.65], [4.56, 0.52]],
        hw: [[0, 0.72], [0.12, 0.86], [0.75, 0.925], [1.4, 0.92], [2.4, 0.9], [3.6, 0.9], [4.2, 0.87], [4.45, 0.8], [4.56, 0.62]],
        bot: [[0, 0.36], [0.15, 0.18], [0.5, 0.12], [4.3, 0.11], [4.48, 0.15], [4.56, 0.26]],
        cowl: 3.5, roofF: 2.85, roofR: 1.9, deck: 1.0, gx0: 1.55, gx1: 3.25, pillars: [], headBump: true, patches: [[0, 0.3, 7, 8, 'tail']],
        grille: { style: 'none' }, head: { style: 'round', y: 0.66, z: 0.62, r: 0.115, tilt: true }, intake: { y: 0.3, w: 1.45, h: 0.17 },
        tail: { style: 'bar', y: 0.8, z: 0.0, w: 1.5, h: 0.035 }, exhaust: [-0.14, 0.14], spoiler: 'wing', wheel: { style: 'center', w: 0.3, rimF: 0.74, cal: 0xd9b800 }, mirrorY: 0.92, handleY: 0.84, doors: [1.72, 2.95],
      },
      seat: { x: 2.2, y: 0.34 }, dash: 'sport',
    },
    {
      id: 'tera', name: 'Koryo Tera', cls: 'Kompakt SUV · FWD · 180 hp', colors: [0x4a5a63, 0xe9e9e6, 0x23364d, 0x6b1d24, 0x16181b],
      mass: 1590, L: 2.68, cg: 0.59, track: 1.61, cgH: 0.64, R: 0.36, width: 1.865, len: 4.5, drive: 'fwd', awdFront: 1,
      torque: [[900, 150], [1500, 265], [4500, 265], [5500, 235], [6500, 190]], idle: 750, redline: 6500, stall: 2100, powerKw: 132,
      gears: [3.93, 2.32, 1.96, 1.02, 0.78, 0.84 * 0.8, 0.56], rev: 3.5, final: 4.47, shiftT: 0.2,
      mu: 0.98, tireB: 9, brakeG: 1.02, bias: 0.68, cdA: 0.52, rollF: 0.62, lock: 0.6, rollGain: 0.0085, pitchGain: 0.0046, suspHz: 1.45, tank: 54, cyl: 4, vmaxDial: 240,
      body: {
        rearOH: 0.9, sq: 0.45, rw: 0.62, clear: 0.2,
        top: [[0, 0.95], [0.05, 1.2], [0.3, 1.5], [0.75, 1.63], [2.3, 1.655], [2.95, 1.6], [3.62, 1.14], [4.25, 1.02], [4.44, 0.92], [4.5, 0.78]],
        belt: [[0, 0.93], [0.25, 1.1], [1.0, 1.12], [3.6, 1.06], [4.25, 0.96], [4.5, 0.75]],
        hw: [[0, 0.76], [0.1, 0.9], [0.6, 0.93], [3.9, 0.93], [4.35, 0.87], [4.5, 0.72]],
        bot: [[0, 0.42], [0.15, 0.27], [0.5, 0.2], [4.2, 0.2], [4.4, 0.25], [4.5, 0.36]],
        cowl: 3.62, roofF: 2.95, roofR: 0.75, deck: 0.3, gx0: 0.62, gx1: 3.42, pillars: [[1.28, 1.42], [2.3, 2.4]], clad: 1, flare: 0.07, sunroof: [1.3, 2.7], rails: true, patches: [[4.1, 4.5, 6, 8, 'head'], [0, 0.26, 6, 8, 'tail']],
        grille: { style: 'hex', y: 0.72, w: 1.2, h: 0.3 }, head: { style: 'slim', y: 0.9, z: 0.68, sx: 0.18, sy: 0.04, sz: 0.2 }, intake: { y: 0.36, w: 1.2, h: 0.14 },
        tail: { style: 'L', y: 1.03, z: 0.62, w: 0.4, h: 0.07, bar: true }, exhaust: [], spoiler: 'roof', wheel: { style: 'multi', w: 0.235, rimF: 0.66, cal: 0x444444 }, mirrorY: 1.16, handleY: 1.02, doors: [1.35, 2.35, 3.4],
      },
      seat: { x: 2.2, y: 0.6 }, dash: 'modern',
    },
    {
      id: 'kaido', name: 'Kaido Type-S', cls: 'Hot hatch · FWD · 315 hp', colors: [0xf4f4f2, 0xc1121f, 0x1456a8, 0x101114, 0x7d8388],
      mass: 1430, L: 2.735, cg: 0.61, track: 1.62, cgH: 0.5, R: 0.34, width: 1.89, len: 4.59, drive: 'fwd', awdFront: 1,
      torque: [[900, 200], [2000, 380], [2600, 420], [4500, 420], [6500, 345], [7000, 300]], idle: 850, redline: 7000, stall: 2800, powerKw: 235,
      gears: [3.63, 2.12, 1.53, 1.13, 0.91, 0.73], rev: 3.76, final: 3.84, shiftT: 0.22,
      mu: 1.2, tireB: 11.5, brakeG: 1.22, bias: 0.66, cdA: 0.44, cl: 0.4, rollF: 0.66, lock: 0.62, rollGain: 0.005, pitchGain: 0.0028, suspHz: 2.0, tank: 47, cyl: 4, vmaxDial: 300,
      body: {
        rearOH: 0.9, sq: 0.25, rw: 0.59, clear: 0.13,
        top: [[0, 0.8], [0.06, 0.98], [0.3, 1.05], [0.62, 1.12], [1.5, 1.37], [2.5, 1.405], [2.98, 1.36], [3.68, 0.95], [4.3, 0.84], [4.53, 0.74], [4.59, 0.62]],
        belt: [[0, 0.78], [0.35, 0.97], [1.2, 0.99], [3.6, 0.92], [4.3, 0.8], [4.59, 0.6]],
        hw: [[0, 0.76], [0.1, 0.89], [0.6, 0.945], [2.5, 0.94], [4.05, 0.93], [4.45, 0.87], [4.59, 0.7]],
        bot: [[0, 0.36], [0.14, 0.2], [0.5, 0.14], [4.3, 0.13], [4.5, 0.17], [4.59, 0.28]],
        cowl: 3.68, roofF: 2.98, roofR: 1.5, deck: 0.62, gx0: 1.2, gx1: 3.45, pillars: [[2.3, 2.4]], patches: [[4.18, 4.59, 6, 8, 'head'], [0, 0.24, 6, 8, 'tail']],
        grille: { style: 'hex', y: 0.58, w: 1.0, h: 0.14 }, head: { style: 'slim', y: 0.7, z: 0.67, sx: 0.19, sy: 0.045, sz: 0.21 }, intake: { y: 0.32, w: 1.5, h: 0.2 },
        tail: { style: 'L', y: 0.88, z: 0.62, w: 0.4, h: 0.07 }, exhaust: [-0.11, 0, 0.11], spoiler: 'bigwing', wheel: { style: 'thin10', w: 0.265, rimF: 0.74, cal: 0xb5121b }, mirrorY: 0.98, handleY: 0.88, doors: [1.42, 2.36, 3.42],
      },
      seat: { x: 2.25, y: 0.38 }, dash: 'sport',
    },
  ]);

  // ================= ortak malzemeler =================
  let M = null;
  function plateTex(text) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#1b2a55'; g.lineWidth = 6; g.strokeRect(5, 5, 246, 118);
    g.fillStyle = '#b3261e'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('PACIFICA', 128, 30);
    g.fillStyle = '#1b2a55'; g.font = 'bold 66px monospace'; g.fillText(text, 128, 100);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function mats() {
    if (M) return M;
    M = {
      trim: new T.MeshStandardMaterial({ color: 0x111214, roughness: 0.75, metalness: 0.1 }),
      trimGloss: new T.MeshStandardMaterial({ color: 0x08090a, roughness: 0.25, metalness: 0.3 }),
      glassDark: new T.MeshStandardMaterial({ color: 0x030405, roughness: 0.08, metalness: 0.85 }),
      chrome: new T.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.12, metalness: 1 }),
      tire: new T.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.92, metalness: 0 }),
      rim: new T.MeshStandardMaterial({ color: 0x9a9da2, roughness: 0.3, metalness: 0.9 }),
      rimDark: new T.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.35, metalness: 0.8 }),
      disc: new T.MeshStandardMaterial({ color: 0x777a7f, roughness: 0.45, metalness: 0.9 }),
      headOff: new T.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.1, metalness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.15 }),
      headOn: new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dd, emissiveIntensity: 3.5 }),
      tailOff: new T.MeshStandardMaterial({ color: 0x5a0508, roughness: 0.25, metalness: 0.3, emissive: 0xff0000, emissiveIntensity: 0.25 }),
      tailOn: new T.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff1010, emissiveIntensity: 4 }),
      indOff: new T.MeshStandardMaterial({ color: 0x8a4a08, roughness: 0.3, metalness: 0.3 }),
      indOn: new T.MeshStandardMaterial({ color: 0xffa000, emissive: 0xff8800, emissiveIntensity: 4 }),
      plate: new T.MeshStandardMaterial({ map: plateTex('7PCF482'), roughness: 0.5 }),
      plateP: new T.MeshStandardMaterial({ map: plateTex('S25 PLUS'), roughness: 0.5 }),
      paints: {},
    };
    return M;
  }
  PC.carMats = mats;
  function paintMat(color, hi) {
    const m = mats();
    if (!hi) { if (!m.paints[color]) m.paints[color] = new T.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.55, envMapIntensity: 1.0 }); return m.paints[color]; }
    return new T.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.25 });
  }

  // ================= loft gövde =================
  const DECK_Z = [0.86, 0.68, 0.5, 0.32, 0.15, 0], DECK_Y = [0.4, 0.66, 0.82, 0.93, 0.985, 1];
  const CAB_Y = [0.05, 0.52, 0.93, 0.985, 1, 1];
  function prof(spec) {
    const b = spec.body;
    if (b._p) return b._p;
    const c0 = { top: curve(b.top), belt: curve(b.belt), hw: curve(b.hw), bot: curve(b.bot) }, Ln = spec.len, xe = 0.13;
    const flat = (f, lo, sgn) => (x) => { const v = f(x); if (x > xe && x < Ln - xe) return v; const ref = f(x <= xe ? xe : Ln - xe) - lo * sgn; return sgn > 0 ? Math.max(v, ref) : Math.min(v, ref); };
    const P = { top: flat(c0.top, 0.07, 1), belt: flat(c0.belt, 0.09, 1), hw: (x) => Math.max(c0.hw(x), c0.hw(x < Ln / 2 ? 0.2 : Ln - 0.2) * 0.85), bot: flat(c0.bot, -0.06, -1), len: spec.len, b };
    P.xr = b.rearOH; P.xf = b.rearOH + spec.L; P.ra = spec.R + 0.075; P.R = spec.R;
    P.shift = -(b.rearOH + spec.L * spec.cg);
    P.arch = (x) => {
      let d = Math.abs(x - P.xr); if (d >= P.ra) d = Math.abs(x - P.xf);
      return d < P.ra ? P.R + Math.sqrt(P.ra * P.ra - d * d) : 0;
    };
    // yarım halka: [y,z] dizisi (16 nokta; 8 ve 9 aynı konum = pencere altı kırığı)
    P.ring = (x, out) => {
      const w = P.hw(x), belt = P.belt(x), top = Math.max(P.top(x), belt + 0.025), bot = Math.min(P.bot(x), belt - 0.12), sq = b.sq;
      const arch = Math.min(P.arch(x), belt - 0.07), bs = arch > 0 ? Math.max(bot, arch) : bot;
      const cf = U.clamp((top - belt) / 0.28, 0, 1), g = top - belt, rw = Math.min(b.rw, w * 0.93), hb = belt - bs;
      const r = out || [];
      let k = 0; const put = (y, z) => { r[k++] = y; r[k++] = z; };
      put(bot, 0); put(bot, 0.6 * w);
      if (arch > 0) put(bs, 0.62 * w); else put(bot + 0.005, 0.76 * w);
      put(bs + 0.02 * hb, U.lerp(0.9, 0.975, sq) * w);
      put(bs + 0.14 * hb, U.lerp(0.975, 0.995, sq) * w);
      put(bs + 0.45 * hb, w);
      put(bs + 0.8 * hb, w * U.lerp(0.992, 1, sq));
      put(belt - 0.02, w * U.lerp(0.972, 0.992, sq));
      put(belt, w * 0.955); put(belt, w * 0.955);
      const zs = w * 0.955, cz0 = U.lerp(w * 0.93, rw, 0.1 + 0.3 * sq), cz1 = U.lerp(w * 0.93, rw, 0.6 + 0.3 * sq);
      const CAB_Z = [cz0, cz1, rw, rw * 0.86, rw * 0.5, 0];
      for (let j = 0; j < 6; j++) put(belt + g * U.lerp(DECK_Y[j], CAB_Y[j], cf), U.lerp(DECK_Z[j] * zs, CAB_Z[j], cf));
      r.cf = cf; r.arch = arch;
      return r;
    };
    return (b._p = P);
  }
  PC.carProfile = prof;
  const NR = 16; // yarım halka nokta sayısı
  function loft(spec, lod) {
    const P = prof(spec), b = P.b, L = P.len;
    // istasyonlar
    let xs = [];
    const nUni = lod ? 26 : 64;
    for (let i = 0; i <= nUni; i++) xs.push((L * i) / nUni);
    const keys = [b.cowl, b.roofF, b.roofR, b.deck, b.gx0, b.gx1, 0.03, 0.1, L - 0.03, L - 0.1];
    for (const pl of b.pillars || []) keys.push(pl[0], pl[1]);
    for (const pt of b.patches || []) keys.push(pt[0], pt[1]);
    if (b.sunroof) keys.push(b.sunroof[0], b.sunroof[1]);
    for (const xw of [P.xr, P.xf]) {
      keys.push(xw - P.ra - 0.004, xw - P.ra + 0.004, xw + P.ra - 0.004, xw + P.ra + 0.004);
      const na = lod ? 5 : 12;
      for (let i = 1; i < na; i++) keys.push(xw - P.ra * Math.cos((Math.PI * i) / na));
      if (b.flare) keys.push(xw - P.ra - b.flare, xw + P.ra + b.flare);
    }
    for (const kx of keys) if (kx > 0 && kx < L) xs.push(kx);
    xs.sort((a, c) => a - c);
    xs = xs.filter((x, i) => i === 0 || x - xs[i - 1] > 0.0025);
    const ns = xs.length, RV = NR * 2; // tam halka: sağ 16 + sol 16
    const pos = new Float32Array(ns * RV * 3), rings = [];
    for (let i = 0; i < ns; i++) {
      const r = P.ring(xs[i]); rings.push(r);
      for (let j = 0; j < NR; j++) {
        const y = r[j * 2], z = r[j * 2 + 1];
        let o = (i * RV + j) * 3; pos[o] = xs[i] + P.shift; pos[o + 1] = y; pos[o + 2] = z;
        o = (i * RV + NR + j) * 3; pos[o] = xs[i] + P.shift; pos[o + 1] = y; pos[o + 2] = -z;
      }
    }
    const idx = { paint: [], glass: [], trim: [], pillar: [], apillar: [] };
    const inP = (x) => { for (const pl of b.pillars || []) if (x > pl[0] && x < pl[1]) return true; return false; };
    for (let i = 0; i < ns - 1; i++) {
      const xm = (xs[i] + xs[i + 1]) / 2, ra = rings[i], rb = rings[i + 1];
      const cf = Math.min(ra.cf, rb.cf), archOn = ra.arch > 0 && rb.arch > 0;
      let nearArch = false;
      if (b.flare) for (const xw of [P.xr, P.xf]) if (Math.abs(xm - xw) < P.ra + b.flare) nearArch = true;
      for (let j = 0; j < NR - 1; j++) {
        if (j === 8) continue;
        let key = 'paint';
        if (j <= 1) key = 'trim';
        else if (j === 2 && archOn) key = 'trim';
        else if (j >= 2 && j <= 2 + (b.clad || 0)) key = b.clad ? 'trim' : 'paint';
        if (nearArch && j >= 2 && j <= 4) key = 'trim';
        if ((j === 9 || j === 10) && xm > b.gx0 && xm < Math.max(b.gx1, b.cowl - 0.1) && cf > 0.22) key = inP(xm) ? 'pillar' : 'glass';
        const ws = xm > b.roofF && xm < b.cowl, rwn = xm < b.roofR && xm > b.deck && b.roofR - b.deck > 0.15;
        if ((ws || rwn) && j === 10) key = ws ? 'apillar' : 'paint';
        if (ws && (j === 8 || j === 9) && key === 'paint') key = 'apillar'; // ön direk dibi: içeriden çizilmez
        if (j >= 11 && (ws || rwn)) key = 'glass';
        if (j >= 12 && b.sunroof && xm > b.sunroof[0] && xm < b.sunroof[1]) key = 'glass';
        if (b.bed && j >= 10 && xm > b.bed[0] && xm < b.bed[1]) key = 'trim';
        const a0 = i * RV + j, a1 = a0 + 1, b0 = a0 + RV, b1 = b0 + 1;
        idx[key].push(a0, b0, a1, a1, b0, b1);
        const c0 = a0 + NR, c1 = c0 + 1, d0 = c0 + RV, d1 = d0 + 1;
        idx[key].push(c0, c1, d0, c1, d1, d0);
      }
    }
    // normaller (konuma göre kaynak; pencere altı kırığı korunur)
    const nor = new Float32Array(pos.length), acc = new Map();
    const all = idx.paint.concat(idx.glass, idx.trim, idx.pillar, idx.apillar);
    const keyOf = (v) => { const j = v % NR; return Math.round(pos[v * 3] * 2000) + ',' + Math.round(pos[v * 3 + 1] * 2000) + ',' + Math.round(pos[v * 3 + 2] * 2000) + (j <= 8 ? 'a' : 'b'); };
    const vk = new Array(ns * RV);
    for (let v = 0; v < ns * RV; v++) vk[v] = keyOf(v);
    const A = new T.Vector3(), B = new T.Vector3(), C = new T.Vector3();
    for (let t = 0; t < all.length; t += 3) {
      A.fromArray(pos, all[t] * 3); B.fromArray(pos, all[t + 1] * 3); C.fromArray(pos, all[t + 2] * 3);
      B.sub(A); C.sub(A); B.cross(C);
      for (let q = 0; q < 3; q++) { const k = vk[all[t + q]]; let n = acc.get(k); if (!n) acc.set(k, (n = [0, 0, 0])); n[0] += B.x; n[1] += B.y; n[2] += B.z; }
    }
    for (let v = 0; v < ns * RV; v++) { const n = acc.get(vk[v]); if (!n) continue; const l = Math.hypot(n[0], n[1], n[2]) || 1; nor[v * 3] = n[0] / l; nor[v * 3 + 1] = n[1] / l; nor[v * 3 + 2] = n[2] / l; }
    const parts = [];
    // gövde yüzeyine oturan ışık yamaları
    for (const pt of b.patches || []) {
      const pp = [], pn = [], pi = [[], []];
      for (let i = 0; i < ns; i++) for (let sd = 0; sd < 2; sd++) for (let j = pt[2]; j <= pt[3]; j++) { const v = (i * RV + sd * NR + j) * 3; pp.push(pos[v] + nor[v] * 0.007, pos[v + 1] + nor[v + 1] * 0.007, pos[v + 2] + nor[v + 2] * 0.007); pn.push(nor[v], nor[v + 1], nor[v + 2]); }
      const nj = pt[3] - pt[2] + 1;
      for (let i = 0; i < ns - 1; i++) { if (xs[i] < pt[0] - 1e-4 || xs[i + 1] > pt[1] + 1e-4) continue; for (let sd = 0; sd < 2; sd++) for (let j = 0; j < nj - 1; j++) { const a0 = (i * 2 + sd) * nj + j, a1 = a0 + 1, b0 = a0 + 2 * nj, b1 = b0 + 1; if (sd === 0) pi[0].push(a0, b0, a1, a1, b0, b1); else pi[1].push(a0, a1, b0, a1, b1, b0); } }
      const P32 = new Float32Array(pp), N32 = new Float32Array(pn);
      if (pt[4] === 'ind') { parts.push({ pos: P32, nor: N32, idx: pi[0], m: 'indR' }); parts.push({ pos: P32, nor: N32, idx: pi[1], m: 'indL' }); }
      else parts.push({ pos: P32, nor: N32, idx: pi[0].concat(pi[1]), m: pt[4] });
    }
    for (const k of ['paint', 'glass', 'trim', 'pillar', 'apillar']) if (idx[k].length) parts.push({ pos, nor, idx: idx[k], m: k === 'pillar' ? 'trimGloss' : k });
    // ön / arka kapak
    for (const end of [0, 1]) {
      const i = end ? ns - 1 : 0, r = rings[i], cp = [], cn = [], ci = [];
      const yc = (r[0] + r[(NR - 1) * 2]) / 2;
      cp.push(xs[i] + P.shift, yc, 0); cn.push(end ? 1 : -1, 0, 0);
      for (let s = 0; s < 2; s++) for (let j = 0; j < NR; j++) { cp.push(xs[i] + P.shift, r[j * 2], (s ? -1 : 1) * r[j * 2 + 1]); cn.push(end ? 1 : -1, 0, 0); }
      for (let s = 0; s < 2; s++) for (let j = 0; j < NR - 1; j++) {
        const a = 1 + s * NR + j, c = a + 1;
        if ((end === 1) === (s === 0)) ci.push(0, c, a); else ci.push(0, a, c);
      }
      parts.push({ pos: new Float32Array(cp), nor: new Float32Array(cn), idx: ci, m: 'paint' });
    }
    return parts;
  }

  // ================= tekerlek =================
  function wheelParts(R, w, st, lod) {
    const parts = [], rimR = R * st.rimF, hw = w / 2;
    if (lod) {
      parts.push(Geo.cyl('tire', R, R, w, 0, 0, 0, Math.PI / 2, 0, 0, 14));
      parts.push(Geo.cyl('rim', rimR, rimR, w + 0.012, 0, 0, 0, Math.PI / 2, 0, 0, 12));
      return parts;
    }
    const tp = [[rimR, -hw], [R - 0.035, -hw], [R - 0.008, -hw + 0.02], [R, -hw + 0.05], [R, hw - 0.05], [R - 0.008, hw - 0.02], [R - 0.035, hw], [rimR, hw]].map((p) => new T.Vector2(p[0], p[1]));
    parts.push({ g: xf(new T.LatheGeometry(tp, 36), 0, 0, 0, Math.PI / 2, 0, 0), m: 'tire' });
    const dark = st.style === 'steel' || st.style === 'center' || st.style === 'thin10';
    const rk = dark ? 'rimDark' : 'rim';
    const bp = [[rimR * 0.35, -hw * 0.3], [rimR - 0.02, -hw + 0.01], [rimR, -hw], [rimR, hw], [rimR - 0.015, hw - 0.004], [rimR - 0.03, hw - 0.03], [rimR - 0.035, -hw * 0.5]].map((p) => new T.Vector2(p[0], p[1]));
    parts.push({ g: xf(new T.LatheGeometry(bp, 30), 0, 0, 0, Math.PI / 2, 0, 0), m: rk });
    const zf = hw - 0.035; // jant yüzü
    const spoke = (n, wd, twin) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        for (const o of twin ? [-0.06, 0.06] : [0]) {
          const g = new T.BoxGeometry(rimR - 0.05, wd, 0.03);
          g.translate((rimR - 0.05) / 2 + 0.04, 0, 0);
          parts.push({ g: xf(xf(g, 0, 0, 0, 0, 0.1, 0), 0, 0, zf - 0.01, 0, 0, a + o), m: rk });
        }
      }
    };
    if (st.style === 'twin5') spoke(5, 0.03, true);
    else if (st.style === 'multi') spoke(10, 0.035, false);
    else if (st.style === 'thin10') spoke(10, 0.022, false);
    else if (st.style === 'six') spoke(6, 0.075, false);
    else if (st.style === 'center') spoke(5, 0.03, true);
    else { // çelik jant: disk + delikler
      parts.push(Geo.cyl(rk, rimR - 0.02, rimR - 0.02, 0.02, 0, 0, zf - 0.02, Math.PI / 2, 0, 0, 24));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; parts.push(Geo.cyl('tire', 0.028, 0.028, 0.03, Math.cos(a) * rimR * 0.66, Math.sin(a) * rimR * 0.66, zf - 0.015, Math.PI / 2, 0, 0, 8)); }
    }
    parts.push(Geo.cyl(rk, 0.07, 0.075, 0.05, 0, 0, zf - 0.005, Math.PI / 2, 0, 0, 14));
    if (st.style === 'center') parts.push(Geo.cyl('chrome', 0.03, 0.03, 0.03, 0, 0, zf + 0.02, Math.PI / 2, 0, 0, 6));
    else for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; parts.push(Geo.cyl('chrome', 0.011, 0.011, 0.02, Math.cos(a) * 0.05, Math.sin(a) * 0.05, zf + 0.02, Math.PI / 2, 0, 0, 6)); }
    parts.push(Geo.cyl('disc', rimR * 0.8, rimR * 0.8, 0.028, 0, 0, hw * 0.25, Math.PI / 2, 0, 0, 24));
    return parts;
  }

  // ================= detaylar =================
  function details(spec, lod, parts, hi) {
    const P = prof(spec), b = P.b, L = P.len, sh = P.shift;
    const zAt = (x, j) => P.ring(x)[j * 2 + 1], yAt = (x, j) => P.ring(x)[j * 2];
    const add = (p) => { p.g.translate(sh, 0, 0); parts.push(p); };
    const both = (fn) => { fn(1); fn(-1); };
    const fy = b.grille.y, G = b.grille, H = b.head, TL = b.tail, I = b.intake;
    // --- ızgara ---
    const xF = L - 0.012;
    if (G.style === 'kidney') both((s) => {
      add(Geo.plateX('chrome', G.w / 2 - 0.02, G.h, 0.03, 0.06, xF + 0.005, fy, s * (G.w / 4 + 0.012)));
      add(Geo.plateX('trim', G.w / 2 - 0.06, G.h - 0.04, 0.036, 0.045, xF + 0.008, fy, s * (G.w / 4 + 0.012)));
      if (!lod) for (let i = -2; i <= 2; i++) add(Geo.box('trimGloss', 0.02, G.h - 0.06, 0.012, xF + 0.03, fy, s * (G.w / 4 + 0.012) + i * 0.04));
    });
    else if (G.style === 'slots') {
      add(Geo.plateX('paint', G.w + 0.08, G.h + 0.1, 0.05, 0.03, xF, fy, 0));
      for (let i = -2; i <= 2; i++) add(Geo.plateX('trim', 0.085, G.h, 0.056, 0.03, xF + 0.002, fy, i * (G.w / 5)));
    } else if (G.style === 'bar') {
      add(Geo.plateX('trim', G.w, G.h, 0.05, 0.05, xF, fy, 0));
      add(Geo.plateX('chrome', G.w + 0.06, 0.06, 0.07, 0.02, xF, fy + G.h / 2, 0));
      add(Geo.plateX('chrome', G.w + 0.06, 0.07, 0.08, 0.02, xF, fy, 0));
      if (!lod) for (let i = -3; i <= 3; i += 2) { add(Geo.box('trimGloss', 0.06, 0.025, G.w - 0.04, xF, fy + i * 0.055, 0)); }
    } else if (G.style === 'hex') {
      add(Geo.plateX('trim', G.w, G.h, 0.04, G.h * 0.3, xF, fy, 0));
      if (!lod) for (let i = -2; i <= 2; i++) add(Geo.box('trimGloss', 0.05, 0.012, G.w - 0.08, xF, fy + i * G.h * 0.17, 0));
    }
    if (I) {
      add(Geo.plateX('trim', Math.min(I.w, P.hw(L) * 2 - 0.1), I.h, 0.05, 0.04, L - 0.012, I.y, 0));
      if (!I.bumper) { add(Geo.box('trimGloss', 0.2, 0.025, P.hw(L) * 2 - 0.06, L - 0.06, P.bot(L) + 0.01, 0)); if (!lod) add(Geo.box('trimGloss', 0.03, 0.012, Math.min(I.w, P.hw(L) * 2 - 0.1) - 0.1, L + 0.012, I.y, 0)); }
      if (I.bumper) add(Geo.plateX('trim', I.w + 0.25, I.h + 0.1, 0.16, 0.05, L - 0.04, I.y, 0));
      if (!lod && !I.bumper) {}
    }
    // --- farlar ---
    both((s) => {
      if (H.style === 'round') {
        const x = L - (H.tilt ? 0.3 : 0.06), z = s * H.z, y = H.tilt ? yAt(x, 12) - 0.035 : H.y;
        if (H.tilt) { add(Geo.ell('head', 0.17, 0.05, H.r, x, y, z, 16)); add(Geo.tor('trimGloss', H.r * 0.9, 0.012, x, y + 0.035, z, Math.PI / 2, 0, 0, 20)); }
        else { add(Geo.cyl('head', H.r, H.r, 0.06, x, y, z, 0, 0, Math.PI / 2, 20)); add(Geo.tor('chrome', H.r, 0.014, x + 0.03, y, z, 0, Math.PI / 2, 0, 20)); add(Geo.cyl('ind' + (s > 0 ? 'R' : 'L'), 0.045, 0.045, 0.05, x - 0.02, y - 0.02, s * (H.z + 0.25), 0, 0, Math.PI / 2, 12)); }
      } else if (H.style === 'block') {
        add(Geo.plateX('head', H.w, H.h, 0.08, 0.03, L - 0.05, H.y, s * (H.z - H.w / 2)));
        add(Geo.box('ind' + (s > 0 ? 'R' : 'L'), 0.06, H.h * 0.9, 0.05, L - 0.08, H.y, s * (H.z + 0.015)));
      } else {
        const yy = (yAt(L, 6) + yAt(L, 8)) / 2, zz = s * (P.hw(L) - 0.19);
        add(Geo.plateX('head', 0.3, yAt(L, 8) - yAt(L, 6) - 0.01, 0.012, 0.02, L + 0.004, yy, zz));
        add(Geo.plateX('ind' + (s > 0 ? 'R' : 'L'), 0.26, 0.018, 0.014, 0.008, L + 0.004, yAt(L, 6) - 0.022, zz));
      }
    });
    // --- stoplar ---
    both((s) => {
      const side = s > 0 ? 'R' : 'L';
      if (TL.style === 'bar') {
        const yb2 = yAt(0, 7) - 0.06, wb = P.hw(0) * 2 - 0.16;
        add(Geo.plateX('tail', wb / 2, 0.05, 0.02, 0.012, -0.008, yb2, s * wb / 4));
        add(Geo.box('ind' + side, 0.02, 0.022, 0.22, -0.008, yb2 - 0.05, s * (wb / 2 - 0.13)));
      } else if (TL.style === 'vert') {
        const zv = s * (Math.min(TL.z, P.hw(0)) - TL.w / 2 - 0.03), yv = Math.min(TL.y, yAt(0, 8) - TL.h / 2 - 0.03);
        add(Geo.box('tail', 0.06, TL.h, TL.w, -0.02, yv, zv));
        add(Geo.box('ind' + side, 0.06, TL.h * 0.3, TL.w, -0.02, yv - TL.h * 0.68, zv));
      } else {
        const yy = (yAt(0, 6) + yAt(0, 8)) / 2, hh = yAt(0, 8) - yAt(0, 6) - 0.01, zz = s * (P.hw(0) - 0.2);
        add(Geo.plateX('tail', 0.36, hh, 0.012, 0.02, -0.004, yy, zz));
        add(Geo.plateX('ind' + side, 0.3, 0.02, 0.014, 0.008, -0.004, yAt(0, 6) - 0.024, zz));
        if (TL.bar) add(Geo.box('tail', 0.012, 0.022, P.hw(0) - 0.38, -0.004, yy, s * (P.hw(0) - 0.38) / 2));
      }
    });
    // --- arka difüzör ---
    if (!b.spare && TL.style !== 'vert') add(Geo.plateX('trim', P.hw(0) * 2 - 0.12, 0.2, 0.03, 0.04, -0.004, P.bot(0) + 0.12, 0));
    // --- plakalar ---
    const pk = hi ? 'plateP' : 'plate';
    const plate = (x, y, ry) => { const g = new T.PlaneGeometry(0.42, 0.21); add({ g: xf(g, x, y, 0, 0, ry, 0), m: pk }); };
    plate(-0.012 + (TL.style === 'vert' ? -0.01 : 0), spec.body.tail.y - 0.2 - (b.spare ? 0.32 : 0), -Math.PI / 2);
    if (!lod) plate(L + 0.03 + (I && I.bumper ? 0.06 : 0), I ? I.y + (I.bumper ? 0 : 0.14) : 0.4, Math.PI / 2);
    // --- aynalar ---
    both((s) => {
      const x = b.cowl - 0.42, z = s * (zAt(x, 8) + 0.1);
      add(Geo.ell(lod ? 'trim' : 'paint', 0.09, 0.075, 0.125, x, b.mirrorY + 0.05, z, 10));
      if (!lod) { add(Geo.box('trim', 0.05, 0.03, 0.12, x, b.mirrorY, z - s * 0.08)); add(Geo.box('mirror', 0.008, 0.11, 0.2, x - 0.082, b.mirrorY + 0.05, z)); }
    });
    // --- egzoz ---
    for (const ez of b.exhaust || []) { add(Geo.cyl('chrome', 0.045, 0.05, 0.16, 0.03, P.bot(0.3) + 0.11, ez, 0, 0, Math.PI / 2, 12)); if (!lod) add(Geo.cyl('trim', 0.036, 0.036, 0.17, 0.028, P.bot(0.3) + 0.11, ez, 0, 0, Math.PI / 2, 10)); }
    // --- spoiler ---
    if (b.spoiler === 'lip') add(Geo.box('paint', 0.1, 0.022, 1.3, 0.06, P.top(0.06) + 0.012, 0, 0, 0, 0.12));
    if (b.spoiler === 'roof') add(Geo.box('paint', 0.24, 0.03, 1.1, b.roofR - 0.2, P.top(b.roofR - 0.2) - 0.005, 0, 0, 0, -0.1));
    if (b.spoiler === 'wing' || b.spoiler === 'bigwing') {
      const big = b.spoiler === 'bigwing', yb = P.top(big ? 0.3 : 0.45), hgt = big ? 0.24 : 0.2, xw = big ? 0.26 : 0.4;
      add(Geo.box(big ? 'trimGloss' : 'paint', 0.24, 0.022, spec.width - 0.12, xw, yb + hgt, 0, 0, 0, 0.14));
      both((s) => { add(Geo.box('trimGloss', 0.2, hgt + 0.06, 0.02, xw + 0.03, yb + hgt / 2, s * (big ? 0.5 : 0.42), 0, 0, 0.25)); add(Geo.box(big ? 'trimGloss' : 'paint', 0.26, 0.09, 0.016, xw, yb + hgt + 0.02, s * (spec.width / 2 - 0.06))); });
    }
    if (b.spare) { const xs = -0.13, ys = 0.98; add(Geo.cyl('tire', spec.R, spec.R, 0.25, xs, ys, 0, 0, 0, Math.PI / 2, 20)); add(Geo.cyl('trim', spec.R * 0.55, spec.R * 0.55, 0.26, xs - 0.004, ys, 0, 0, 0, Math.PI / 2, 14)); }
    if (b.rails && !lod) both((s) => { add(Geo.box('trimGloss', 1.5, 0.03, 0.035, (b.roofR + b.roofF) / 2, P.top((b.roofR + b.roofF) / 2) + 0.035, s * (b.rw - 0.04))); });
    if (b.steps) both((s) => add(Geo.box('trim', 1.9, 0.04, 0.16, (P.xr + P.xf) / 2, P.bot(3) + 0.03, s * (spec.width / 2 - 0.02))));
    if (b.fenders) both((s) => { for (const xw of [P.xr, P.xf]) { const g = new T.TorusGeometry(P.ra + 0.03, 0.05, 6, 14, Math.PI); add({ g: xf(g, xw, P.R, s * (zAt(xw, 5) + 0.015), 0, 0, 0, 1, 1, 1.6), m: 'trim' }); } });
    if (lod) return;
    // --- kapı çizgileri, kollar, silecekler ---
    for (const dx of b.doors || []) both((s) => {
      const r = P.ring(dx), pp = [], nn = [], ii = [];
      for (let j = 3; j <= 8; j++) { for (const o of [-0.004, 0.004]) { pp.push(dx + o + sh, r[j * 2], s * (r[j * 2 + 1] + 0.0025)); nn.push(0, 0, s); } }
      for (let j = 0; j < 5; j++) { const a = j * 2; if (s > 0) ii.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); else ii.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      parts.push({ pos: new Float32Array(pp), nor: new Float32Array(nn), idx: ii, m: 'trim' });
    });
    const dl = b.doors || [];
    for (let i = 1; i < dl.length; i++) both((s) => { const x = dl[i - 1] + 0.14; add(Geo.box('chrome', 0.16, 0.022, 0.02, x, b.handleY, s * (zAt(x, 6) + 0.012))); });
    both((s) => add(Geo.box('trim', 0.02, 0.012, 0.5, b.cowl + 0.02, P.top(b.cowl) + 0.02, s * 0.3, 0, s * 0.25, 0)));
    if (b.headBump) both((s) => add(Geo.ell('paint', 0.5, 0.05, 0.16, L - 0.62, yAt(L - 0.62, 12) - 0.03, s * 0.62, 14)));
  }

  // ================= araç kur =================
  // opts: {color, lod(1=trafik), player}
  PC.buildCar = function (spec, opts) {
    opts = opts || {};
    const lod = opts.lod ? 1 : 0, hi = !!opts.player, MM = mats(), P = prof(spec);
    const ws = spec.body.wheel, ht = spec.track / 2, a = spec.L * (1 - spec.cg), bb = spec.L * spec.cg;
    const wpos = [[a, -ht], [a, ht], [-bb, -ht], [-bb, ht]];
    let merged = lod ? spec._lod : null;
    if (!merged) {
      const parts = loft(spec, lod);
      details(spec, lod, parts, hi);
      if (lod) for (const wp of wpos) for (const p of wheelParts(spec.R, ws.w, ws, 1)) { p.g.translate(wp[0], spec.R, wp[1]); parts.push(p); }
      merged = Geo.merge(parts);
      if (lod) spec._lod = merged;
    }
    const car = { spec, group: new T.Group(), body: new T.Group(), wheels: [], mats: {}, keys: merged.keys };
    const paint = paintMat(opts.color !== undefined ? opts.color : spec.colors[0], hi);
    const glass = hi ? PC.glassify(new T.MeshPhysicalMaterial({ color: 0x0c1116 }), 0.32) : MM.glassDark; if (hi) car.glass = glass;
    const mirrorMat = hi ? new T.MeshBasicMaterial({ color: 0x93a1ad, toneMapped: false }) : MM.chrome; car.mirrorMat = hi ? mirrorMat : null; // yan aynalar: kokpit kurulunca dikiz görüntüsünü gösterir
    const local = { paint, glass, head: MM.headOff, tail: MM.tailOff, indL: MM.indOff, indR: MM.indOff, mirror: mirrorMat, plate: MM.plate, apillar: paint };
    const matArr = merged.keys.map((k) => local[k] || MM[k] || MM.trim);
    const mesh = new T.Mesh(merged.geometry, matArr);
    mesh.castShadow = true; mesh.receiveShadow = false;
    car.group.add(PC.blobShadow(spec.len, spec.width));
    car.mesh = mesh; car.matArr = matArr; car.paint = paint; car.glass = glass;
    car.body.add(mesh); car.group.add(car.body);
    car.kHead = merged.keys.indexOf('head'); car.kTail = merged.keys.indexOf('tail'); car.kIndL = merged.keys.indexOf('indL'); car.kIndR = merged.keys.indexOf('indR');
    car.setLights = function (head, brake, il, ir, rev) {
      if (car.spr) car.spr(false, false, rev);
      if (car.kHead >= 0) matArr[car.kHead] = head ? MM.headOn : MM.headOff;
      if (car.kTail >= 0) matArr[car.kTail] = brake ? MM.tailOn : head ? car.tailDim || (car.tailDim = (() => { const m = MM.tailOff.clone(); m.emissiveIntensity = 1.3; return m; })()) : MM.tailOff;
      if (car.kIndL >= 0) matArr[car.kIndL] = il ? MM.indOn : MM.indOff;
      if (car.kIndR >= 0) matArr[car.kIndR] = ir ? MM.indOn : MM.indOff;
    };
    if (hi) {
      // iç kabuk (camdan içeri bakınca karşı yüz)
      const shell = new T.Mesh(merged.geometry, merged.keys.map((k) => (k === 'paint' || k === 'trim' || k === 'trimGloss' ? PC.interiorShellMat() : PC.hiddenMat())));
      car.body.add(shell); car.shell = shell;
      // tekerlekler
      const wm = Geo.merge(wheelParts(spec.R, ws.w, ws, 0));
      const wmat = wm.keys.map((k) => MM[k] || MM.trim);
      const calMat = new T.MeshStandardMaterial({ color: ws.cal, roughness: 0.4, metalness: 0.4 });
      wpos.forEach((wp, i) => {
        const hub = new T.Group(), spin = new T.Mesh(wm.geometry, wmat);
        spin.castShadow = true;
        const left = wp[1] < 0;
        const flip = new T.Group(); if (left) flip.rotation.y = Math.PI;
        flip.add(spin);
        const cal = new T.Mesh(new T.BoxGeometry(0.1, 0.16, 0.07), calMat); cal.position.set(-spec.R * ws.rimF * 0.62, 0.02, ws.w * 0.14); flip.add(cal);
        hub.add(flip); hub.position.set(wp[0], spec.R, wp[1]);
        car.group.add(hub); car.wheels.push({ hub, spin, left, front: i < 2, x: wp[0], z: wp[1] });
      });
    }
    car.P = P; car.envMats = [paint, glass];
    if (hi && PC.lightSprites) car.spr = PC.lightSprites(car.group, P.len + P.shift, P.shift - 0.03, spec.width / 2 * 0.62, P.belt(0.05) - 0.12);
    car.hoodCam = new T.Vector3(P.b.cowl + P.shift + 0.2, P.belt(P.b.cowl) + 0.34, 0);
    return car;
  };
  // araç altı yumuşak temas gölgesi (gölge haritasının erişemediği uzak araçlarda da zemine oturtur)
  let _blobTex = null;
  PC.blobShadow = function (len, width) {
    if (!_blobTex) {
      const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d');
      const gr = g.createRadialGradient(64, 32, 4, 64, 32, 62); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(64, 32); g.scale(1, 0.52); g.translate(-64, -32); g.fillStyle = gr; g.fillRect(-64, -64, 256, 192); g.restore();
      _blobTex = new T.CanvasTexture(c);
    }
    const m = new T.Mesh(new T.PlaneGeometry(len * 1.12, width * 1.25), new T.MeshBasicMaterial({ map: _blobTex, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.035; m.renderOrder = 1; return m;
  };
  let _shell = null, _hid = null;
  PC.interiorShellMat = () => _shell || (_shell = new T.MeshStandardMaterial({ color: 0x18191c, roughness: 0.9, side: T.BackSide }));
  PC.hiddenMat = () => _hid || (_hid = new T.MeshBasicMaterial({ visible: false }));
})();
