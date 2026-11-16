// Pacifica Coast — görsel dünya: arazi, yollar, şehir, köprü, sinyaller, ağaçlar, su, gökyüzü
(function () {
  'use strict';
  const PC = window.PC, U = PC.U, T = THREE, Geo = PC.Geo;
  const S = (PC.Scenery = { nightMats: [], lampMats: [] });

  function canvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
  function tex(c, rep, aniso) {
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = aniso || S.aniso || 8; return t;
  }
  function itex(name, rep, srgb) {
    const im = PC.Assets && PC.Assets.imgs[name]; if (!im) return null;
    const t = new T.Texture(im); t.wrapS = t.wrapT = T.RepeatWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace;
    if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = S.aniso || 8; t.needsUpdate = true; return t;
  }
  function tileImg(g, name, w, h, n) { const im = PC.Assets && PC.Assets.imgs[name]; if (!im) return false; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g.drawImage(im, (i * w) / n, (j * h) / n, w / n, h / n); return true; }
  function speckle(g, w, h, n, a, light) {
    for (let i = 0; i < n; i++) { const v = light ? 200 + Math.random() * 55 : Math.random() * 60; g.fillStyle = `rgba(${v},${v},${v},${a * Math.random()})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  }

  // ---------- yol dokuları ----------
  function roadTex(type) {
    const Ty = PC.World.TYPES[type], half = Ty.median / 2 + Ty.n * Ty.laneW + Ty.shoulder, Wd = Ty.city ? 1024 : 512, Hd = Ty.city ? 2048 : 512, ppm = Wd / (2 * half);
    return tex(canvas(Wd, Hd, (g) => {
      g.fillStyle = Ty.city ? '#2e2f33' : '#2a2b2e'; g.fillRect(0, 0, Wd, Hd);
      if (Ty.city && PC.Assets.imgs.asphalt) { const im = PC.Assets.imgs.asphalt; for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) g.drawImage(im, i * 512, j * 512, 512, 512); g.fillStyle = 'rgba(20,21,24,0.2)'; g.fillRect(0, 0, Wd, Hd); oldAsphalt(g, Wd, Hd, type === 'avenue' ? 77 : 4242); }
      else if (tileImg(g, 'asphalt', Wd, Hd, 2)) { g.fillStyle = 'rgba(20,21,24,0.28)'; g.fillRect(0, 0, Wd, Hd); speckle(g, Wd, Hd, 2500, 0.2, false); } else { speckle(g, Wd, Hd, 9000, 0.35, false); speckle(g, Wd, Hd, 5000, 0.12, true); }
      const X = (m) => Wd / 2 + m * ppm, line = (m, wd, col, dash) => {
        g.fillStyle = col;
        if (Ty.city) g.globalAlpha = 0.82;
        if (dash) { const dn = Ty.city ? 2 : 1; for (let q = 0; q < dn; q++) g.fillRect(X(m) - (wd * ppm) / 2, (Hd * q) / dn, wd * ppm, (Hd * 0.27) / dn); } else g.fillRect(X(m) - (wd * ppm) / 2, 0, wd * ppm, Hd);
        g.globalAlpha = 1;
      };
      // teker izleri
      for (const sd of [1, -1]) for (let k = 0; k < Ty.n; k++) for (const o of [-0.8, 0.8]) {
        const cx = X(sd * (Ty.median / 2 + Ty.laneW * (k + 0.5)) + o); const gr = g.createLinearGradient(cx - 14, 0, cx + 14, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(cx - 14, 0, 28, Hd);
      }
      const Y = '#d8a81c', Wh = '#e4e4e0';
      if (Ty.median > 0) { line(-Ty.median / 2, 0.14, Y); line(Ty.median / 2, 0.14, Y); }
      else { line(-0.13, 0.11, Y); line(0.13, 0.11, Y); }
      for (const sd of [1, -1]) {
        for (let k = 1; k < Ty.n; k++) line(sd * (Ty.median / 2 + Ty.laneW * k), 0.13, Wh, true);
        line(sd * (Ty.median / 2 + Ty.laneW * Ty.n), type === 'city' ? 0.08 : 0.14, Wh);
        if (Ty.city && Ty.n > 1) line(sd * (Ty.median / 2 + Ty.laneW * Ty.n), 0.1, Wh);
      }
      if (Ty.city) speckle(g, Wd, Hd, 5000, 0.3, false);
    }), Ty.city ? [1, 0.5] : null);
  }
  // eski, yamalı şehir asfaltı: yamalar, çatlaklar, zift şeritleri, çukurlar, rögar kapakları
  function oldAsphalt(g, W2, H2, seed) {
    const r = U.rng(seed);
    for (let i = 0; i < 11; i++) { const w = 60 + r() * 260, h = 80 + r() * 360, x = r() * (W2 - w), y = r() * (H2 - h), dk = r() < 0.6; g.fillStyle = dk ? 'rgba(8,8,10,' + (0.22 + r() * 0.2) + ')' : 'rgba(170,168,160,' + (0.07 + r() * 0.09) + ')'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; g.strokeRect(x, y, w, h); }
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { let x = r() * W2, y = r() * H2; g.strokeStyle = 'rgba(0,0,0,' + (0.45 + r() * 0.3) + ')'; g.lineWidth = 1 + r() * 2.2; g.beginPath(); g.moveTo(x, y); const n = 5 + ((r() * 9) | 0), a0 = r() * 6.28; for (let k = 0; k < n; k++) { x += Math.cos(a0 + (r() - 0.5) * 1.6) * (14 + r() * 30); y += Math.sin(a0 + (r() - 0.5) * 1.6) * (14 + r() * 30); g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 9; i++) { let x = r() * W2, y = r() * H2; g.strokeStyle = 'rgba(5,5,6,0.8)'; g.lineWidth = 5 + r() * 3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (r() - 0.5) * 70; y += 40 + r() * 60; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 7; i++) { const x = r() * W2, y = r() * H2, rr = 22 + r() * 34, gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.6, 'rgba(15,14,12,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr, rr * (0.6 + r() * 0.4), r() * 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,115,105,0.25)'; g.lineWidth = 2; g.stroke(); }
    for (let i = 0; i < 3; i++) { const x = W2 * (0.3 + r() * 0.4), y = r() * H2; g.fillStyle = '#26272a'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.strokeStyle = '#4b4c50'; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#3a3b3f'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x - 22, y + k * 9); g.lineTo(x + 22, y + k * 9); g.stroke(); } }
  }
  function plainAsphalt() { return tex(canvas(256, 256, (g) => { g.fillStyle = '#2d2e31'; g.fillRect(0, 0, 256, 256); if (tileImg(g, 'asphalt', 256, 256, 1)) { g.fillStyle = 'rgba(20,21,24,0.28)'; g.fillRect(0, 0, 256, 256); } else { speckle(g, 256, 256, 3000, 0.35, false); speckle(g, 256, 256, 1500, 0.12, true); } })); }

  // şerit geometri: kenar başına iki köşe
  function stripGeo(list, yOff) {
    // list: [{e, i0, i1, half}]
    const pos = [], uv = [], idx = [], nor = [];
    for (const it of list) {
      const e = it.e, base = pos.length / 3;
      for (let i = it.i0; i <= it.i1; i++) {
        const p = e.pts[i], h = it.half;
        pos.push(p.x - p.nx * h, p.y + yOff, p.z - p.nz * h, p.x + p.nx * h, p.y + yOff, p.z + p.nz * h);
        uv.push(0, e.cum[i] / 12, 1, e.cum[i] / 12); nor.push(0, 1, 0, 0, 1, 0);
      }
      for (let i = 0; i < it.i1 - it.i0; i++) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
  }
  // kesit profili süpürme: prof = [[lat, y], ...]
  function sweep(e, i0, i1, prof, latBase, closed) {
    const pos = [], idx = [], np = prof.length;
    for (let i = i0; i <= i1; i++) { const p = e.pts[i]; for (const q of prof) { const l = latBase + q[0]; pos.push(p.x + p.nx * l, p.y + q[1], p.z + p.nz * l); } }
    for (let i = 0; i < i1 - i0; i++) for (let j = 0; j < np - 1; j++) { const a = i * np + j, b = a + np; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  function mergeGeos(gs) { // yalnızca position/normal(/uv) içeren geometrileri birleştir
    return Geo.merge(gs.map((g) => { if (!g.attributes.normal) g.computeVertexNormals(); return { g, m: 'a' }; })).geometry;
  }

  S.build = function (scene, W, opt) {
    S.scene = scene; S.W = W; S.aniso = opt.aniso || 8;
    const root = (S.root = new T.Group()); scene.add(root);
    buildTerrain(root, W); buildRoads(root, W); buildCity(root, W); buildBridge(root, W); buildSignals(root, W); buildProps(root, W); buildWater(root, W); buildSky(scene); if (PC.Props && PC.Props.build) PC.Props.build(root, W, { canvas, tex, itex, Geo });
  };

  // ---------- arazi ----------
  function buildTerrain(root, W) {
    const HG = W.HG, { nx, nz, cell, x0, z0, h } = HG, CH = 80;
    const dt = tex(canvas(256, 256, (g) => { g.fillStyle = '#bdbdbd'; g.fillRect(0, 0, 256, 256); speckle(g, 256, 256, 9000, 0.25, false); speckle(g, 256, 256, 6000, 0.2, true); }));
    const mat = new T.MeshStandardMaterial({ vertexColors: true, map: itex('ground', null, true) || dt, normalMap: itex('ground_n'), roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 6 });
    const col = new T.Color(), c2 = new T.Color();
    const H = (i, j) => h[U.clamp(j, 0, nz) * (nx + 1) + U.clamp(i, 0, nx)];
    for (let cj = 0; cj < nz; cj += CH) for (let ci = 0; ci < nx; ci += CH) {
      const n1 = CH + 1, pos = new Float32Array(n1 * n1 * 3), nor = new Float32Array(n1 * n1 * 3), cl = new Float32Array(n1 * n1 * 3), uv = new Float32Array(n1 * n1 * 2), idx = [];
      let allSea = true;
      for (let j = 0; j <= CH; j++) for (let i = 0; i <= CH; i++) {
        const gi = ci + i, gj = cj + j, x = x0 + gi * cell, z = z0 + gj * cell, y = H(gi, gj), o = (j * n1 + i) * 3;
        if (y > -3) allSea = false;
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
        const dx = (H(gi + 1, gj) - H(gi - 1, gj)) / (2 * cell), dz = (H(gi, gj + 1) - H(gi, gj - 1)) / (2 * cell), l = Math.hypot(dx, 1, dz);
        nor[o] = -dx / l; nor[o + 1] = 1 / l; nor[o + 2] = -dz / l;
        const slope = 1 - 1 / l, n = U.fbm(x / 90, z / 90, 3), sd = W.shoreDist(x, z);
        const inCity = Math.abs(x) < W.GRID_H + 30 && Math.abs(z) < W.GRID_H + 30;
        if (y < 2.6 || sd < 22) col.setRGB(0.76, 0.69, 0.5); // kum
        else if (inCity) col.setRGB(0.42, 0.42, 0.4);
        else { col.setRGB(0.2, 0.34, 0.09); c2.setRGB(0.46, 0.42, 0.18); col.lerp(c2, U.smooth(0.35, 0.65, n)); c2.setRGB(0.12, 0.24, 0.07); col.lerp(c2, U.smooth(0.6, 0.3, U.fbm(x / 300 + 9, z / 300, 2)) * 0.6); }
        if (slope > 0.12 && y > 3) { c2.setRGB(0.45, 0.4, 0.34); col.lerp(c2, U.smooth(0.12, 0.3, slope)); }
        if (y < 0) { c2.setRGB(0.1, 0.22, 0.24); col.lerp(c2, U.smooth(0, -6, y)); }
        cl[o] = col.r; cl[o + 1] = col.g; cl[o + 2] = col.b; uv[(j * n1 + i) * 2] = x / 14; uv[(j * n1 + i) * 2 + 1] = z / 14;
      }
      if (allSea) continue;
      for (let j = 0; j < CH; j++) for (let i = 0; i < CH; i++) { const a = j * n1 + i, b = a + n1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('color', new T.BufferAttribute(cl, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(idx);
      const m = new T.Mesh(g, mat); m.receiveShadow = true; root.add(m);
    }
  }

  // ---------- yollar ----------
  function buildRoads(root, W) {
    const byType = {};
    for (const e of W.edges) (byType[e.type] = byType[e.type] || []).push({ e, i0: 0, i1: e.pts.length - 1, half: e.halfW });
    for (const t in byType) {
      const m = new T.Mesh(stripGeo(byType[t], 0.02), new T.MeshStandardMaterial({ map: roadTex(t), normalMap: itex('asphalt_n', [3, 2.4]), normalScale: new T.Vector2(0.7, 0.7), roughness: 0.8, metalness: 0 }));
      m.receiveShadow = true; root.add(m);
    }
    // banket + bariyer + korkuluk
    const verge = [], barrier = [], rails = [];
    for (const e of W.edges) {
      if (e.city) continue;
      const n = e.pts.length - 1, segs = [];
      if (e.bridge0 >= 0) { segs.push([0, e.bridge0], [e.bridge1, n]); } else segs.push([0, n]);
      for (const sg of segs) for (const sd of [1, -1]) verge.push(sweep(e, sg[0], sg[1], sd > 0 ? [[3.2, -0.42], [0, 0.015]] : [[0, 0.015], [-3.2, -0.42]], sd * e.halfW));
      if (e.barrier) barrier.push(sweep(e, 2, n - 2, [[0.3, 0], [0.11, 0.82], [-0.11, 0.82], [-0.3, 0]], 0));
      if (e.type === 'highway' || e.type === 'coast' || e.type === 'hill') for (const sg of segs) for (const sd of [1, -1]) rails.push(sweep(e, sg[0], sg[1], [[0, 0.42], [0, 0.74]], sd * (e.halfW + 0.5)));
    }
    const vm = new T.Mesh(mergeGeos(verge), new T.MeshStandardMaterial({ color: 0x6d6657, roughness: 1, side: T.DoubleSide })); vm.receiveShadow = true; root.add(vm);
    if (barrier.length) { const bm = new T.Mesh(mergeGeos(barrier), new T.MeshStandardMaterial({ color: 0x9c9c98, roughness: 0.9, side: T.DoubleSide })); bm.castShadow = true; root.add(bm); }
    root.add(new T.Mesh(mergeGeos(rails), new T.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.35, metalness: 0.85, side: T.DoubleSide })));
    // kavşak yüzeyleri
    const pp = [], pi = [], pu = [];
    for (const nd of W.nodes) {
      const cs = [];
      for (const eid of nd.edges) { const e = W.edges[eid], p = e.a === nd.id ? e.pts[0] : e.pts[e.pts.length - 1]; for (const sd of [1, -1]) cs.push([p.x + p.nx * e.halfW * sd, p.z + p.nz * e.halfW * sd]); }
      if (!nd.city) { // şehir dışı kavşak: yol uçlarını ve aradaki boşlukları örten dışbükey zemin
        let mw = 0; for (const eid of nd.edges) { const e = W.edges[eid], p = e.a === nd.id ? e.pts[0] : e.pts[e.pts.length - 1], s = e.a === nd.id ? 1 : -1; mw = Math.max(mw, e.halfW); for (const sd of [1, -1]) cs.push([p.x + p.tx * s * 1.5 + p.nx * (e.halfW + 0.4) * sd, p.z + p.tz * s * 1.5 + p.nz * (e.halfW + 0.4) * sd]); }
        for (let k = 0; k < 20; k++) cs.push([nd.x + Math.cos(k * 0.314) * (mw + 1), nd.z + Math.sin(k * 0.314) * (mw + 1)]);
        cs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
        for (const p of cs) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (let i = cs.length - 1; i >= 0; i--) { const p = cs[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
        lo.pop(); up.pop(); cs.length = 0; for (const p of lo.concat(up)) cs.push(p);
      }
      cs.sort((a, b) => Math.atan2(a[1] - nd.z, a[0] - nd.x) - Math.atan2(b[1] - nd.z, b[0] - nd.x));
      const base = pp.length / 3; pp.push(nd.x, nd.y + (nd.city ? 0.02 : 0.012), nd.z); pu.push(nd.x / 12, nd.z / 12);
      for (const c of cs) { pp.push(c[0], nd.y + (nd.city ? 0.02 : 0.012), c[1]); pu.push(c[0] / 12, c[1] / 12); }
      for (let i = 0; i < cs.length; i++) pi.push(base, base + 1 + ((i + 1) % cs.length), base + 1 + i);
      if (!nd.city) { // dış etek: araziyle arayı kapatır
        const b2 = pp.length / 3, n = cs.length;
        for (const c of cs) { const dx = c[0] - nd.x, dz = c[1] - nd.z, l = Math.hypot(dx, dz) || 1; pp.push(c[0] + (dx / l) * 4, nd.y - 0.5, c[1] + (dz / l) * 4); pu.push(c[0] / 12, c[1] / 12); }
        for (let i = 0; i < n; i++) { const a = base + 1 + i, b = base + 1 + ((i + 1) % n), c = b2 + i, d = b2 + ((i + 1) % n); pi.push(a, b, c, b, d, c); }
      }
    }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.Float32BufferAttribute(pp, 3)); pg.setAttribute('uv', new T.Float32BufferAttribute(pu, 2)); pg.setIndex(pi); pg.computeVertexNormals();
    const pm = new T.Mesh(pg, new T.MeshStandardMaterial({ map: plainAsphalt(), normalMap: itex('asphalt_n', [2.4, 2.4]), normalScale: new T.Vector2(0.7, 0.7), roughness: 0.8 })); pm.receiveShadow = true; root.add(pm);
    // yaya geçitleri + dur çizgileri
    const cw = tex(canvas(512, 256, (g) => {
      g.clearRect(0, 0, 512, 256); g.fillStyle = '#e6e6e2';
      for (let i = 0; i < 16; i++) g.fillRect(i * 32 + 6, 0, 18, 150);
      g.fillRect(256, 196, 256, 22);
    }));
    const cp = [], cu = [], ci = [];
    for (const nd of W.nodes) {
      if (!nd.city) continue;
      for (const eid of nd.edges) {
        const e = W.edges[eid], atA = e.a === nd.id, p = atA ? e.pts[0] : e.pts[e.pts.length - 1], s = atA ? 1 : -1; // s: kenar içine yön
        const hw = e.halfW - (e.type === 'city' || e.type === 'avenue' ? 0 : e.shoulder), b = cp.length / 3;
        // u=0: yaklaşan sürücünün solu
        const ax = -p.nx * s, az = -p.nz * s; // yaklaşan (kavşağa giden) yönün sağı = -n*s ... sol = +n*s
        for (const d of [0.4, 5.4]) { cp.push(p.x + p.tx * s * d - ax * hw, p.y + 0.06, p.z + p.tz * s * d - az * hw, p.x + p.tx * s * d + ax * hw, p.y + 0.06, p.z + p.tz * s * d + az * hw); }
        cu.push(0, 1, 1, 1, 0, 0, 1, 0); ci.push(b, b + 1, b + 2, b + 1, b + 3, b + 2, b, b + 2, b + 1, b + 1, b + 2, b + 3);
      }
    }
    const cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(cp, 3)); cg.setAttribute('uv', new T.Float32BufferAttribute(cu, 2)); cg.setIndex(ci); cg.computeVertexNormals();
    const na = cg.attributes.normal; for (let i = 0; i < na.count; i++) na.setXYZ(i, 0, 1, 0);
    root.add(new T.Mesh(cg, new T.MeshStandardMaterial({ map: cw, transparent: true, alphaTest: 0.4, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })));
  }

  // ---------- şehir ----------
  function facade(style) {
    const cm = itex('fac' + style, [1 / 8, 1 / 8], true);
    if (cm) {
      // gece ışıkları: pürüzlülük haritasındaki cam bölgeleri (koyu) × rastgele "oda" ızgarası
      const em = tex(canvas(512, 512, (g) => {
        const rim = PC.Assets.imgs['fac' + style + '_r']; g.drawImage(rim, 0, 0, 512, 512);
        const d = g.getImageData(0, 0, 512, 512), px = d.data, GX = 24, GY = 16, lit = [];
        let mn = 255, mx = 0; for (let i = 0; i < px.length; i += 16) { if (px[i] < mn) mn = px[i]; if (px[i] > mx) mx = px[i]; }
        const th = mn + (mx - mn) * 0.42;
        for (let i = 0; i < GX * GY; i++) { const r = Math.random(); lit.push(r < 0.3 ? [255, 214, 150, 0.55 + Math.random() * 0.45] : r < 0.36 ? [200, 225, 255, 0.5 + Math.random() * 0.4] : null); }
        for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
          const o = (y * 512 + x) * 4, c = px[o] < th ? lit[Math.floor((y / 512) * GY) * GX + Math.floor((x / 512) * GX)] : null;
          if (c) { px[o] = c[0] * c[3]; px[o + 1] = c[1] * c[3]; px[o + 2] = c[2] * c[3]; } else { px[o] = px[o + 1] = px[o + 2] = 0; }
          px[o + 3] = 255;
        }
        g.putImageData(d, 0, 0);
      }), [1 / 8, 1 / 8]);
      const m = new T.MeshStandardMaterial({ map: cm, normalMap: itex('fac' + style + '_n', [1 / 8, 1 / 8]), normalScale: new T.Vector2(0.9, 0.9), roughnessMap: itex('fac' + style + '_r', [1 / 8, 1 / 8]), roughness: 1, metalness: style === 0 ? 0.35 : 0.05, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, envMapIntensity: 1.2 });
      m.userData.emK = 1.5; S.nightMats.push(m); return m;
    }
    const pal = [['#5f7286', '#16242f'], ['#b9b1a3', '#232a33'], ['#8a5a44', '#1e242b'], ['#dcdad4', '#27313b']][style];
    const rr = U.rng(900 + style);
    const map = tex(canvas(512, 512, (g) => {
      g.fillStyle = pal[0]; g.fillRect(0, 0, 512, 512); speckle(g, 512, 512, 5000, 0.14, false); speckle(g, 512, 512, 2500, 0.08, true);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const x = i * 128, y = j * 128, wx = style === 0 ? x + 3 : x + 22, wy = style === 0 ? y + 5 : y + 24, ww = style === 0 ? 122 : 84, wh = style === 0 ? 118 : 80;
        const gr = g.createLinearGradient(wx, wy, wx + ww * 0.4, wy + wh); gr.addColorStop(0, '#7f9db6'); gr.addColorStop(0.35, '#3e5568'); gr.addColorStop(1, pal[1]);
        g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
        if (rr() < 0.45) { g.fillStyle = 'rgba(225,220,205,' + (0.25 + rr() * 0.4) + ')'; g.fillRect(wx, wy, ww, wh * (0.2 + rr() * 0.5)); }
        g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(wx + ww * 0.15, wy); g.lineTo(wx + ww * 0.4, wy); g.lineTo(wx + ww * 0.1, wy + wh); g.lineTo(wx, wy + wh); g.lineTo(wx, wy + wh * 0.5); g.fill();
        if (style !== 0) { g.strokeStyle = 'rgba(20,22,26,0.85)'; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke(); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(wx - 3, wy + wh, ww + 6, 5); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(wx - 3, wy - 4, ww + 6, 3); }
        else { g.strokeStyle = 'rgba(190,205,215,0.55)'; g.lineWidth = 2; g.strokeRect(wx, wy, ww, wh); }
      }
      if (style === 2) { g.strokeStyle = 'rgba(0,0,0,0.13)'; g.lineWidth = 1; for (let y = 0; y < 512; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } }
    }), [1 / 4, 1 / 4]);
    const em = tex(canvas(512, 512, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { if (Math.random() > 0.42) continue; const w = Math.random(); g.fillStyle = w < 0.6 ? '#ffd9a0' : w < 0.85 ? '#fff2d8' : '#bfe0ff'; g.globalAlpha = 0.5 + Math.random() * 0.5; if (style === 0) g.fillRect(i * 64 + 2, j * 64 + 3, 60, 58); else g.fillRect(i * 64 + 11, j * 64 + 13, 42, 39); }
      g.globalAlpha = 1;
    }), [1 / 8, 1 / 8]);
    const m = new T.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: style === 0 ? 0.22 : 0.85, metalness: style === 0 ? 0.65 : 0 });
    S.nightMats.push(m); return m;
  }
function buildCity(root, W) {
    const st = [[], [], [], []], roofs = [];
    const col = new T.Color();
    for (const b of W.buildings) {
      const r = U.rng(b.seed), tint = 0.82 + r() * 0.28, tr = tint * (0.95 + r() * 0.1), tb = tint * (0.95 + r() * 0.1);
      const g = new T.BufferGeometry(), pos = [], uv = [], cl = [], idx = [], y0 = W.CITY_Y, y1 = y0 + b.h;
      const hw = b.w / 2, hd = b.d / 2, cs = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
      for (let k = 0; k < 4; k++) {
        const a = cs[k], c = cs[(k + 1) % 4], len = Math.hypot(c[0] - a[0], c[1] - a[1]), nu = Math.max(1, Math.round(len / 3.4)), nv = Math.max(1, Math.round(b.h / 3.3)), o = pos.length / 3;
        pos.push(b.x + a[0], y0, b.z + a[1], b.x + c[0], y0, b.z + c[1], b.x + c[0], y1, b.z + c[1], b.x + a[0], y1, b.z + a[1]);
        const u0 = (b.seed % 8) + k * 3; uv.push(u0, 0, u0 + nu, 0, u0 + nu, nv, u0, nv);
        for (let q = 0; q < 4; q++) cl.push(tr, tint, tb);
        idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
      }
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new T.Float32BufferAttribute(cl, 3)); g.setIndex(idx); g.computeVertexNormals();
      st[b.style].push(g);
      roofs.push(Geo.box('a', b.w, 0.6, b.d, b.x, y1 + 0.3, b.z));
      if (b.h > 25) { roofs.push(Geo.box('a', b.w * 0.35, 3, b.d * 0.3, b.x + (r() - 0.5) * b.w * 0.4, y1 + 2, b.z + (r() - 0.5) * b.d * 0.4)); if (b.h > 90) roofs.push(Geo.cyl('a', 0.15, 0.3, 22, b.x, y1 + 12, b.z)); }
    }
    for (let s = 0; s < 4; s++) {
      if (!st[s].length) continue;
      const parts = st[s].map((g) => ({ g, m: 'a' }));
      // renk özniteliğini korumak için elle birleştir
      let nv = 0, ni = 0; for (const p of parts) { nv += p.g.attributes.position.count; ni += p.g.index.count; }
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), cl = new Float32Array(nv * 3), idx = new Uint32Array(ni);
      let vo = 0, io = 0;
      for (const p of parts) { const g = p.g; pos.set(g.attributes.position.array, vo * 3); nor.set(g.attributes.normal.array, vo * 3); uv.set(g.attributes.uv.array, vo * 2); cl.set(g.attributes.color.array, vo * 3); const ia = g.index.array; for (let i = 0; i < ia.length; i++) idx[io + i] = ia[i] + vo; vo += g.attributes.position.count; io += ia.length; }
      const G = new T.BufferGeometry(); G.setAttribute('position', new T.BufferAttribute(pos, 3)); G.setAttribute('normal', new T.BufferAttribute(nor, 3)); G.setAttribute('uv', new T.BufferAttribute(uv, 2)); G.setAttribute('color', new T.BufferAttribute(cl, 3)); G.setIndex(new T.BufferAttribute(idx, 1));
      const m = new T.Mesh(G, facade(s)); m.castShadow = true; m.receiveShadow = true; root.add(m);
    }
    const rm = new T.Mesh(Geo.merge(roofs).geometry, new T.MeshStandardMaterial({ color: 0x3a3b3e, roughness: 0.9 })); rm.castShadow = true; root.add(rm);
    // kaldırım / blok tablaları
    const slabs = [], parks = [];
    for (const b of W.blocks) {
      slabs.push(Geo.box('a', b.x1 - b.x0, 0.5, b.z1 - b.z0, (b.x0 + b.x1) / 2, W.CITY_Y - 0.1, (b.z0 + b.z1) / 2));
      if (b.park) parks.push(Geo.box('a', b.x1 - b.x0 - 10, 0.1, b.z1 - b.z0 - 10, (b.x0 + b.x1) / 2, W.CITY_Y + 0.17, (b.z0 + b.z1) / 2));
    }
    for (const p of W.plazas) slabs.push(Geo.box('a', p.x1 - p.x0, 0.5, p.z1 - p.z0, (p.x0 + p.x1) / 2, W.CITY_Y - 0.1, (p.z0 + p.z1) / 2)); // yaya alanına çevrilmiş sokaklar
    const ct = tex(canvas(128, 128, (g) => { g.fillStyle = '#9a9891'; g.fillRect(0, 0, 128, 128); speckle(g, 128, 128, 900, 0.2, false); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.strokeRect(0.5, 0.5, 127, 127); }));
    const sg = Geo.merge(slabs).geometry; { const p = sg.attributes.position, u = sg.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / 2, p.getZ(i) / 2); }
    const sm = new T.Mesh(sg, new T.MeshStandardMaterial({ map: itex('paving', [0.5, 0.5], true) || ct, normalMap: itex('paving_n', [0.5, 0.5]), roughness: 0.9 })); sm.receiveShadow = true; root.add(sm);
    if (parks.length) { const pgeo = Geo.merge(parks).geometry; { const p = pgeo.attributes.position, u = pgeo.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / 5, p.getZ(i) / 5); }
      const gt = itex('grass', null, true); const pk = new T.Mesh(pgeo, new T.MeshStandardMaterial(gt ? { map: gt, roughness: 1 } : { color: 0x4f7a34, roughness: 1 })); pk.receiveShadow = true; root.add(pk); }
  }

  // ---------- köprü ----------
  function buildBridge(root, W) {
    const e = W.bridgeEdge, i0 = e.bridge0, i1 = e.bridge1, hw = e.halfW;
    const orange = new T.MeshStandardMaterial({ color: 0xb5412a, roughness: 0.6, metalness: 0.2, side: T.DoubleSide });
    const parts = [];
    const deck = sweep(e, i0 - 3, i1 + 3, [[hw + 0.6, 0.0], [hw + 0.6, -0.6], [hw - 1.5, -2.6], [-hw + 1.5, -2.6], [-hw - 0.6, -0.6], [-hw - 0.6, 0.0]], 0);
    parts.push({ g: deck, m: 'a' });
    for (const sd of [1, -1]) { parts.push({ g: sweep(e, i0 - 3, i1 + 3, [[0.12, 0], [0.12, 1.15], [-0.12, 1.15], [-0.12, 0]], sd * (hw + 0.2)), m: 'a' }); }
    const n = i1 - i0, t1 = i0 + Math.round(n * 0.24), t2 = i0 + Math.round(n * 0.76), topH = 78, cabOff = hw + 1.4;
    for (const ti of [t1, t2]) {
      const p = e.pts[ti], ang = -Math.atan2(p.tz, p.tx);
      for (const sd of [1, -1]) parts.push(Geo.box('a', 5, p.y + topH + 30, 3.6, p.x + p.nx * cabOff * sd, (p.y + topH - 30) / 2, p.z + p.nz * cabOff * sd, 0, ang, 0));
      for (const hy of [topH - 3, topH * 0.62, topH * 0.3, -4]) parts.push(Geo.box('a', 4.4, hy < 0 ? 5 : 3.2, cabOff * 2, p.x, p.y + hy, p.z, 0, ang, 0));
    }
    // ana halatlar
    const susp = [];
    for (const sd of [1, -1]) {
      const pts = [];
      for (let i = i0 - 2; i <= i1 + 2; i += 2) {
        const p = e.pts[U.clamp(i, 0, e.pts.length - 1)];
        let hgt;
        if (i <= t1) { const t = U.clamp((i - i0) / (t1 - i0), 0, 1); hgt = 1.5 + (topH - 1.5) * t * t; }
        else if (i >= t2) { const t = U.clamp((i1 - i) / (i1 - t2), 0, 1); hgt = 1.5 + (topH - 1.5) * t * t; }
        else { const t = ((i - t1) / (t2 - t1)) * 2 - 1; hgt = 4 + (topH - 4) * t * t; }
        pts.push(new T.Vector3(p.x + p.nx * cabOff * sd, p.y + hgt, p.z + p.nz * cabOff * sd));
        if ((i - i0) % 4 === 0 && hgt > 2.5 && i > i0 && i < i1) susp.push([p.x + p.nx * cabOff * sd, p.y, p.z + p.nz * cabOff * sd, hgt]);
      }
      parts.push({ g: new T.TubeGeometry(new T.CatmullRomCurve3(pts), pts.length * 2, 0.42, 6, false), m: 'a' });
    }
    const bm = new T.Mesh(Geo.merge(parts).geometry, orange); bm.castShadow = true; bm.receiveShadow = true; root.add(bm);
    const im = new T.InstancedMesh(new T.BoxGeometry(0.14, 1, 0.14), orange, susp.length), mx = new T.Matrix4();
    susp.forEach((s, i) => { mx.makeScale(1, s[3], 1); mx.setPosition(s[0], s[1] + s[3] / 2, s[2]); im.setMatrixAt(i, mx); });
    root.add(im);
  }

  // ---------- trafik ışıkları ----------
  function buildSignals(root, W) {
    const parts = [], lamps = [];
    for (const nd of W.nodes) {
      if (!nd.signal || nd.edges.length < 3) continue;
      const seen = new Set();
      for (const ln of nd.inLanes) {
        if (seen.has(ln.edge.id)) continue; seen.add(ln.edge.id);
        const e = ln.edge, q = ln.pts[ln.pts.length - 1], q0 = ln.pts[ln.pts.length - 2];
        let tx = q.x - q0.x, tz = q.z - q0.z; const l = Math.hypot(tx, tz); tx /= l; tz /= l;
        const rx = -tz, rz = tx; // sağ
        const laneOff = e.median / 2 + e.laneW * (ln.k + 0.5), far = nd.r * 2 + 2.5;
        const cx = q.x - rx * laneOff + tx * far, cz = q.z - rz * laneOff + tz * far; // yol ekseni, kavşağın karşısı
        const px = cx + rx * (e.halfW + 1.2), pz = cz + rz * (e.halfW + 1.2), y = nd.y, ang = -Math.atan2(tz, tx);
        parts.push(Geo.cyl('a', 0.11, 0.15, 6.6, px, y + 3.3, pz, 0, 0, 0, 8));
        const armL = e.halfW + 1.2 - e.median / 2 - e.laneW * 0.5;
        parts.push(Geo.box('a', 0.14, 0.14, armL, px - (rx * armL) / 2, y + 6.4, pz - (rz * armL) / 2, 0, ang, 0));
        for (let k = 0; k < e.n; k++) {
          const off = e.median / 2 + e.laneW * (k + 0.5), hx = cx + rx * off, hz = cz + rz * off;
          parts.push(Geo.box('b', 0.36, 1.25, 0.42, hx, y + 5.75, hz, 0, ang, 0));
          lamps.push({ nd, axis: ln.endAxis, x: hx - tx * 0.19, y: y + 5.75, z: hz - tz * 0.19, ang });
        }
      }
    }
    const mg = Geo.merge(parts);
    root.add(new T.Mesh(mg.geometry, mg.keys.map((k) => new T.MeshStandardMaterial(k === 'a' ? { color: 0x55585c, roughness: 0.5, metalness: 0.7 } : { color: 0x16170f, roughness: 0.7 }))));
    const im = new T.InstancedMesh(new T.CircleGeometry(0.15, 12), new T.MeshBasicMaterial({ toneMapped: false }), lamps.length * 3);
    const mx = new T.Matrix4(), e = new T.Euler(), qt = new T.Quaternion(), v = new T.Vector3(), sc = new T.Vector3(1, 1, 1);
    lamps.forEach((lp, i) => { for (let k = 0; k < 3; k++) { e.set(0, lp.ang - Math.PI / 2, 0); qt.setFromEuler(e); v.set(lp.x, lp.y + 0.38 - k * 0.38, lp.z); mx.compose(v, qt, sc); im.setMatrixAt(i * 3 + k, mx); im.setColorAt(i * 3 + k, new T.Color(0x111111)); } lp.state = -1; });
    im.frustumCulled = false; root.add(im); S.lamps = lamps; S.lampMesh = im;
  }
  const ON = [new T.Color(0.1, 1.6, 0.5), new T.Color(1.8, 1.1, 0.05), new T.Color(2, 0.08, 0.05)], OFF = [new T.Color(0.01, 0.07, 0.03), new T.Color(0.08, 0.05, 0.0), new T.Color(0.09, 0.0, 0.0)];
  S.updateSignals = function () {
    let ch = false;
    S.lamps.forEach((lp, i) => {
      const st = PC.Signals.state(lp.nd, lp.axis); if (st === lp.state) return; lp.state = st; ch = true;
      // sıra: üst kırmızı, orta sarı, alt yeşil
      S.lampMesh.setColorAt(i * 3, st === 2 ? ON[2] : OFF[2]); S.lampMesh.setColorAt(i * 3 + 1, st === 1 ? ON[1] : OFF[1]); S.lampMesh.setColorAt(i * 3 + 2, st === 0 ? ON[0] : OFF[0]);
    });
    if (ch) S.lampMesh.instanceColor.needsUpdate = true;
  };

  // ---------- ağaçlar, lambalar, tabelalar ----------
  function buildProps(root, W) {
    const rnd = U.rng(77), o = {}, mx = new T.Matrix4(), e = new T.Euler(), qt = new T.Quaternion(), v = new T.Vector3(), sc = new T.Vector3();
    const inst = (geo, mat, list, shadow) => {
      const im = new T.InstancedMesh(geo, mat, list.length);
      list.forEach((it, i) => { e.set(0, it[4] || 0, 0); qt.setFromEuler(e); v.set(it[0], it[1], it[2]); sc.set(it[3], it[5] || it[3], it[3]); mx.compose(v, qt, sc); im.setMatrixAt(i, mx); });
      im.castShadow = !!shadow; im.frustumCulled = false; root.add(im); return im;
    };
    // palmiyeler
    const palms = [];
    const cityTrees = [];
    const along = (e2, step, off, sap) => { for (let s = 8; s < e2.len - 8; s += step) { const i = Math.min(e2.pts.length - 1, Math.round((s / e2.len) * (e2.pts.length - 1))), p = e2.pts[i]; for (const sd of [1, -1]) { if (sap) { const s3 = 0.95 + rnd() * 0.35; cityTrees.push([p.x + p.nx * off * sd, p.y + (e2.type === 'city' ? 0.15 : 0), p.z + p.nz * off * sd, s3, rnd() * 6, s3 * (1.0 + rnd() * 0.25)]); } else palms.push([p.x + p.nx * off * sd, p.y, p.z + p.nz * off * sd, 0.8 + rnd() * 0.5, rnd() * 6]); } } };
    for (const e2 of W.edges) {
      if (e2.type === 'city') { if (e2.id % 3 === 0) along(e2, 20, e2.halfW + 1.6, true); }
      else if (e2.type === 'avenue') along(e2, 16, e2.halfW + 1.7, true);
      else if (e2.type === 'blvd') along(e2, 26, e2.halfW + 4, true);
      else if (e2.type === 'coast') along(e2, 34, e2.halfW + 5);
    }
    const trunk = new T.CylinderGeometry(0.16, 0.3, 9, 6); trunk.translate(0, 4.5, 0);
    inst(trunk, new T.MeshStandardMaterial({ color: 0x6b5a45, roughness: 1 }), palms, true);
    const fr = [];
    for (let k = 0; k < 9; k++) { const g = new T.PlaneGeometry(1.1, 4.6, 1, 5), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 2.3) / 4.6; p.setZ(i, -t * t * 1.9); p.setX(i, p.getX(i) * (1 - t * 0.75)); } g.translate(0, 2.3, 0); g.rotateX(Math.PI / 2 - 0.45); g.rotateY((k / 9) * Math.PI * 2); g.translate(0, 9, 0); g.computeVertexNormals(); fr.push({ g, m: 'a' }); }
    inst(Geo.merge(fr).geometry, new T.MeshStandardMaterial({ color: 0x3d6b2a, roughness: 0.9, side: T.DoubleSide }), palms, true);
    // tepe ağaçları
    const trees = [];
    for (let t = 0; t < 16000 && trees.length < 3800; t++) {
      const x = -1100 + rnd() * 3600, z = -2300 + rnd() * 4500;
      if (W.shoreDist(x, z) < 70 || U.fbm(x / 240 + 5, z / 240 + 1, 2) < 0.47) continue;
      if (Math.abs(x) < W.GRID_H + 60 && Math.abs(z) < W.GRID_H + 60) continue;
      W.groundAt(x, z, o); if (o.surf !== 2 || o.y < 6) continue;
      W.groundAt(x + 9, z, o); if (o.surf !== 2) continue; W.groundAt(x - 9, z, o); if (o.surf !== 2) continue; W.groundAt(x, z + 9, o); if (o.surf !== 2) continue; W.groundAt(x, z - 9, o); if (o.surf !== 2) continue;
      const s = 2.2 + rnd() * 2.6; trees.push([x, W.terrainH(x, z) - 0.3, z, s, rnd() * 6, s * (0.9 + rnd() * 0.7)]);
    }
    for (const t of cityTrees) trees.push(t);
    for (const p of W.plazas) { const hz = p.x1 - p.x0 > p.z1 - p.z0, len = hz ? p.x1 - p.x0 : p.z1 - p.z0; for (let d = 8; d < len - 6; d += 14) { const s3 = 1.0 + rnd() * 0.4; trees.push([hz ? p.x0 + d : (p.x0 + p.x1) / 2, W.CITY_Y + 0.15, hz ? (p.z0 + p.z1) / 2 : p.z0 + d, s3, rnd() * 6, s3 * 1.1]); } }
    if (W.villa) for (const t of W.villa.trees) trees.push(t);
    for (const p of W.parks) for (let k = 0; k < 16; k++) { const s2 = 1.8 + rnd() * 1.6; trees.push([p.x + (rnd() - 0.5) * (p.sx - 6), W.CITY_Y + 0.2, p.z + (rnd() - 0.5) * (p.sz - 6), s2, rnd() * 6, s2 * (0.9 + rnd() * 0.5)]); }
    // --- hacimli ağaçlar: gövde + dallar + yumrulu taç kütleleri (saydam kart yok, uzaktan da ağaç gibi görünür) ---
    const folTex = S.foliageTex();
    const mkTree = (seed, kind) => {
      const r = U.rng(seed), tp = [], cl = [];
      const K = [{ top: 2.9, sx: 1.0, sy: 0.92 }, { top: 3.7, sx: 0.92, sy: 1.12 }, { top: 2.6, sx: 1.0, sy: 0.72 }][kind];
      const ring = (n, rad, y, br, a0) => { for (let k = 0; k < n; k++) { const a = a0 + (k / n) * 6.283 + (r() - 0.5) * 0.5, rr = rad * (0.85 + r() * 0.3); cl.push([Math.cos(a) * rr, y + (r() - 0.5) * 0.3, Math.sin(a) * rr, br * (0.88 + r() * 0.24)]); } };
      if (kind === 0) { ring(5, 0.78, K.top - 0.8, 0.78, r() * 6); cl.push([0, K.top, 0, 0.86], [0.1, K.top - 0.6, -0.1, 0.98]); }
      else if (kind === 1) { ring(3, 0.46, K.top - 1.65, 0.64, r() * 6); ring(3, 0.4, K.top - 0.85, 0.68, r() * 6); cl.push([0, K.top, 0, 0.6]); }
      else { ring(6, 1.08, K.top - 0.6, 0.72, r() * 6); cl.push([0, K.top - 0.15, 0, 1.0]); }
      const h = K.top - (kind === 1 ? 1.5 : 0.75);
      const tr = new T.CylinderGeometry(0.06, 0.17, h, 8); tr.translate(0, h / 2, 0); tp.push({ g: tr, m: 'a' });
      for (let k = 0; k < Math.min(5, cl.length - 1); k++) { const c = cl[k], y0 = h * (0.62 + r() * 0.2), dx = c[0], dy = c[1] - y0, dz = c[2], len = Math.hypot(dx, dy, dz), g = new T.CylinderGeometry(0.025, 0.055, len, 5); g.translate(0, len / 2, 0); Geo.xf(g, 0, y0, 0, 0, Math.atan2(dz, dx), Math.acos(U.clamp(dy / len, -1, 1))); tp.push({ g, m: 'a' }); }
      const pos = [], nor = [], uv = [], col = [], ico = new T.IcosahedronGeometry(1, 1), ip = ico.attributes.position;
      let y0 = 1e9, y1 = -1e9; for (const c of cl) { y0 = Math.min(y0, c[1] - c[3] * K.sy * 0.7); y1 = Math.max(y1, c[1] + c[3] * K.sy); }
      const cc = [0, (y0 + y1) / 2, 0], cr = Math.max(1.2, (y1 - y0) * 0.6);
      cl.forEach((c, bi) => {
        const s1 = r() * 9, s2 = r() * 9, s3 = r() * 9;
        for (let i = 0; i < ip.count; i++) {
          let dx = ip.getX(i), dy = ip.getY(i), dz = ip.getZ(i);
          const f = 0.5 + 0.5 * Math.sin(dx * 4.1 + s1) * Math.sin(dy * 3.7 + s2) * Math.sin(dz * 4.3 + s3), rad = c[3] * (0.84 + 0.28 * f);
          if (dy < 0) dy *= 0.7;
          const x = c[0] + dx * rad * K.sx, y = c[1] + dy * rad * K.sy, z = c[2] + dz * rad * K.sx; pos.push(x, y, z);
          const nx = dx * 0.32 + (x - cc[0]) / cr * 0.7, ny = dy * 0.32 + (y - cc[1]) / cr * 0.7 + 0.22, nz = dz * 0.32 + (z - cc[2]) / cr * 0.7, nl = Math.hypot(nx, ny, nz) || 1; nor.push(nx / nl, ny / nl, nz / nl);
          let m = 9; for (let o = 0; o < cl.length; o++) if (o !== bi) { const q = cl[o]; m = Math.min(m, Math.hypot((x - q[0]) / K.sx, (y - q[1]) / K.sy, (z - q[2]) / K.sx) / q[3]); }
          const t = U.clamp((y - y0) / (y1 - y0), 0, 1), sh = (0.5 + 0.5 * t) * (0.4 + 0.6 * U.smooth(0.8, 1.3, m)) * (0.92 + 0.16 * f);
          col.push(sh, sh, sh); uv.push((Math.atan2(dz, dx) / 6.283 + bi * 0.37) * 2.0, (dy * 0.5 + 0.5 + bi * 0.21) * 1.3);
        }
      });
      const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); lg.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); lg.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); lg.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      return [Geo.merge(tp).geometry, lg];
    };
    const barkMat = new T.MeshStandardMaterial({ map: itex('bark', [1, 2], true), normalMap: itex('bark_n', [1, 2]), color: itex('bark') ? 0xb9ada0 : 0x4a3a2c, roughness: 1 });
    const leafMat = new T.MeshStandardMaterial({ map: folTex, bumpMap: folTex, bumpScale: 0.6, vertexColors: true, roughness: 0.9, metalness: 0, color: 0x8b9a74 });
    for (let v = 0; v < 3; v++) {
      const [tg, lg] = mkTree(31 + v * 7, v), cells = {};
      trees.forEach((t, i) => { if (i % 3 === v) { const k = Math.floor(t[0] / 600) + '_' + Math.floor(t[2] / 600); (cells[k] = cells[k] || []).push(t); } });
      for (const k in cells) { // 600 m'lik hücreler: görüş dışındaki ağaçlar çizilmez
        const list = cells[k]; list.sort((a, b) => U.hash2(a[0] * 7.1, a[2] * 5.3) - U.hash2(b[0] * 7.1, b[2] * 5.3)); // sıra karışık: yoğunluk ayarı rastgele bir alt küme bırakır
        const tm = inst(tg, barkMat, list, true), lm = inst(lg, leafMat, list, true);
        const col = new T.Color(); list.forEach((t, i) => { const hh = U.hash2(t[0] * 3.1, t[2] * 2.7); col.setRGB(0.74 + hh * 0.3, 0.84 + U.hash2(t[2], t[0]) * 0.18, 0.62 + hh * 0.22); lm.setColorAt(i, col); });
        for (const im of [tm, lm]) { im.computeBoundingSphere(); im.frustumCulled = true; }
        let mx = 0, mz = 0; for (const t of list) { mx += t[0]; mz += t[2]; } (S.treeCells = S.treeCells || []).push({ ims: [tm, lm], n: list.length, x: mx / list.length, z: mz / list.length });
      }
    }
    buildGrass(root, W);
    // sokak lambaları
    const lampsL = [];
    for (const e2 of W.edges) {
      const step = e2.city ? 40 : e2.type === 'canyon' || e2.type === 'hill' ? 0 : 60; if (!step) continue;
      let flip = 1;
      for (let s = 20; s < e2.len - 10; s += step) { const i = Math.min(e2.pts.length - 1, Math.round((s / e2.len) * (e2.pts.length - 1))), p = e2.pts[i]; const off = (e2.halfW + 0.9) * flip; lampsL.push([p.x + p.nx * off, p.y, p.z + p.nz * off, 1, -Math.atan2(p.tz, p.tx) + (flip > 0 ? Math.PI / 2 : -Math.PI / 2)]); flip = -flip; }
    }
    const lp = Geo.merge([Geo.cyl('a', 0.07, 0.11, 8, 0, 4, 0, 0, 0, 0, 6), Geo.box('a', 2.2, 0.09, 0.09, 1.0, 8, 0), Geo.box('b', 0.7, 0.1, 0.26, 2.0, 7.95, 0)]);
    const bulb = new T.MeshStandardMaterial({ color: 0x333333, emissive: 0xffd9a0, emissiveIntensity: 0 }); S.lampMats.push(bulb);
    { const im = new T.InstancedMesh(lp.geometry, [new T.MeshStandardMaterial({ color: 0x4b4e52, roughness: 0.5, metalness: 0.6 }), bulb], lampsL.length); lampsL.forEach((it, i) => { e.set(0, it[4], 0); qt.setFromEuler(e); v.set(it[0], it[1], it[2]); sc.set(1, 1, 1); mx.compose(v, qt, sc); im.setMatrixAt(i, mx); }); im.frustumCulled = false; root.add(im); }
    S.lampPos = lampsL;
    // hız tabelaları
    const signGeo = {}, signs = {};
    for (const e2 of W.edges) {
      if (e2.type === 'city' && e2.id % 9 !== 0) continue;
      for (const dir of [1, -1]) { const i = dir > 0 ? Math.min(12, e2.pts.length - 1) : Math.max(0, e2.pts.length - 13), p = e2.pts[i]; (signs[e2.limitKmh] = signs[e2.limitKmh] || []).push([p.x + p.nx * (e2.halfW + 1.4) * dir, p.y, p.z + p.nz * (e2.halfW + 1.4) * dir, 1, -Math.atan2(p.tz * dir, p.tx * dir) - Math.PI / 2]); }
    }
    const post = new T.CylinderGeometry(0.04, 0.04, 2.2, 5); post.translate(0, 1.1, 0);
    let allS = []; for (const k in signs) allS = allS.concat(signs[k]);
    inst(post, new T.MeshStandardMaterial({ color: 0x777777, metalness: 0.7, roughness: 0.4 }), allS, false);
    for (const k in signs) {
      const t = tex(canvas(128, 160, (g) => { g.fillStyle = '#f5f5f2'; g.fillRect(0, 0, 128, 160); g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(5, 5, 118, 150); g.fillStyle = '#111'; g.textAlign = 'center'; g.font = 'bold 22px sans-serif'; g.fillText('SPEED', 64, 34); g.fillText('LIMIT', 64, 58); g.font = 'bold 76px sans-serif'; g.fillText(k, 64, 132); }));
      const pg = new T.PlaneGeometry(0.62, 0.78); pg.translate(0, 2.3, 0.05);
      inst(pg, new T.MeshStandardMaterial({ map: t, roughness: 0.6, side: T.DoubleSide }), signs[k], false);
    }
    void signGeo;
  }

  // renk + opaklık JPG'lerinden saydam sprite
  function alphaSprite(cn, an, sx, sy, sw, sh, w, h) {
    const ci = PC.Assets.imgs[cn], ai = PC.Assets.imgs[an]; if (!ci || !ai) return null;
    const c = canvas(w, h, (g) => g.drawImage(ci, sx * ci.width, sy * ci.height, sw * ci.width, sh * ci.height, 0, 0, w, h));
    const a = canvas(w, h, (g) => g.drawImage(ai, sx * ai.width, sy * ai.height, sw * ai.width, sh * ai.height, 0, 0, w, h));
    const g = c.getContext('2d'), d = g.getImageData(0, 0, w, h), ad = a.getContext('2d').getImageData(0, 0, w, h).data;
    for (let i = 0; i < d.data.length; i += 4) d.data[i + 3] = ad[i];
    g.putImageData(d, 0, 0); return c;
  }
  // taç kütleleri için opak, döşenebilir yaprak dokusu (koyu zemin üstünde gerçek yaprak görselleri)
  S.foliageTex = function () {
    const leaves = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]].map((q) => alphaSprite('leaf', 'leaf_a', q[0], q[1], 0.5, 0.5, 96, 96));
    const r = U.rng(11);
    const c = canvas(512, 512, (g) => {
      g.fillStyle = '#1c2f10'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 900; i++) {
        const x = r() * 512, y = r() * 512, sc = 0.5 + r() * 0.55, b = 0.5 + (i / 900) * 0.55 + r() * 0.25, rot = r() * 6.283, li = (r() * 4) | 0;
        for (const ox of [0, -512, 512]) for (const oy of [0, -512, 512]) {
          if (x + ox < -70 || x + ox > 582 || y + oy < -70 || y + oy > 582) continue;
          g.save(); g.translate(x + ox, y + oy); g.rotate(rot); g.scale(sc, sc);
          if (leaves[0]) { g.filter = 'brightness(' + b.toFixed(2) + ')'; g.drawImage(leaves[li], -48, -48); }
          else { g.fillStyle = 'rgb(' + ((40 * b) | 0) + ',' + ((92 * b) | 0) + ',' + ((30 * b) | 0) + ')'; g.beginPath(); g.ellipse(0, 0, 26, 12, 0, 0, 7); g.fill(); }
          g.restore();
        }
      }
    });
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t;
  };
  S.leafCluster = function () {
    const leaves = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]].map((q) => alphaSprite('leaf', 'leaf_a', q[0], q[1], 0.5, 0.5, 128, 128));
    const r = U.rng(5);
    const c = canvas(512, 512, (g) => {
      if (!leaves[0]) { g.fillStyle = '#35561f'; g.beginPath(); g.arc(256, 256, 230, 0, 7); g.fill(); return; }
      for (let i = 0; i < 230; i++) {
        const a = r() * 6.283, d = Math.sqrt(r()) * 205, sc = 0.55 + r() * 0.6, b = 0.55 + r() * 0.5;
        g.save(); g.translate(256 + Math.cos(a) * d, 256 + Math.sin(a) * d); g.rotate(r() * 6.283); g.scale(sc, sc);
        g.filter = 'brightness(' + b.toFixed(2) + ')'; g.drawImage(leaves[(r() * 4) | 0], -64, -64); g.restore();
      }
    });
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  // ---------- ot: kameranın çevresinde dolaşan çapraz kartlar ----------
  const GR = { N: 110, step: 1.7, cx: 1e9, cz: 1e9 };
  function buildGrass(root, W) {
    const blades = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => alphaSprite('blade', 'blade_a', 0.02 + i * 0.105, 0, 0.1, 1, 24, 256));
    if (!blades[0]) return;
    const r = U.rng(9);
    const c = canvas(256, 256, (g) => { for (let i = 0; i < 26; i++) { g.save(); g.translate(40 + r() * 176, 256); g.rotate((r() - 0.5) * 0.9); const h = 120 + r() * 130; g.filter = 'brightness(' + (0.7 + r() * 0.6).toFixed(2) + ')'; g.drawImage(blades[(r() * 8) | 0], -9, -h, 18, h); g.restore(); } });
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    const p1 = new T.PlaneGeometry(1.1, 0.6); p1.translate(0, 0.3, 0); const p2 = p1.clone(); p2.rotateY(Math.PI / 2); const p3 = p1.clone(); p3.rotateY(Math.PI / 4);
    const geo = Geo.merge([{ g: p1, m: 'a' }, { g: p2, m: 'a' }, { g: p3, m: 'a' }]).geometry; { const nr = geo.attributes.normal; for (let i = 0; i < nr.count; i++) nr.setXYZ(i, 0, 1, 0); }
    const mat = new T.MeshStandardMaterial({ map: t, alphaTest: 0.35, side: T.DoubleSide, roughness: 1, color: 0xffffff });
    const im = new T.InstancedMesh(geo, mat, GR.N * GR.N); im.frustumCulled = false; im.count = 0; im.receiveShadow = true; root.add(im);
    GR.mesh = im; GR.W = W;
  }
  const _gm = new T.Matrix4(), _gq = new T.Quaternion(), _gv = new T.Vector3(), _gs = new T.Vector3(), _ge = new T.Euler(), _go = {}, _gc = new T.Color();
  S.updateGrass = function (cam) {
    const im = GR.mesh; if (!im) return;
    const cx = Math.round(cam.position.x / 8) * 8, cz = Math.round(cam.position.z / 8) * 8; if (cx === GR.cx && cz === GR.cz) return;
    GR.cx = cx; GR.cz = cz; const W = GR.W, h = (GR.N * GR.step) / 2; let n = 0;
    for (let i = 0; i < GR.N; i++) for (let j = 0; j < GR.N; j++) {
      const gx = Math.round((cx - h) / GR.step) + i, gz = Math.round((cz - h) / GR.step) + j, a = U.hash2(gx, gz), b = U.hash2(gz * 7 + 3, gx * 5 + 1);
      if (a < 0.04) continue;
      const x = (gx + a - 0.5) * GR.step, z = (gz + b - 0.5) * GR.step, dd = Math.hypot(x - cx, z - cz); if (dd > h) continue;
      W.groundAt(x, z, _go); if (_go.surf !== 2 || _go.y < 3) continue;
      const sc = (0.75 + b * 0.9) * (1 + dd / h * 0.9) * (1 - Math.max(0, dd / h - 0.85) * 6.6 * 0.9);
      _ge.set(0, a * 6.283, 0); _gq.setFromEuler(_ge); _gv.set(x, _go.y - 0.03, z); _gs.set(sc * 1.25, sc, sc * 1.25); _gm.compose(_gv, _gq, _gs); im.setMatrixAt(n, _gm);
      const dry = U.fbm(x / 90, z / 90, 2); _gc.setRGB(1.0 + dry * 0.9, 1.25 + a * 0.3, 0.7 + b * 0.2); im.setColorAt(n, _gc); n++;
    }
    im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  };

  // ---------- kalite ayarları: ağaç yoğunluğu / mesafe, çim, görüş mesafesi ----------
  S.treeSet = { density: 1, dist: 1400 };
  S.setTrees = function (density, dist) {
    S.treeSet.density = density; S.treeSet.dist = dist;
    for (const c of S.treeCells || []) for (const im of c.ims) im.count = Math.max(0, Math.min(c.n, Math.ceil(c.n * density)));
    S._treeT = 0;
  };
  S.updateTrees = function (cam, dt) {
    S._treeT = (S._treeT || 0) - dt; if (S._treeT > 0) return; S._treeT = 0.4;
    const r = S.treeSet.dist + 420, r2 = r * r;
    for (const c of S.treeCells || []) { const dx = c.x - cam.position.x, dz = c.z - cam.position.z, v = S.treeSet.density > 0 && dx * dx + dz * dz < r2; for (const im of c.ims) if (im.visible !== v) im.visible = v; }
  };
  S.setGrass = function (level) { // 0 kapalı, 1 düşük, 2 orta, 3 yüksek
    S.grassLevel = level; if (!GR.mesh) return; GR.mesh.visible = level > 0; GR.N = [0, 60, 86, 110][level] || 110; GR.cx = 1e9;
  };
  S.setDist = function (d) { if (S.scene && S.scene.fog) { S.scene.fog.near = d * 0.1; S.scene.fog.far = d; } };

  // ---------- su ----------
  function buildWater(root, W) {
    const nc = canvas(256, 256, (g, w, h) => {
      const d = g.createImageData(w, h), hh = (x, y) => U.fbm(x / 22, y / 22, 3) + 0.5 * Math.sin((x / w) * Math.PI * 8 + U.noise2(x / 30, y / 30) * 3);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = hh(x + 1, y) - hh(x - 1, y), dy = hh(x, y + 1) - hh(x, y - 1), o = (y * w + x) * 4; d.data[o] = 128 + dx * 420; d.data[o + 1] = 128 + dy * 420; d.data[o + 2] = 255; d.data[o + 3] = 255; }
      g.putImageData(d, 0, 0);
    });
    const nt = new T.CanvasTexture(nc); nt.wrapS = nt.wrapT = T.RepeatWrapping; nt.repeat.set(260, 260);
    // kıyı haritası: su derinliği (0 = kıyı, 1 = 10 m ve üzeri) -> sığlıkta turkuaz renk + köpük
    const SN = 512, X0 = -2600, Z0 = -3400, SW = 6000, SH = 6600, sd = new Uint8Array(SN * SN * 4);
    for (let j = 0; j < SN; j++) for (let i = 0; i < SN; i++) { const d = U.clamp((W.SEA - W.terrainH(X0 + (i + 0.5) / SN * SW, Z0 + (j + 0.5) / SN * SH)) / 10, 0, 1) * 255, o = (j * SN + i) * 4; sd[o] = sd[o + 1] = sd[o + 2] = d; sd[o + 3] = 255; }
    const st = new T.DataTexture(sd, SN, SN, T.RGBAFormat); st.magFilter = st.minFilter = T.LinearFilter; st.needsUpdate = true;
    const mat = new T.MeshStandardMaterial({ color: 0x0a3442, roughness: 0.1, metalness: 0.7, normalMap: nt, normalScale: new T.Vector2(0.7, 0.7), envMapIntensity: 1.35 });
    const uni = S.waterUni = { uQ: { value: 1 }, uT: { value: 0 }, uShore: { value: st }, uExt: { value: new T.Vector4(X0, Z0, 1 / SW, 1 / SH) } };
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform float uT; uniform float uQ; uniform sampler2D uShore; uniform vec4 uExt; float wFoam = 0.0;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec2 wu = vWp.xz;
          float dep = texture2D(uShore, (wu - uExt.xy) * uExt.zw).r;
          float wdist = length(vViewPosition);
          // büyük ölçekli renk lekeleri (akıntı / derinlik), yakında kayan ince doku
          float big = texture2D(normalMap, wu * 0.0021 + uT * 0.0008).r * 0.6 + texture2D(normalMap, wu * 0.0007 - uT * 0.0004).g * 0.4;
          diffuseColor.rgb *= 0.72 + big * 0.62;
          diffuseColor.rgb = mix(vec3(0.05, 0.36, 0.36), diffuseColor.rgb, smoothstep(0.0, 0.5, dep));
          float fn = texture2D(normalMap, wu * 0.06 + vec2(uT * 0.018, uT * 0.006)).r * 0.55 + texture2D(normalMap, wu * 0.21 - vec2(uT * 0.011, uT * 0.027)).g * 0.45;
          float band = 0.5 + 0.5 * sin(dep * 46.0 - uT * 0.9 + fn * 5.0);
          wFoam = smoothstep(0.13, 0.015, dep) * smoothstep(0.5, 0.78, fn + band * 0.3 + (0.07 - dep) * 2.4) * step(0.004, dep) * 0.9;
          // açık denizde seyrek köpük çizgileri
          wFoam = max(wFoam, smoothstep(0.71, 0.78, fn * 0.6 + big * 0.5) * 0.55 * smoothstep(900.0, 60.0, wdist));
          wFoam *= uQ;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 0.95), wFoam);`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.85, wFoam);')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - wFoam;')
        .replace('#include <normal_fragment_maps>', `
          vec3 n1 = texture2D(normalMap, wu * 0.045 + vec2(uT * 0.013, uT * 0.008)).xyz * 2.0 - 1.0;
          vec3 n2 = texture2D(normalMap, wu * 0.0105 - vec2(uT * 0.006, -uT * 0.004)).xyz * 2.0 - 1.0;
          vec3 n3 = texture2D(normalMap, wu * 0.19 + vec2(-uT * 0.031, uT * 0.022)).xyz * 2.0 - 1.0;
          float nf = 1.0 / (1.0 + wdist * 0.006);
          vec3 mapN = normalize(vec3((n1.xy * 0.55 + n2.xy * 0.95 + n3.xy * 0.4 * nf) * normalScale * (0.35 + 0.65 * nf + 0.25), 1.0));
          normal = normalize(tbn * mapN);`);
    };    const m = new T.Mesh(new T.PlaneGeometry(16000, 16000), mat); m.rotation.x = -Math.PI / 2; m.position.set(0, PC.World.SEA, 0); m.receiveShadow = false; root.add(m);
    S.water = m; S.waterTex = nt;
  }

  // ---------- gökyüzü / ışık ----------
  function buildSky(scene) {
    const mat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new T.Color() }, hor: { value: new T.Color() }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunCol: { value: new T.Color() }, night: { value: 0 }, time: { value: 0 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }',
      fragmentShader: `varying vec3 vD; uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float night; uniform float time;
        float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
        float ns(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
        void main(){ vec3 d = normalize(vD); float y = max(d.y, 0.0);
          vec3 c = mix(hor, top, pow(y, 0.45));
          float sd = max(dot(d, sunDir), 0.0);
          c += sunCol * (pow(sd, 900.0) * 6.0 + pow(sd, 12.0) * 0.28 + pow(sd, 3.0) * 0.1 * (1.0 - y));
          if (d.y > 0.0) { vec2 uv = d.xz / (d.y + 0.12) * 1.6 + time * 0.004; float cl = ns(uv) * 0.55 + ns(uv * 2.3) * 0.3 + ns(uv * 5.1) * 0.15; cl = smoothstep(0.52, 0.8, cl) * smoothstep(0.0, 0.25, d.y);
            c = mix(c, mix(hor * 1.15 + sunCol * 0.25, vec3(1.0) * (1.0 - night * 0.93), 0.6), cl * 0.75);
            vec2 sp = d.xz / (d.y + 0.3) * 190.0; float st = step(0.9975, h21(floor(sp))); c += vec3(st) * night * (1.0 - cl) * 0.9; }
          else c = mix(hor, hor * 0.6, min(1.0, -d.y * 4.0));
          gl_FragColor = vec4(c, 1.0); }`,
    });
    const sky = new T.Mesh(new T.SphereGeometry(100, 32, 16), mat); sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);
    S.sky = sky; S.skyMat = mat;
    S.sun = new T.DirectionalLight(0xffffff, 3); S.sun.castShadow = true; scene.add(S.sun); scene.add(S.sun.target);
    const sh = S.sun.shadow; sh.mapSize.set(2048, 2048); sh.camera.left = -55; sh.camera.right = 55; sh.camera.top = 55; sh.camera.bottom = -55; sh.camera.near = 10; sh.camera.far = 700; sh.bias = -0.0003; sh.normalBias = 0.06; sh.radius = 2.2;
    S.hemi = new T.HemisphereLight(0xbfd6ff, 0x55503f, 1); scene.add(S.hemi);
    scene.fog = new T.Fog(0xaabbcc, 200, 3200);
  }
  const _c1 = new T.Color(), _c2 = new T.Color();
  S.night = 0; S.sunDir = new T.Vector3(0.3, 0.8, 0.3);
  // saat: 0..24
  S.setTime = function (h) {
    S.hour = h;
    const ang = ((h - 6) / 12) * Math.PI, el = Math.sin(ang), az = ((h - 12) / 12) * Math.PI * 0.9 - 0.6;
    const elev = el * 1.05; // rad benzeri
    const up = Math.sin(U.clamp(elev, -1.2, 1.2)), flat = Math.cos(U.clamp(elev, -1.2, 1.2));
    const nf = (S.night = U.smooth(0.1, -0.12, up)), low = U.smooth(0.45, 0.0, Math.abs(up)) * (1 - nf * 0.6);
    const dir = S.sunDir; dir.set(Math.sin(az) * flat, up, -Math.cos(az) * flat);
    const u = S.skyMat.uniforms;
    _c1.setRGB(0.18, 0.4, 0.82); _c2.setRGB(0.012, 0.016, 0.04); u.top.value.copy(_c1).lerp(_c2, nf);
    _c1.setRGB(0.66, 0.79, 0.93); _c2.setRGB(1.0, 0.56, 0.3); _c1.lerp(_c2, low); _c2.setRGB(0.03, 0.04, 0.075); u.hor.value.copy(_c1).lerp(_c2, nf);
    _c1.setRGB(1, 0.96, 0.88); _c2.setRGB(1, 0.5, 0.2); u.sunCol.value.copy(_c1).lerp(_c2, low).multiplyScalar(1 - nf);
    u.night.value = nf;
    if (up > -0.05) { u.sunDir.value.copy(dir); S.lightDir = dir.clone(); if (S.lightDir.y < 0.06) { S.lightDir.y = 0.06; S.lightDir.normalize(); } S.sun.color.copy(u.sunCol.value); S.sun.intensity = 3.4 * U.smooth(-0.05, 0.25, up) + 0.05; }
    else { S.lightDir = new T.Vector3(-dir.x, Math.max(0.35, -dir.y), -dir.z).normalize(); u.sunDir.value.copy(S.lightDir); u.sunCol.value.setRGB(0.5, 0.56, 0.7); S.sun.color.setRGB(0.55, 0.65, 1); S.sun.intensity = 0.22; }
    S.hemi.intensity = U.lerp(1.15, 0.16, nf); S.hemi.color.copy(u.top.value).lerp(_c1.setRGB(1, 1, 1), 0.55); S.hemi.groundColor.setRGB(0.33, 0.31, 0.25).multiplyScalar(1 - nf * 0.8);
    S.scene.fog.color.copy(u.hor.value).multiplyScalar(0.96);
    for (const m of S.nightMats) m.emissiveIntensity = nf * (m.userData.emK || 1.3);
    for (const m of S.lampMats) m.emissiveIntensity = nf * 5;
    S.envDirty = true;
  };
  S.update = function (dt, cam, focus) {
    S.sky.position.copy(cam.position); S.skyMat.uniforms.time.value += dt;
    S.updateGrass(cam); S.updateTrees(cam, dt);
    if (S.waterUni) S.waterUni.uT.value += dt;
    // gölge kamerası oyuncuyu izler (doku ızgarasına oturtulmuş)
    const q = (S.shadowSpan || 110) / S.sun.shadow.mapSize.x * 4, fx = Math.round(focus.x / q) * q, fz = Math.round(focus.z / q) * q;
    S.sun.target.position.set(fx, focus.y, fz); S.sun.position.set(fx + S.lightDir.x * 300, focus.y + S.lightDir.y * 300, fz + S.lightDir.z * 300);
    S.updateSignals();
  };
  // gökyüzünden ortam haritası üret (yansımalar için)
  S.makeEnv = function (renderer) {
    if (!S.pmrem) { S.pmrem = new T.PMREMGenerator(renderer); S.envScene = new T.Scene(); const s2 = new T.Mesh(S.sky.geometry, S.skyMat); S.envScene.add(s2); const gnd = new T.Mesh(new T.CircleGeometry(90, 16), new T.MeshBasicMaterial({ color: 0x555148 })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -4; S.envGnd = gnd; S.envScene.add(gnd); }
    S.envGnd.material.color.setRGB(0.3, 0.29, 0.26).multiplyScalar(1 - S.night * 0.85);
    if (S.envRT) S.envRT.dispose();
    S.envRT = S.pmrem.fromScene(S.envScene, 0, 1, 500);
    S.scene.environment = S.envRT.texture; S.envDirty = false;
  };
})();
