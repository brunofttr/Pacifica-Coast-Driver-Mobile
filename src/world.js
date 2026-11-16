// Pacifica Coast — dünya mantığı: arazi, yol ağı, şeritler, zemin sorgusu (three.js'siz)
(function () {
  'use strict';
  const PC = window.PC, U = PC.U;
  const W = (PC.World = {});
  const CITY_Y = 8, GRID_N = 9, GRID_S = 100, GRID_H = 400;
  W.SEA = 0; W.CITY_Y = CITY_Y; W.GRID_H = GRID_H; W.GRID_S = GRID_S; W.GRID_N = GRID_N;

  const TYPES = (W.TYPES = {
    city: { n: 1, laneW: 3.5, median: 0, shoulder: 2.5, speed: 50, parking: true, city: true },
    avenue: { n: 2, laneW: 3.3, median: 0.4, shoulder: 2.4, speed: 50, parking: true, city: true },
    blvd: { n: 2, laneW: 3.5, median: 0.6, shoulder: 1.5, speed: 70 },
    bridge: { n: 2, laneW: 3.6, median: 0.8, shoulder: 1.2, speed: 100, barrier: true },
    highway: { n: 2, laneW: 3.7, median: 1.0, shoulder: 2.8, speed: 120, barrier: true },
    coast: { n: 1, laneW: 3.6, median: 0, shoulder: 1.4, speed: 80 },
    hill: { n: 1, laneW: 3.5, median: 0, shoulder: 1.2, speed: 70 },
    canyon: { n: 1, laneW: 3.4, median: 0, shoulder: 1.0, speed: 60 },
  });

  // ---------- arazi ----------
  function coastX(z) { return -900 + 120 * Math.sin(z / 500) + 60 * Math.sin(z / 170 + 1); }
  function bayDist(x, z) { const bw = 330 - 430 * U.smooth(300, 1000, x); return Math.abs(z + 1000) - bw; }
  function shoreDist(x, z) { return Math.min(x - coastX(z), bayDist(x, z)); }
  function baseH(x, z) {
    const d = shoreDist(x, z);
    if (d < 0) return Math.max(-25, d * 0.12) - 0.5;
    const r = Math.hypot(x, z);
    const mask = U.smooth(620, 1300, r) * U.smooth(40, 420, d);
    const n = U.fbm(x / 700 + 3.1, z / 700 + 7.7, 4);
    const ridge = U.fbm(x / 260 + 11, z / 260 + 5, 3);
    let h = CITY_Y * U.smooth(0, 70, d) + mask * (n * n * 150 + ridge * 18);
    h += U.smooth(1900, 2800, x) * 120 * (0.5 + n);
    return h;
  }
  W.baseH = baseH; W.shoreDist = shoreDist; W.coastX = coastX;

  // ---------- yardımcılar ----------
  function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function splineXZ(ctrl) {
    const out = [];
    const n = ctrl.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(n - 1, i + 2)];
      const sub = 48;
      for (let k = 0; k < sub; k++) {
        const t = k / sub;
        out.push([catmull(p0[0], p1[0], p2[0], p3[0], t), catmull(p0[1], p1[1], p2[1], p3[1], t)]);
      }
    }
    out.push(ctrl[n - 1].slice());
    return out;
  }
  function resample(poly, s0, s1, ds) {
    const cum = [0];
    for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
    const L = cum[cum.length - 1];
    const a = s0, b = L - s1;
    const cnt = Math.max(2, Math.round((b - a) / ds) + 1);
    const out = [];
    let j = 0;
    for (let i = 0; i < cnt; i++) {
      const s = a + ((b - a) * i) / (cnt - 1);
      while (j < cum.length - 2 && cum[j + 1] < s) j++;
      const t = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
      out.push({ x: U.lerp(poly[j][0], poly[j + 1][0], t), y: 0, z: U.lerp(poly[j][1], poly[j + 1][1], t) });
    }
    return out;
  }
  function cumLen(pts) {
    const c = [0];
    for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
    return c;
  }

  // ---------- kurulum ----------
  W.build = function () {
    const nodes = (W.nodes = []), edges = (W.edges = []), lanes = (W.lanes = []);
    const rnd = U.rng(20261110);

    function addNode(x, z, o) {
      o = o || {};
      const n = { id: nodes.length, x, z, y: o.y !== undefined ? o.y : CITY_Y, r: o.r || 10, edges: [], inLanes: [], outLanes: [], signal: !!o.signal, city: !!o.city, occ: null, occT: 0 };
      nodes.push(n); return n;
    }
    function addEdge(a, b, type, ctrl, o) {
      const T = TYPES[type];
      const poly = splineXZ([[a.x, a.z]].concat(ctrl || [], [[b.x, b.z]]));
      const pts = resample(poly, a.r, b.r, 4);
      const e = {
        id: edges.length, a: a.id, b: b.id, type, pts, n: T.n, laneW: T.laneW, median: T.median, shoulder: T.shoulder,
        halfW: T.median / 2 + T.n * T.laneW + T.shoulder, speed: T.speed / 3.6, limitKmh: T.speed, parking: !!T.parking,
        bridge0: -1, bridge1: -1, lanes: [], opt: o || {}, barrier: !!T.barrier, city: !!T.city,
      };
      e.cum = cumLen(pts); e.len = e.cum[e.cum.length - 1];
      edges.push(e); a.edges.push(e.id); b.edges.push(e.id);
      return e;
    }

    // şehir planı: aralıkları eşit olmayan sokaklar + bazı sokak parçaları yaya alanına çevrilmiş (T kavşaklar, büyük adalar)
    const GX = (W.GX = [-400, -300, -200, -110, 0, 80, 190, 300, 400]), GZ = (W.GZ = [-400, -320, -200, -90, 0, 110, 200, 310, 400]), M2 = (GRID_N - 1) / 2;
    const grid = [];
    for (let i = 0; i < GRID_N; i++) {
      grid.push([]);
      for (let j = 0; j < GRID_N; j++) grid[i].push(addNode(GX[i], GZ[j], { signal: true, city: true, r: 10 }));
    }
    const segs = [], deg = new Map();
    for (let i = 0; i < GRID_N; i++) for (let j = 0; j < GRID_N; j++) {
      if (i < GRID_N - 1) segs.push({ a: grid[i][j], b: grid[i + 1][j], h: true, keep: j === 0 || j === GRID_N - 1 || j === M2, type: 'city' });
      if (j < GRID_N - 1) segs.push({ a: grid[i][j], b: grid[i][j + 1], h: false, keep: i === 0 || i === GRID_N - 1 || i === M2, type: i === M2 ? 'avenue' : 'city' });
    }
    for (const sg of segs) { deg.set(sg.a, (deg.get(sg.a) || 0) + 1); deg.set(sg.b, (deg.get(sg.b) || 0) + 1); }
    const order = segs.filter((sg) => !sg.keep).map((sg) => [rnd(), sg]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    W.plazas = []; let removed = 0;
    for (const sg of order) {
      if (removed >= 22) break;
      if (deg.get(sg.a) < 4 || deg.get(sg.b) < 4) continue; // her kavşak en çok bir kolunu kaybeder
      sg.gone = true; removed++; deg.set(sg.a, 3); deg.set(sg.b, 3);
      W.plazas.push(sg.h ? { x0: sg.a.x + 6, x1: sg.b.x - 6, z0: sg.a.z - 6, z1: sg.a.z + 6 } : { x0: sg.a.x - 6, x1: sg.a.x + 6, z0: sg.a.z + 6, z1: sg.b.z - 6 });
    }
    for (const sg of segs) if (!sg.gone) addEdge(sg.a, sg.b, sg.type);
    const mid = (GRID_N - 1) / 2;
    const cN = grid[mid][0], cS = grid[mid][GRID_N - 1], cW = grid[0][mid], cE = grid[GRID_N - 1][mid];

    function areaY(x, z, lo, hi) {
      let s = 0, c = 0;
      for (let dx = -80; dx <= 80; dx += 40) for (let dz = -80; dz <= 80; dz += 40) { s += baseH(x + dx, z + dz); c++; }
      return U.clamp(s / c, lo, hi);
    }
    const BN = addNode(0, -1700, { r: 15, y: areaY(0, -1700, 8, 22) });
    const HJ = addNode(1500, 500, { r: 16, y: areaY(1500, 500, 8, 60) });
    const SJ = addNode(0, 1750, { r: 14, y: areaY(0, 1750, 8, 75) });

    const eBridge = addEdge(cN, BN, 'bridge', []);
    addEdge(BN, HJ, 'highway', [[500, -1850], [1100, -1750], [1600, -1300], [1750, -600], [1700, 0]]);
    addEdge(HJ, cE, 'blvd', [[1100, 380], [700, 80], [520, 0]]);
    const coastCtrl = [[-560, 0], [-700, 40]];
    for (let z = 250; z <= 1400; z += 230) coastCtrl.push([coastX(z) + 115, z]);
    coastCtrl.push([-600, 1640], [-300, 1740]);
    addEdge(cW, SJ, 'coast', coastCtrl);
    addEdge(SJ, HJ, 'hill', [[450, 1720], [950, 1400], [1330, 930]]);
    addEdge(cS, SJ, 'canyon', [[0, 540], [95, 780], [-70, 1010], [85, 1260], [0, 1520]]);

    // köprü aralığı (z = -540 .. -1460)
    for (let i = 0; i < eBridge.pts.length; i++) {
      const z = eBridge.pts[i].z;
      if (z <= -540 && eBridge.bridge0 < 0) eBridge.bridge0 = i;
      if (z >= -1460) eBridge.bridge1 = i;
    }
    W.bridgeEdge = eBridge;

    // yükseklik profilleri
    for (const e of edges) {
      const P = e.pts, n = P.length, A = nodes[e.a], B = nodes[e.b];
      if (e.city) { for (const p of P) p.y = CITY_Y; continue; }
      let y = new Float64Array(n);
      for (let i = 0; i < n; i++) y[i] = Math.max(4, baseH(P[i].x, P[i].z));
      const R = e.type === 'highway' ? 34 : e.type === 'canyon' ? 14 : 22;
      for (let pass = 0; pass < 3; pass++) {
        const pre = new Float64Array(n + 1);
        for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + y[i];
        const y2 = new Float64Array(n);
        for (let i = 0; i < n; i++) { const a = Math.max(0, i - R), b = Math.min(n - 1, i + R); y2[i] = (pre[b + 1] - pre[a]) / (b - a + 1); }
        y = y2;
      }
      for (let i = 0; i < n; i++) {
        const s = e.cum[i];
        y[i] = U.lerp(A.y, y[i], U.smooth(0, 90, s));
        y[i] = U.lerp(B.y, y[i], U.smooth(0, 90, e.len - s));
      }
      if (e === eBridge) {
        const s0 = e.cum[e.bridge0], s1 = e.cum[e.bridge1];
        for (let i = 0; i < n; i++) {
          const s = e.cum[i];
          if (s >= s0 && s <= s1) { const t = (s - s0) / (s1 - s0); y[i] = 9.5 + 22 * (1 - Math.cos(2 * Math.PI * t)) / 2; }
          else { const dOut = s < s0 ? s0 - s : s - s1; y[i] = U.lerp(9.5, y[i], U.smooth(0, 140, dOut)); }
        }
      }
      const g = (e.type === 'highway' ? 0.06 : 0.09) * 4;
      for (let pass = 0; pass < 2; pass++) {
        y[0] = A.y; y[n - 1] = B.y;
        for (let i = 1; i < n; i++) y[i] = U.clamp(y[i], y[i - 1] - g, y[i - 1] + g);
        y[n - 1] = B.y;
        for (let i = n - 2; i >= 0; i--) y[i] = U.clamp(y[i], y[i + 1] - g, y[i + 1] + g);
      }
      for (let i = 0; i < n; i++) P[i].y = y[i];
    }

    // nokta normalleri + şeritler
    for (const e of edges) {
      const P = e.pts, n = P.length;
      for (let i = 0; i < n; i++) {
        const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
        const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
        P[i].tx = dx / l; P[i].tz = dz / l; P[i].nx = -dz / l; P[i].nz = dx / l; // n = sağ
      }
      for (const dir of [1, -1]) for (let k = 0; k < e.n; k++) {
        const off = e.median / 2 + e.laneW * (k + 0.5);
        const pts = [];
        for (let i = 0; i < n; i++) {
          const p = P[dir > 0 ? i : n - 1 - i];
          pts.push({ x: p.x + p.nx * off * dir, y: p.y, z: p.z + p.nz * off * dir });
        }
        const cum = cumLen(pts);
        const ln = { id: lanes.length, edge: e, dir, k, pts, cum, len: cum[cum.length - 1], from: nodes[dir > 0 ? e.a : e.b], to: nodes[dir > 0 ? e.b : e.a], speed: e.speed };
        const q = pts[pts.length - 1], q0 = pts[pts.length - 2];
        ln.endAxis = Math.abs(q.x - q0.x) > Math.abs(q.z - q0.z) ? 1 : 0;
        lanes.push(ln); e.lanes.push(ln); ln.from.outLanes.push(ln); ln.to.inLanes.push(ln);
      }
    }

    buildHash();
    buildHeightGrid();
    buildCity(rnd);
    if (PC.Props && PC.Props.world) PC.Props.world(W);
    W.spawn = { x: grid[mid][mid + 1].x + 1.75, z: grid[mid][mid + 1].z + 40, heading: -Math.PI / 2 };
    return W;
  };

  // ---------- uzamsal indeks ----------
  const CELL = 24;
  let hash = null;
  function hkey(cx, cz) { return (cx + 2048) * 4096 + (cz + 2048); }
  function buildHash() {
    hash = new Map();
    for (const e of W.edges) for (let i = 0; i < e.pts.length; i++) {
      const p = e.pts[i], k = hkey(Math.floor(p.x / CELL), Math.floor(p.z / CELL));
      let a = hash.get(k); if (!a) hash.set(k, (a = []));
      a.push(e.id * 65536 + i);
    }
  }

  // ---------- yükseklik ızgarası ----------
  const HG = (W.HG = { x0: -1900, z0: -2450, cell: 10, nx: 480, nz: 480, h: null });
  function buildHeightGrid() {
    const { x0, z0, cell, nx, nz } = HG;
    const h = (HG.h = new Float32Array((nx + 1) * (nz + 1)));
    const BC = 100, bh = new Map();
    const put = (x, z, y, w) => {
      const k = hkey(Math.floor(x / BC), Math.floor(z / BC));
      let a = bh.get(k); if (!a) bh.set(k, (a = []));
      a.push(x, z, y, w);
    };
    for (const e of W.edges) for (let i = 0; i < e.pts.length; i++) {
      if (e.bridge0 >= 0 && i > e.bridge0 + 2 && i < e.bridge1 - 2) continue;
      const p = e.pts[i]; put(p.x, p.z, p.y, e.halfW + (e.city ? 0 : 3));
    }
    for (const n of W.nodes) put(n.x, n.z, n.y, n.r + 4);
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = x0 + i * cell, z = z0 + j * cell;
      let b = baseH(x, z);
      const cx = Math.floor(x / BC), cz = Math.floor(z / BC);
      let wsum = 0, ysum = 0, tmin = 1, ylow = 1e9;
      for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
        const arr = bh.get(hkey(cx + a, cz + c)); if (!arr) continue;
        for (let q = 0; q < arr.length; q += 4) {
          const d = Math.hypot(arr[q] - x, arr[q + 1] - z) - arr[q + 3] - 13;
          if (d > 80) continue;
          const t = U.smooth(0, 80, d);
          const w = 1 / (0.5 + Math.max(0, d)); const ww = w * w * w;
          wsum += ww; ysum += ww * arr[q + 2]; if (d < 8 && arr[q + 2] < ylow) ylow = arr[q + 2];
          if (t < tmin) tmin = t;
        }
      }
      if (wsum > 0) b = U.lerp(Math.min(ysum / wsum, ylow) - 0.3, b, tmin);
      h[j * (nx + 1) + i] = b;
    }
  }
  W.terrainH = function (x, z) {
    const { x0, z0, cell, nx, nz, h } = HG;
    let fx = (x - x0) / cell, fz = (z - z0) / cell;
    if (fx < 0 || fz < 0 || fx >= nx || fz >= nz) return baseH(x, z);
    const i = Math.floor(fx), j = Math.floor(fz); fx -= i; fz -= j;
    const k = j * (nx + 1) + i;
    const a = h[k], b = h[k + 1], c = h[k + nx + 1], d = h[k + nx + 2];
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  };

  // ---------- zemin sorgusu ----------
  // o: {y, surf(0 asfalt,1 banket,2 çim,3 su,4 kaldırım), edge, lat, s, bridge}
  function projSeg(e, i, x, z, o) {
    const a = e.pts[i], b = e.pts[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
    let t = ((x - a.x) * dx + (z - a.z) * dz) / l2; t = U.clamp(t, 0, 1);
    const px = a.x + dx * t, pz = a.z + dz * t;
    const l = Math.sqrt(l2);
    o.lat = ((x - px) * -dz + (z - pz) * dx) / l;
    o.dist = Math.hypot(x - px, z - pz);
    o.y = a.y + (b.y - a.y) * t; o.s = e.cum[i] + l * t; o.i = i; o.t = t;
  }
  const _a = {}, _b = {};
  W.groundAt = function (x, z, o) {
    o.edge = null; o.bridge = false; o.lat = 0; o.node = null;
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    let best = -1, bd = 1e12;
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
      const arr = hash.get(hkey(cx + a, cz + c)); if (!arr) continue;
      for (let q = 0; q < arr.length; q++) {
        const code = arr[q], p = W.edges[(code / 65536) | 0].pts[code & 65535];
        const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
        if (d < bd) { bd = d; best = code; }
      }
    }
    // kavşak alanı
    if (best >= 0 || true) {
      const N = W.nodes;
      for (let q = 0; q < N.length; q++) {
        const n = N[q], dx = n.x - x, dz = n.z - z;
        if (dx > 40 || dx < -40 || dz > 40 || dz < -40) continue;
        if (dx * dx + dz * dz < (n.r + 1.5) * (n.r + 1.5)) { o.y = n.y; o.surf = 0; o.node = n; return o; }
      }
    }
    if (best >= 0) {
      const e = W.edges[(best / 65536) | 0], i = best & 65535, last = e.pts.length - 2;
      let r = _a;
      projSeg(e, Math.min(i, last), x, z, _a);
      if (i > 0) { projSeg(e, i - 1, x, z, _b); if (_b.dist < _a.dist) r = _b; }
      const al = Math.abs(r.lat), d = r.dist;
      const onBridge = e.bridge0 >= 0 && r.i >= e.bridge0 && r.i < e.bridge1;
      if (d <= e.halfW) { o.y = r.y; o.surf = 0; o.edge = e; o.lat = r.lat; o.s = r.s; o.i = r.i; o.bridge = onBridge; return o; }
      if (onBridge && d <= e.halfW + 2.5) { o.y = r.y; o.surf = 0; o.edge = e; o.lat = r.lat; o.s = r.s; o.i = r.i; o.bridge = true; return o; }
      if (!onBridge && !e.city && d <= e.halfW + 3) { o.y = r.y - (al - e.halfW) * 0.1; o.surf = 1; o.edge = e; o.lat = r.lat; o.s = r.s; o.i = r.i; return o; }
    }
    for (let q = 0; q < W.pads.length; q++) { const pd = W.pads[q]; if (x > pd.x0 && x < pd.x1 && z > pd.z0 && z < pd.z1) { o.y = pd.y; o.surf = pd.surf; return o; } }
    const y = W.terrainH(x, z);
    if (x > -GRID_H - 8 && x < GRID_H + 8 && z > -GRID_H - 8 && z < GRID_H + 8) { o.y = CITY_Y + 0.15; o.surf = 4; return o; }
    o.y = y; o.surf = y < W.SEA + 0.2 ? 3 : 2;
    return o;
  };

  // En yakın şerit noktası (kurtarma / sıfırlama için)
  W.nearestLane = function (x, z, hx, hz) {
    let be = null, bi = 0, bd = 1e12;
    for (const e of W.edges) for (let i = 0; i < e.pts.length; i += 2) {
      const p = e.pts[i], d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
      if (d < bd) { bd = d; be = e; bi = i; }
    }
    const p = be.pts[bi];
    const dir = (hx || 0) * p.tx + (hz || 0) * p.tz >= 0 ? 1 : -1;
    const ln = be.lanes.find((l) => l.dir === dir && l.k === be.n - 1);
    const idx = dir > 0 ? bi : be.pts.length - 1 - bi;
    const q = ln.pts[U.clamp(idx, 0, ln.pts.length - 2)];
    return { lane: ln, idx, x: q.x, y: q.y, z: q.z, heading: Math.atan2(p.tz * dir, p.tx * dir), edge: be, dist: Math.sqrt(bd) };
  };

  // ---------- şerit bağlantıları ----------
  const connCache = new Map();
  W.turnOf = function (lin, lout) {
    const a = lin.pts[lin.pts.length - 2], b = lin.pts[lin.pts.length - 1], c = lout.pts[0], d = lout.pts[1];
    const ang = U.angDiff(Math.atan2(d.z - c.z, d.x - c.x), Math.atan2(b.z - a.z, b.x - a.x));
    return ang > 0.45 ? 1 : ang < -0.45 ? -1 : 0; // +1 sağ, -1 sol (z güneye baktığı için)
  };
  W.connector = function (lin, lout) {
    const key = lin.id * 4096 + lout.id;
    let c = connCache.get(key); if (c) return c;
    const a0 = lin.pts[lin.pts.length - 2], a = lin.pts[lin.pts.length - 1], b = lout.pts[0], b1 = lout.pts[1];
    let d1x = a.x - a0.x, d1z = a.z - a0.z, l = Math.hypot(d1x, d1z); d1x /= l; d1z /= l;
    let d2x = b1.x - b.x, d2z = b1.z - b.z; l = Math.hypot(d2x, d2z); d2x /= l; d2z /= l;
    const den = d1x * d2z - d1z * d2x;
    let cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2;
    if (Math.abs(den) > 0.2) {
      const t = ((b.x - a.x) * d2z - (b.z - a.z) * d2x) / den;
      if (t > 0 && t < 60) { cx = a.x + d1x * t; cz = a.z + d1z * t; }
    }
    const pts = [], N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      pts.push({ x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: U.lerp(a.y, b.y, t), z: u * u * a.z + 2 * u * t * cz + t * t * b.z });
    }
    const cum = cumLen(pts);
    c = { conn: true, pts, cum, len: cum[cum.length - 1], node: lin.to, turn: W.turnOf(lin, lout), speed: Math.min(lin.speed, lout.speed), from: lin, to: lout };
    connCache.set(key, c);
    return c;
  };
  // Bir şeritten çıkış seçenekleri: [{lane, turn}]
  W.exitsOf = function (lin) {
    if (lin.exits) return lin.exits;
    const node = lin.to, res = [], byEdge = new Map();
    for (const lo of node.outLanes) {
      if (lo.edge === lin.edge) continue;
      let a = byEdge.get(lo.edge.id); if (!a) byEdge.set(lo.edge.id, (a = []));
      a.push(lo);
    }
    byEdge.forEach((arr) => {
      const turn = W.turnOf(lin, arr[0]);
      const nOut = arr.length, nIn = lin.edge.n;
      let k;
      if (nOut === nIn) k = lin.k; else if (nOut < nIn) k = Math.min(lin.k, nOut - 1);
      else k = turn > 0 ? nOut - 1 : turn < 0 ? 0 : -1;
      if (k < 0) arr.forEach((lo) => res.push({ lane: lo, turn }));
      else res.push({ lane: arr.find((lo) => lo.k === k), turn });
    });
    if (!res.length) { const back = node.outLanes.find((lo) => lo.edge === lin.edge && lo.k === lin.k); res.push({ lane: back, turn: -1 }); }
    return (lin.exits = res);
  };

  // ---------- şehir: binalar, park yerleri ----------
  function buildCity(rnd) {
    const B = (W.buildings = []), parks = (W.parks = []), blocks = (W.blocks = []), bg = (W.bgrid = new Map());
    const GX = W.GX, GZ = W.GZ, M2 = (GRID_N - 1) / 2, hwAt = (k) => (k === M2 ? 9.4 : 6);
    const reg = (b) => { for (let cx = Math.floor((b.x - b.w / 2) / 60); cx <= Math.floor((b.x + b.w / 2) / 60); cx++) for (let cz = Math.floor((b.z - b.d / 2) / 60); cz <= Math.floor((b.z + b.d / 2) / 60); cz++) { const k = hkey(cx, cz); let a = bg.get(k); if (!a) bg.set(k, (a = [])); a.push(b); } };
    for (let bi = 0; bi < GRID_N - 1; bi++) for (let bj = 0; bj < GRID_N - 1; bj++) {
      const blk = { x0: GX[bi] + hwAt(bi), x1: GX[bi + 1] - 6, z0: GZ[bj] + 6, z1: GZ[bj + 1] - 6, park: false };
      if (bi + 1 === M2) blk.x1 = GX[bi + 1] - 9.4;
      blocks.push(blk);
      const cx = (blk.x0 + blk.x1) / 2, cz = (blk.z0 + blk.z1) / 2, bw = blk.x1 - blk.x0, bd = blk.z1 - blk.z0;
      const dist = Math.hypot(cx, cz), f = 1 - U.smooth(120, 420, dist);
      if (f < 0.75 && rnd() < 0.13) { blk.park = true; parks.push({ x: cx, z: cz, sx: bw - 10, sz: bd - 10 }); continue; }
      const lw0 = bw - 12, ld0 = bd - 12, r = rnd();
      let nx = Math.max(1, Math.round(lw0 / 40)), nz = Math.max(1, Math.round(ld0 / 40));
      if (f > 0.55 && r < 0.3 && lw0 < 95 && ld0 < 95) { nx = 1; nz = 1; } else if (r < 0.5) { if (rnd() < 0.5) nx = Math.max(1, nx - 1); else nz = Math.max(1, nz - 1); } else if (f < 0.35 && r > 0.8) nx++;
      const lw = lw0 / nx, ld = ld0 / nz;
      for (let a = 0; a < nx; a++) for (let c = 0; c < nz; c++) {
        const gap = 1 + rnd() * 2.5, w = lw - gap * 2, d = ld - gap * 2;
        let h;
        if (f > 0.55) h = 30 + Math.pow(rnd(), 1.6) * 130 * f; else if (f > 0.2) h = 12 + rnd() * 30; else h = 6 + rnd() * 9;
        const b = { x: cx - lw0 / 2 + lw * (a + 0.5), z: cz - ld0 / 2 + ld * (c + 0.5), w, d, h, style: (rnd() * 4) | 0, seed: (rnd() * 1e6) | 0 };
        B.push(b); reg(b);
      }
    }
    // park yerleri
    const slots = (W.parkSlots = []);
    for (const e of W.edges) {
      if (!e.parking) continue;
      const a = e.pts[0], b = e.pts[e.pts.length - 1];
      const dx = (b.x - a.x) / e.len, dz = (b.z - a.z) / e.len;
      for (const side of [1, -1]) for (let s = 9; s < e.len - 9; s += 6.4) {
        if (U.hash2((a.x + s * dx) * 7 + side * 31, (a.z + s * dz) * 7) > 0.42) continue;
        const off = (e.halfW - 1.15) * side;
        slots.push({ x: a.x + dx * s - dz * off, y: CITY_Y, z: a.z + dz * s + dx * off, heading: Math.atan2(dz * side, dx * side), seed: (U.hash2(s * 13 + e.id, side * 77 + e.id * 3) * 1e6) | 0 });
      }
    }
  }
  // Daireyi binalardan dışarı iter; düzeltme yapıldıysa true
  W.pads = []; W.extra = [];
  function hitBox(b, x, z, r, out) {
    const qx = U.clamp(x, b.x - b.w / 2, b.x + b.w / 2), qz = U.clamp(z, b.z - b.d / 2, b.z + b.d / 2);
    let dx = x - qx, dz = z - qz; const d = Math.hypot(dx, dz);
    if (d >= r) return false;
    if (d < 1e-4) { const ex = b.w / 2 - Math.abs(x - b.x), ez = b.d / 2 - Math.abs(z - b.z); if (ex < ez) { out.x = b.x + U.sign(x - b.x) * (b.w / 2 + r); out.nx = U.sign(x - b.x); out.nz = 0; } else { out.z = b.z + U.sign(z - b.z) * (b.d / 2 + r); out.nx = 0; out.nz = U.sign(z - b.z); } }
    else { dx /= d; dz /= d; out.x = qx + dx * r; out.z = qz + dz * r; out.nx = dx; out.nz = dz; }
    out.hit = true; return true;
  }
  W.collide = function (x, z, r, out) {
    out.x = x; out.z = z; out.hit = false;
    for (let q = 0; q < W.extra.length; q++) { const b = W.extra[q]; if (b.on !== false && Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + r && hitBox(b, x, z, r, out)) return true; }
    if (x < -GRID_H || x > GRID_H || z < -GRID_H || z > GRID_H) return false;
    const list = W.bgrid.get(hkey(Math.floor(x / 60), Math.floor(z / 60))); if (!list) return false;
    for (const b of list) {
      const qx = U.clamp(x, b.x - b.w / 2, b.x + b.w / 2), qz = U.clamp(z, b.z - b.d / 2, b.z + b.d / 2);
      let dx = x - qx, dz = z - qz; const d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d < 1e-4) { // içeride: en yakın kenara
        const ex = b.w / 2 - Math.abs(x - b.x), ez = b.d / 2 - Math.abs(z - b.z);
        if (ex < ez) { out.x = b.x + U.sign(x - b.x) * (b.w / 2 + r); out.nx = U.sign(x - b.x); out.nz = 0; }
        else { out.z = b.z + U.sign(z - b.z) * (b.d / 2 + r); out.nx = 0; out.nz = U.sign(z - b.z); }
      } else { dx /= d; dz /= d; out.x = qx + dx * r; out.z = qz + dz * r; out.nx = dx; out.nz = dz; }
      out.hit = true; return true;
    }
    return false;
  };
})();
