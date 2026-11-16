// Pacifica Coast — villa + garaj (otomatik kapılar), şehir mobilyaları (durak, taksi, hidrant, ara yaya geçidi), ışınlanma noktaları
(function () {
  'use strict';
  const PC = window.PC, U = PC.U;
  const P = (PC.Props = {});

  // ================= dünya mantığı (three.js'siz) =================
  P.world = function (W) {
    const Y = W.CITY_Y + 0.05;
    const V = (W.villa = {
      x0: -292, x1: -208, z0: 410, z1: 476, y: Y,
      gate: { x: -250, z: 410, w: 8, open: 0 }, door: { x: -232, z: 446, w: 11, h: 3.4, open: 0 },
      gar: { x0: -244, x1: -220, z0: 446, z1: 462, h: 4.6 }, house: { x: -276, z: 458, w: 26, d: 22 }, trees: [],
    });
    W.pads.push({ x0: -264, x1: -211, z0: 405.4, z1: 446.3, y: Y, surf: 0 }, { x0: V.gar.x0 + 0.3, x1: V.gar.x1 - 0.3, z0: 446, z1: V.gar.z1 - 0.3, y: Y, surf: 0 });
    const B = (x, z, w, d, h) => { const b = { x, z, w, d, h: h || 1.8, on: true }; W.extra.push(b); return b; };
    V.walls = [B(-273, 410, 38, 0.5), B(-227, 410, 38, 0.5), B(-292, 443, 0.5, 66), B(-208, 443, 0.5, 66), B(-250, 476, 84, 0.5)];
    V.garWalls = [B(-244, 454, 0.5, 16, 4.6), B(-220, 454, 0.5, 16, 4.6), B(-232, 462, 24, 0.5, 4.6), B(-240.75, 446, 6.5, 0.5, 4.6), B(-223.25, 446, 6.5, 0.5, 4.6)];
    V.door.box = B(-232, 446, 11, 0.4, 3.4); V.gate.box = B(-250, 410, 8, 0.4, 1.7);
    V.houseBox = B(V.house.x, V.house.z, V.house.w, V.house.d, 6.6);
    const r = U.rng(606);
    for (const t of [[-286, 416], [-279, 414], [-270, 417], [-287, 430], [-268, 434], [-213, 418], [-212, 436], [-286, 473], [-262, 473], [-240, 470], [-214, 470]]) { const s = 1.0 + r() * 0.7; V.trees.push([t[0], Y - 0.1, t[1], s, r() * 6, s * (1 + r() * 0.3)]); }
    // ışınlanma noktaları
    W.teleports = [
      { name: 'Ev / Garaj', x: -232, z: 431, heading: Math.PI / 2 },
      { name: 'Şehir merkezi', lane: [1.75, 140, 0, -1] },
      { name: 'Asma köprü', lane: [4, -520, 0, -1] },
      { name: 'Tepe yolu manzarası', lane: [500, 1700, 1, 0] },
    ];
    // şehir mobilyaları
    const F = (W.furn = { bus: [], taxi: [], hyd: [], xwalk: [] });
    for (const e of W.edges) {
      if (!e.city) continue;
      const n = e.pts.length, at = (s, side, off) => { const p0 = e.pts[n >> 1]; if (Math.max(Math.abs(p0.x + p0.nx * 8 * side), Math.abs(p0.z + p0.nz * 8 * side)) > W.GRID_H) side = -side; /* şehir kenarında: kaldırımlı iç taraf */ const p = e.pts[Math.min(n - 1, Math.max(0, Math.round((s / e.len) * (n - 1))))]; return { x: p.x + p.nx * off * side, z: p.z + p.nz * off * side, y: W.CITY_Y, tx: p.tx, tz: p.tz, nx: p.nx, nz: p.nz, side, e, px: p.x, pz: p.z }; };
      F.hyd.push(at(17 + (e.id % 5) * 4, e.id % 2 ? 1 : -1, e.halfW + 0.7));
      if (e.id % 11 === 3) F.bus.push(at(e.len / 2, e.id % 2 ? 1 : -1, e.halfW + 1.9));
      else if (e.id % 17 === 5) F.taxi.push(at(e.len / 2, e.id % 2 ? -1 : 1, e.halfW + 1.2));
      else if (e.id % 7 === 2) F.xwalk.push(at(e.len / 2, 1, 0));
    }
    // durak / taksi / villa girişi önünde park yeri olmasın
    const clear = F.bus.concat(F.taxi).map((s) => [s.px + s.nx * (s.e.halfW - 1.15) * s.side, s.pz + s.nz * (s.e.halfW - 1.15) * s.side, 13]).concat([[-250, 404.85, 9]]);
    W.parkSlots = W.parkSlots.filter((s) => !clear.some((c) => Math.hypot(s.x - c[0], s.z - c[1]) < c[2]));
  };
  P.teleport = function (W, veh, i) {
    const t = W.teleports[i]; if (!t) return;
    if (t.lane) { const n = W.nearestLane(t.lane[0], t.lane[1], t.lane[2], t.lane[3]); veh.reset(n.x, n.y, n.z, n.heading); }
    else { const o = {}; W.groundAt(t.x, t.z, o); veh.reset(t.x, o.y, t.z, t.heading); }
  };
  // otomatik kapılar: mantık (görsel varsa onu da oynatır)
  P.update = function (dt, veh, W) {
    const V = W.villa; if (!V) return;
    const px = veh.x, pz = veh.z, sp = Math.abs(veh.vx);
    if (Math.abs(px + 250) > 120 || Math.abs(pz - 440) > 120) return;
    const mv = (o, tgt, rate) => { o.open += U.clamp(tgt - o.open, -rate * dt, rate * dt); };
    mv(V.gate, Math.hypot(px - V.gate.x, pz - V.gate.z) < 18 ? 1 : 0, 0.6);
    V.gate.box.on = V.gate.open < 0.85;
    const inside = px > V.gar.x0 && px < V.gar.x1 && pz > V.door.z + 0.4 && pz < V.gar.z1, straddle = Math.abs(pz - V.door.z) < 3.4 && Math.abs(px - V.door.x) < 6.5;
    const tgt = straddle ? 1 : inside ? (sp > 0.5 ? 1 : 0) : Math.hypot(px - V.door.x, pz - V.door.z) < 17 && pz < V.door.z ? 1 : 0;
    mv(V.door, tgt, 0.45);
    V.door.box.on = V.door.open < 0.9;
    if (P.vis) P.vis();
  };

  // ================= görseller =================
  P.build = function (root, W, H) {
    const T = THREE, Geo = H.Geo, S = PC.Scenery, V = W.villa, Y = V.y, parts = [];
    const M = {
      stucco: new T.MeshStandardMaterial({ color: 0xece6da, roughness: 0.92 }), stone: new T.MeshStandardMaterial({ color: 0x8d877b, roughness: 0.95 }),
      wood: new T.MeshStandardMaterial({ color: 0x8a5c36, roughness: 0.7 }), dark: new T.MeshStandardMaterial({ color: 0x24262a, roughness: 0.5, metalness: 0.6 }),
      conc: new T.MeshStandardMaterial({ color: 0x777a7d, roughness: 0.35, metalness: 0.05 }), hedge: new T.MeshStandardMaterial({ color: 0x2f5a26, roughness: 1 }),
      glass: new T.MeshStandardMaterial({ color: 0x1c2a30, roughness: 0.08, metalness: 0.7, emissive: 0xffc27a, emissiveIntensity: 0 }),
      pool: new T.MeshStandardMaterial({ color: 0x2aa9cc, roughness: 0.08, metalness: 0.2, emissive: 0x1a8fb5, emissiveIntensity: 0.25 }),
      lamp: new T.MeshStandardMaterial({ color: 0x555555, emissive: 0xffd9a0, emissiveIntensity: 0 }), red: new T.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.5, metalness: 0.3 }),
      strip: new T.MeshBasicMaterial({ color: 0xfff0d6, toneMapped: false }), yellow: new T.MeshStandardMaterial({ color: 0xd9b21c, roughness: 0.7 }), white: new T.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.6 }),
      rubber: new T.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.95 }),
    };
    M.glass.userData.emK = 2.4; S.nightMats.push(M.glass); S.lampMats.push(M.lamp);
    const box = (m, w, h, d, x, y, z, ry) => parts.push(Geo.box(m, w, h, d, x, Y + y, z, 0, ry || 0, 0));
    // --- çevre duvarı + çit ---
    for (const b of V.walls) { box('stone', b.w, 1.8, b.d, b.x, 0.9, b.z); box('stucco', b.w + 0.12, 0.1, b.d + 0.12, b.x, 1.85, b.z); }
    for (const x of [-254.3, -245.7]) { box('stone', 0.9, 2.3, 0.9, x, 1.15, 410); box('lamp', 0.36, 0.3, 0.36, x, 2.45, 410); }
    for (let z = 414; z < 474; z += 3) box('hedge', 1.1, 1.3 + (z % 2) * 0.15, 2.9, -290.9, 0.65, z + 1.5);
    for (let x = -288; x < -212; x += 3) if (x < -246 || x > -218) box('hedge', 2.9, 1.2, 1.0, x + 1.5, 0.6, 474.9);
    // --- garaj ---
    const G = V.gar, gh = G.h;
    for (const b of V.garWalls) box('stucco', b.w + (b.d > 1 ? 0 : 0.0), gh, b.d, b.x, gh / 2, b.z);
    box('stucco', 11.2, gh - 3.4, 0.5, -232, 3.4 + (gh - 3.4) / 2, 446);              // kapı üstü
    box('dark', 25.6, 0.3, 17.6, -232, gh + 0.15, 454);                                 // çatı
    box('wood', 25, 0.22, 2.4, -232, gh - 0.4, 444.7);                                  // ahşap saçak
    for (const x of [-238, -232, -226]) { parts.push(Geo.box('strip', 0.3, 0.05, 9, x, Y + gh - 0.05, 454)); }
    for (const x of [-236, -228]) box('yellow', 0.12, 0.012, 10, x, 0.012, 454.5);     // park çizgileri
    box('wood', 9, 0.9, 0.8, -232, 0.45, 461.3); box('dark', 9, 0.06, 0.9, -232, 0.93, 461.3);   // tezgâh
    box('red', 1.2, 0.9, 0.6, -242.6, 0.45, 460.6); box('red', 1.2, 0.5, 0.6, -242.6, 1.2, 460.6); // takım dolabı
    for (let k = 0; k < 4; k++) parts.push(Geo.cyl('rubber', 0.34, 0.34, 0.24, -221.4, Y + 0.12 + k * 0.25, 460.6, 0, 0, 0, 14));
    for (let k = 0; k < 3; k++) box('dark', 0.05, 1.6, 2.2, -243.7, 1.6 + 0.0, 449 + k * 3.4);   // duvar rafları
    // --- ev ---
    const hx = V.house.x, hz = V.house.z;
    box('stucco', 26, 3.3, 22, hx, 1.65, hz); box('dark', 27.2, 0.25, 23.2, hx, 3.42, hz);
    box('wood', 17, 3.0, 13, hx + 3, 5.05, hz - 3.5); box('dark', 18.4, 0.25, 14.4, hx + 3, 6.68, hz - 3.5);
    box('glass', 9, 2.5, 0.12, hx + 6, 1.5, hz - 11.06); box('glass', 6, 2.5, 0.12, hx - 6.5, 1.5, hz - 11.06);   // alt kat camları (avluya bakar)
    box('glass', 13, 2.3, 0.12, hx + 3, 5.1, hz - 10.06); box('glass', 0.12, 2.3, 8, hx + 11.56, 5.1, hz - 3.5);
    box('wood', 1.3, 2.4, 0.14, hx - 0.6, 1.2, hz - 11.07); box('dark', 0.08, 0.3, 0.1, hx - 0.15, 1.2, hz - 11.16);       // giriş kapısı
    box('wood', 26, 0.25, 6.5, hx, 0.125, hz - 14.2);                                                                      // veranda
    box('dark', 27, 0.2, 7, hx, 3.1, hz - 14.2); for (const x of [hx - 12.6, hx, hx + 12.6]) box('dark', 0.2, 3, 0.2, x, 1.5, hz - 17.4); // pergola
    for (const x of [hx - 8, hx - 5]) { box('wood', 0.7, 0.4, 1.9, x, 0.45, hz - 15); box('white', 0.66, 0.1, 1.85, x, 0.7, hz - 15); }     // şezlonglar
    box('wood', 1.6, 0.42, 1.0, hx + 6, 0.45, hz - 14.5); box('white', 2.2, 0.5, 0.9, hx + 6, 0.5, hz - 16.2);                       // masa + kanepe
    // --- avlu: ortada çeşme, saksılar, banklar, basketbol potası ---
    parts.push(Geo.cyl('stone', 2.6, 2.8, 0.5, -252, Y + 0.25, 428, 0, 0, 0, 20)); parts.push(Geo.cyl('pool', 2.3, 2.3, 0.06, -252, Y + 0.5, 428, 0, 0, 0, 20)); parts.push(Geo.cyl('stone', 0.35, 0.5, 1.3, -252, Y + 0.65, 428, 0, 0, 0, 10)); parts.push(Geo.cyl('stone', 0.9, 0.3, 0.18, -252, Y + 1.35, 428, 0, 0, 0, 14));
    for (const p of [[-262.6, 418], [-262.6, 440], [-212.6, 422], [-212.6, 440], [-246.5, 444.6], [-217.5, 444.6]]) { box('wood', 1.3, 0.7, 1.3, p[0], 0.35, p[1]); parts.push(Geo.ell('hedge', 0.75, 0.85, 0.75, p[0], Y + 1.25, p[1], 10)); }
    for (const z of [420, 436]) { box('wood', 0.5, 0.07, 2.0, -213.4, 0.48, z + 5); box('dark', 0.06, 0.48, 1.8, -213.4, 0.24, z + 5); box('wood', 0.07, 0.5, 2.0, -213.1, 0.75, z + 5); }
    box('dark', 0.12, 3.2, 0.12, -262.8, 1.6, 429); box('white', 0.06, 1.1, 1.8, -262.2, 3.3, 429); parts.push(Geo.tor('red', 0.23, 0.02, -261.8, Y + 3.0, 429, Math.PI / 2, 0, 0, 14));
    // --- havuz ---
    box('stone', 11, 0.3, 6, -278, 0.1, 424); parts.push(Geo.box('pool', 9.8, 0.06, 4.8, -278, Y + 0.24, 424));
    // --- bahçe lambaları + yol taşları ---
    for (const p of [[-262, 414], [-262, 428], [-262, 442], [-214, 414], [-214, 428], [-214, 442], [-284, 420], [-272, 432]]) { parts.push(Geo.cyl('dark', 0.05, 0.07, 1.0, p[0], Y + 0.5, p[1], 0, 0, 0, 6)); parts.push(Geo.ell('lamp', 0.16, 0.16, 0.16, p[0], Y + 1.08, p[1], 8)); }
    for (let k = 0; k < 7; k++) box('stone', 1.1, 0.05, 0.7, -262.6 - k * 1.3, 0.03, 436 + Math.sin(k) * 0.4, 0.2);
    const mg = Geo.merge(parts), mesh = new T.Mesh(mg.geometry, mg.keys.map((k) => M[k])); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
    // --- zeminler: taş avlu, garaj betonu, çim ---
    const plane = (x0, x1, z0, z1, y, mat, rep) => { const g = new T.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, Y + y, (z0 + z1) / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / rep, uv.getY(i) * (z1 - z0) / rep); const m = new T.Mesh(g, mat); m.receiveShadow = true; root.add(m); return m; };
    const pv = H.itex('paving', [1, 1], true), gr = H.itex('grass', [1, 1], true);
    plane(-264, -211, 405.4, 446.3, 0.0, new T.MeshStandardMaterial(pv ? { map: pv, normalMap: H.itex('paving_n', [1, 1]), roughness: 0.85, color: 0xd9d2c4 } : { color: 0x9a968c, roughness: 0.9 }), 3.5);
    plane(G.x0, G.x1, 446, G.z1, 0.0, M.conc, 4);
    plane(-291.7, -264, 410.3, 475.7, -0.03, new T.MeshStandardMaterial(gr ? { map: gr, roughness: 1, color: 0xb9c9a6 } : { color: 0x3f6b2c, roughness: 1 }), 5);
    plane(-264, -208.3, 462.3, 475.7, -0.03, new T.MeshStandardMaterial(gr ? { map: gr, roughness: 1, color: 0xb9c9a6 } : { color: 0x3f6b2c, roughness: 1 }), 5);
    // --- kapılar ---
    const rib = H.tex(H.canvas(64, 256, (g) => { for (let i = 0; i < 8; i++) { const gr2 = g.createLinearGradient(0, i * 32, 0, i * 32 + 32); gr2.addColorStop(0, '#5a5d62'); gr2.addColorStop(0.85, '#3d4045'); gr2.addColorStop(1, '#17181a'); g.fillStyle = gr2; g.fillRect(0, i * 32, 64, 32); } }), [4, 1]);
    const door = new T.Mesh(new T.BoxGeometry(11, 3.4, 0.14), new T.MeshStandardMaterial({ map: rib, roughness: 0.45, metalness: 0.6 })); door.position.set(V.door.x, Y + 1.7, V.door.z); door.castShadow = true; root.add(door);
    const gp = []; for (let k = 0; k < 9; k++) gp.push(Geo.box('a', 0.06, 1.5, 0.06, -1.8 + k * 0.45, 0.85, 0)); gp.push(Geo.box('a', 4.0, 0.1, 0.1, 0, 0.12, 0), Geo.box('a', 4.0, 0.1, 0.1, 0, 1.6, 0));
    const gg = Geo.merge(gp).geometry, gateL = new T.Mesh(gg, M.dark), gateR = new T.Mesh(gg, M.dark); root.add(gateL); root.add(gateR);
    const gl = new T.PointLight(0xffe2b8, 0, 26, 1.4); gl.position.set(-232, Y + gh - 0.5, 454); root.add(gl);
    P.vis = function () {
      door.position.y = Y + 1.7 + V.door.open * 3.25; door.scale.y = 1 - V.door.open * 0.72; door.position.y = Y + 3.4 - (3.4 * door.scale.y) / 2;
      gateL.position.set(V.gate.x - 2 - V.gate.open * 3.9, Y, V.gate.z); gateR.position.set(V.gate.x + 2 + V.gate.open * 3.9, Y, V.gate.z);
      gl.intensity = 40 + S.night * 40;
    };
    P.vis();

    // ================= şehir mobilyaları =================
    const F = W.furn, fp = [], CY = W.CITY_Y + 0.15;
    const put = (list, s, fn) => { const ang = -Math.atan2(s.tz, s.tx), c = Math.cos(-ang), sn = Math.sin(-ang); fn((m, w, h, d, lx, ly, lz) => { const p = Geo.box(m, w, h, d, 0, 0, 0); p.g.translate(lx, ly, lz); p.g.rotateY(ang); p.g.translate(s.x, CY, s.z); list.push(p); }, c, sn); };
    // otobüs durağı: yerel x = yol boyunca, yerel z = yoldan dışarı (side ile çevrilir)
    for (const s of F.bus) put(fp, s, (b) => { const o = s.side;
      for (const lx of [-1.9, 1.9]) b('dark', 0.08, 2.5, 0.08, lx, 1.25, 0.55 * o); for (const lx of [-1.9, 1.9]) b('dark', 0.08, 2.5, 0.08, lx, 1.25, -0.5 * o);
      b('dark', 4.2, 0.08, 1.5, 0, 2.54, 0); b('bglass', 3.8, 1.9, 0.04, 0, 1.3, 0.57 * o); b('bglass', 0.04, 1.9, 1.0, -1.92, 1.3, 0.05 * o);
      b('wood', 2.4, 0.07, 0.42, 0, 0.5, 0.3 * o); for (const lx of [-1.0, 1.0]) b('dark', 0.06, 0.5, 0.36, lx, 0.25, 0.3 * o);
      b('dark', 0.07, 3.0, 0.07, 2.6, 1.5, -0.6 * o); b('bus', 0.06, 0.6, 0.6, 2.6, 2.7, -0.6 * o); });
    for (const s of F.taxi) put(fp, s, (b) => { b('dark', 0.07, 2.8, 0.07, 0, 1.4, 0); b('taxi', 0.06, 0.5, 0.9, 0, 2.55, 0); });
    const sign = (txt, bg, fg) => H.tex(H.canvas(128, 128, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 128, 128); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(5, 5, 118, 118); g.fillStyle = fg; g.font = 'bold ' + (txt.length > 3 ? 40 : 52) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); }));
    if (fp.length) {
      const fm = Geo.merge(fp), FM = { dark: M.dark, wood: M.wood, bglass: new T.MeshStandardMaterial({ color: 0x9fb6c2, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.35 }), bus: new T.MeshStandardMaterial({ map: sign('BUS', '#1556b0', '#ffffff'), roughness: 0.5 }), taxi: new T.MeshStandardMaterial({ map: sign('TAXI', '#e5b90f', '#111111'), roughness: 0.5 }) };
      const m = new T.Mesh(fm.geometry, fm.keys.map((k) => FM[k])); m.castShadow = true; root.add(m);
    }
    // hidrantlar
    { const hg = Geo.merge([Geo.cyl('a', 0.11, 0.13, 0.55, 0, 0.275, 0, 0, 0, 0, 10), Geo.ell('a', 0.12, 0.09, 0.12, 0, 0.58, 0, 8), Geo.cyl('a', 0.05, 0.05, 0.34, 0, 0.36, 0, Math.PI / 2, 0, 0, 8), Geo.cyl('a', 0.15, 0.15, 0.05, 0, 0.03, 0, 0, 0, 0, 10)]).geometry;
      const im = new T.InstancedMesh(hg, M.red, F.hyd.length), mx = new T.Matrix4(); F.hyd.forEach((s, i) => { mx.makeRotationY(-Math.atan2(s.tz, s.tx)); mx.setPosition(s.x, CY, s.z); im.setMatrixAt(i, mx); }); im.frustumCulled = false; im.castShadow = true; root.add(im); }
    // yol üstü boyalar: ara yaya geçidi, BUS / TAXI yazıları
    const decal = (list, s, half, len, along, lat, flip) => { // merkez: yol ekseni + lat (sağa), yol boyunca "along" kadar ileri
      const cx = s.px + s.tx * along + s.nx * lat, cz = s.pz + s.tz * along + s.nz * lat, b = list.p.length / 3;
      for (const d of [-len / 2, len / 2]) for (const h of [-half, half]) list.p.push(cx + s.tx * d + s.nx * h, W.CITY_Y + 0.05, cz + s.tz * d + s.nz * h);
      const fu = flip === 1, fv = flip === -1; list.u.push(fu ? 1 : 0, fv ? 1 : 0, fu ? 0 : 1, fv ? 1 : 0, fu ? 1 : 0, fv ? 0 : 1, fu ? 0 : 1, fv ? 0 : 1); list.i.push(b, b + 1, b + 2, b + 1, b + 3, b + 2, b, b + 2, b + 1, b + 1, b + 2, b + 3);
    };
    const mkDecal = (list, map) => { if (!list.p.length) return; const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(list.p, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(list.u, 2)); g.setIndex(list.i); g.computeVertexNormals(); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
      root.add(new T.Mesh(g, new T.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.35, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }))); };
    const L = () => ({ p: [], u: [], i: [] }), zeb = L(), busD = L(), taxD = L();
    for (const s of F.xwalk) decal(zeb, s, s.e.halfW - (s.e.type === 'city' ? 0 : 0), 3.2, 0, 0);
    for (const s of F.bus) decal(busD, s, 1.1, 9, 0, (s.e.halfW - 1.25) * s.side, s.side);
    for (const s of F.taxi) decal(taxD, s, 1.1, 9, 0, (s.e.halfW - 1.25) * s.side, s.side);
    mkDecal(zeb, H.tex(H.canvas(512, 128, (g) => { g.clearRect(0, 0, 512, 128); g.fillStyle = '#e8e6de'; for (let i = 0; i < 16; i++) g.fillRect(i * 32 + 7, 6, 18, 116); })));
    const word = (t, col) => H.tex(H.canvas(128, 512, (g) => { g.clearRect(0, 0, 128, 512); g.strokeStyle = col; g.lineWidth = 7; g.strokeRect(6, 6, 116, 500); g.save(); g.translate(64, 256); g.rotate(-Math.PI / 2); g.fillStyle = col; g.font = 'bold 86px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 0, 4); g.restore(); }));
    mkDecal(busD, word('BUS', '#e2bd1f')); mkDecal(taxD, word('TAXI', '#e2bd1f'));
  };
})();
