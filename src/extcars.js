// Pacifica Coast — Sketchfab "FREE Concept Car" serisi (unityfan777, CC0) için genel model bağlayıcı.
// Modeller farklı ölçek/yön/düğüm adlarıyla geldiği için tekerlek, yön, boya ve farlar malzeme adlarından ve geometriden bulunur.
(function () {
  'use strict';
  const PC = window.PC, T = THREE, U = PC.U;
  const base = {
    cg: 0.48, cgH: 0.48, drive: 'awd', awdFront: 0.4, idle: 800, redline: 7200, stall: 2600, powerKw: 330,
    torque: [[900, 300], [1800, 520], [2700, 600], [5500, 600], [6300, 550], [7200, 450]], gears: [5.0, 3.2, 2.143, 1.72, 1.313, 1.0, 0.823, 0.64], rev: 3.5, final: 3.15, shiftT: 0.14,
    mu: 1.18, tireB: 11, brakeG: 1.22, bias: 0.62, cdA: 0.4, cl: 0.35, rollF: 0.57, lock: 0.62, rollGain: 0.005, pitchGain: 0.0028, suspHz: 1.9, tank: 60, cyl: 6, vmaxDial: 320, dash: 'modern', seat: { y: 0.35 },
    mass: 1650, L: 2.8, track: 1.7, R: 0.36, width: 2.0, len: 4.5, colors: [null, 0x8a0f1a, 0x10243f, 0x2b2d31, 0xe9e6df, 0x1f4a2c, 0xd9a400],
  };
  const hot = { mass: 1450, mu: 1.28, tireB: 12, torque: [[1000, 380], [2500, 620], [3500, 720], [6500, 730], [7800, 650], [8500, 560]], redline: 8500, stall: 3000, gears: [3.4, 2.2, 1.6, 1.25, 1.02, 0.86, 0.72], final: 3.9, shiftT: 0.09, drive: 'rwd', awdFront: 0, cg: 0.44, cl: 0.8, suspHz: 2.2, rollGain: 0.004, vmaxDial: 360, cyl: 8, dash: 'sport' };
  const lux = { mass: 2050, mu: 1.05, tireB: 9.5, suspHz: 1.45, rollGain: 0.008, pitchGain: 0.0044, cdA: 0.48, vmaxDial: 280 };
  const D = (id, name, cls, extra, ext) => Object.assign({}, base, extra || {}, { id, name, cls, ext: Object.assign({ dir: 'cars/' + id }, ext || {}) });
  const EXT = [
    D('c011', 'Nova GT-E', 'Konsept coupe · AWD · iç mekânlı', { cat: 'Bilim kurgu' }, { interior: true, steer: 'SW_Empty' }),
    D('c003', 'Meridian Lux', 'Konsept limuzin · AWD · iç mekânlı', Object.assign({ cat: 'Bilim kurgu' }, lux), { interior: true, tire: /^Material\.(002|003|011|028)$/ }),
    D('c005', 'Azure S', 'Konsept hatchback · AWD · iç mekânlı', { cat: 'Bilim kurgu' }, { interior: true, tire: /wheel_nitto/ }),
    D('c007', 'Regent Grand', 'Konsept GT · RWD · iç mekânlı', Object.assign({ cat: 'Bilim kurgu' }, lux), { interior: true, tire: /rubber_tires|tire_protector/, visSteer: 0.4 }),
    D('c006', 'Titan GT', 'Konsept grand tourer · AWD · iç mekânlı', Object.assign({ cat: 'Bilim kurgu' }, lux), { interior: true, tire: /wheel_nitto/ }),
    D('c033', 'Arrow LM', 'Konsept prototip · RWD', Object.assign({ cat: 'Spor ve süper' }, hot), { visSteer: 0.25, splitSkip: /body_color|chrome/ }),
    D('c037', 'Noir Coupe', 'Konsept coupe · RWD', Object.assign({ cat: 'Spor ve süper' }, hot), { flip: true }),
    D('c038', 'Glacier One', 'Konsept şehir coupe · AWD', { mass: 1400, cat: 'Bilim kurgu' }),
    D('c039', 'Crimson RS', 'Konsept roadster · RWD', Object.assign({ cat: 'Spor ve süper' }, hot)),
    D('c040', 'Onyx 4', 'Konsept sedan · AWD', { cat: 'Spor ve süper' }),
    // --- gerçek araç modelleri (Sketchfab, ücretsiz standart lisans) ---
    D('wagoneer', 'Jeep Grand Wagoneer 1991', 'SUV · 4x4 · 5.9 V8 · 144 hp', { cat: 'Araçlar', colors: [null, 0x5a1a1a, 0x1a2a4a, 0xd8d2c4, 0x1c1c1c], mass: 2050, drive: 'awd', awdFront: 0.5, lowRange: 2.6, cg: 0.5, cgH: 0.72, torque: [[800, 330], [1600, 380], [2800, 360], [3600, 290], [4400, 200]], idle: 650, redline: 4600, stall: 1900, powerKw: 107, gears: [2.74, 1.55, 1.0], rev: 2.2, final: 3.9, shiftT: 0.3, mu: 0.95, tireB: 8.5, brakeG: 0.9, cdA: 1.15, cl: 0, suspHz: 1.3, rollGain: 0.011, pitchGain: 0.006, tank: 76, cyl: 8, vmaxDial: 160, dash: 'classic' },
      { interior: true, rig: true, anim: false, gauge: { mph: 1 } }),
    D('g8', 'Pontiac G8 GXP 2009', 'Sedan · RWD · 6.2 V8 · 415 hp', { cat: 'Araçlar', colors: [null, 0x15181c, 0xdfe2e6, 0x1b3a6b, 0x6b6f75], mass: 1840, drive: 'rwd', awdFront: 0, cg: 0.47, cgH: 0.5, torque: [[1000, 430], [2500, 520], [4400, 563], [5900, 500], [6600, 430]], idle: 700, redline: 6600, stall: 2400, powerKw: 309, gears: [4.03, 2.36, 1.53, 1.15, 0.85, 0.67], rev: 3.1, final: 3.27, shiftT: 0.16, mu: 1.12, tireB: 11, brakeG: 1.15, cdA: 0.72, cl: 0.1, suspHz: 1.7, rollGain: 0.006, pitchGain: 0.0035, tank: 73, cyl: 8, vmaxDial: 290, dash: 'sport' },
      { interior: true, rig: true, gauge: { mph: 1 } }),
    D('veloster', 'Hyundai Veloster Turbo 2019', 'Hatchback · FWD · 1.6 T · 201 hp', { cat: 'Araçlar', colors: [null, 0xc41e1e, 0x1e3f8a, 0x1a1c20, 0xd96a00], mass: 1330, drive: 'fwd', awdFront: 1, cg: 0.4, cgH: 0.5, torque: [[1000, 180], [1500, 265], [4500, 265], [6000, 240], [6700, 200]], idle: 750, redline: 6700, stall: 2300, powerKw: 150, gears: [3.62, 1.96, 1.37, 1.04, 0.84, 0.7], rev: 3.4, final: 4.2, shiftT: 0.14, mu: 1.1, tireB: 11, brakeG: 1.12, cdA: 0.7, cl: 0.1, suspHz: 1.9, rollGain: 0.0055, pitchGain: 0.003, tank: 50, cyl: 4, vmaxDial: 260, dash: 'sport' },
      { interior: true, rig: true }),
    D('elroq', 'Škoda Elroq 2025', 'Elektrikli SUV · RWD · 286 hp', { cat: 'Araçlar', colors: [null, 0x15181c, 0xdfe2e6, 0x1b3a6b, 0x8a0f1a], mass: 2100, drive: 'rwd', awdFront: 0, cg: 0.5, cgH: 0.5, torque: [[300, 545], [4500, 545], [7000, 360], [10000, 250], [13500, 170]], idle: 300, redline: 13500, stall: 1200, powerKw: 210, gears: [1.0], rev: 1.0, final: 9.6, shiftT: 0.05, mu: 1.08, tireB: 10.5, brakeG: 1.1, cdA: 0.72, cl: 0.05, suspHz: 1.6, rollGain: 0.0065, pitchGain: 0.0035, tank: 77, cyl: 6, vmaxDial: 240, dash: 'modern' },
      { interior: true, real: true, flip: true, animT: 11.6, swTilt: 0.42, steerNear: [0.4, 1.0, -0.37, 0.3], noCluster: true, keepHud: true, eyeDX: 0.02, eyeDY: 0, tireNode: /^NEW_TIRE/, steerNode: /^NEW_(Steering_wheel00[67]_|SW_LODGE|GN_Instance_128)/ }),
  ];
  PC.ExtCars = EXT;
  EXT.forEach((s, i) => PC.CarSpecs.splice(1 + i, 0, s));
  (PC.Credits = PC.Credits || []).splice(1, 0, 'Araç modelleri: "FREE Concept Car" serisi — unityfan777, Sketchfab (kamu malı, CC0)', 'Araç modelleri: Jeep Grand Wagoneer, Pontiac G8 GXP, Hyundai Veloster Turbo, Škoda Elroq — geyges (Sketchfab, ücretsiz standart lisans)');
  if (PC.Assets) for (const s of EXT) PC.Assets.TEX.push('thumb_' + s.id);

  PC.loadExtCar = function (spec) {
    if (spec._gltf) return Promise.resolve();
    if (spec._loading) return spec._loading;
    const dir = spec.ext.dir, dec = new TextDecoder();
    return (spec._loading = PC.Assets.get(dir + '/scene.gltf').then((buf) => {
      const text = dec.decode(buf), json = JSON.parse(text), uris = [];
      for (const b of json.buffers || []) if (b.uri) uris.push(b.uri);
      for (const im of json.images || []) if (im.uri) uris.push(im.uri);
      const map = {};
      return Promise.all(uris.map((u) => PC.Assets.get(dir + '/' + decodeURIComponent(u)).then((ab) => { map[u] = URL.createObjectURL(new Blob([ab])); map[decodeURIComponent(u)] = map[u]; }).catch(() => {})))
        .then(() => new Promise((res, rej) => { const mgr = new T.LoadingManager(); mgr.setURLModifier((u) => map[u] || map[decodeURIComponent(u)] || u); new T.GLTFLoader(mgr).parse(text, '', res, rej); }))
        .then((g) => {
          // İskeletli (skinned) ağlar düğüme bağlanınca dönmez ve sergileme pozunda (açık kapı vb.) gelir: dinlenme pozunda düz ağa çevir
          const sk = []; g.scene.traverse((o) => { if (o.isSkinnedMesh) sk.push(o); });
          // Her parça tek kemiğe bağlı katı gövde: baskın kemiğin dönüşümünü ağa göm. ext.rest ile eşleşen kemikler (açık kapılar) üst kemiğin pozuna çekilir.
          // Sergileme animasyonu (kapı açılışı vb.) varsa ilk karesi kapalı konumdur: kemikleri oraya al
          const clips = (g.animations || []).slice().sort((a, b) => b.duration - a.duration), clip = clips.find((c) => /door/i.test(c.name)) || clips[0];
          if ((sk.length || spec.ext.real) && clip && clip.duration > 1 && spec.ext.anim !== false) {
            const tt = spec.ext.animT || 0;
            for (const tr of clip.tracks) { const dot = tr.name.lastIndexOf('.'), node = g.scene.getObjectByName(tr.name.slice(0, dot)), prop = tr.name.slice(dot + 1); if (!node || !node[prop]) continue; const sz = tr.getValueSize(); let i = 0; while (i < tr.times.length - 1 && tr.times[i] < tt) i++; node[prop].fromArray(tr.values, i * sz); }
          }
          g.scene.updateMatrixWorld(true);
          const rest = spec.ext.rest, M = new T.Matrix4(), PI = new T.Matrix4();
          for (const o of sk) {
            const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight, acc = {}, bones = o.skeleton.bones, step = Math.max(1, (si.count / 200) | 0);
            for (let i = 0; i < si.count; i += step) for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > 0) { const b = si.getComponent(i, k); acc[b] = (acc[b] || 0) + w; } }
            let bi = 0, bw = -1; for (const k in acc) if (acc[k] > bw) { bw = acc[k]; bi = +k; }
            const bone = bones[bi];
            M.copy(o.matrixWorld);
            if (!(rest && rest.test(bone.name))) M.multiply(o.bindMatrixInverse).multiply(bone.matrixWorld).multiply(o.skeleton.boneInverses[bi]).multiply(o.bindMatrix);
            const m = new T.Mesh(o.geometry, o.material); m.name = o.name; m.userData.bone = bones[bi].name;
            PI.copy(o.parent.matrixWorld).invert(); M.premultiply(PI).decompose(m.position, m.quaternion, m.scale);
            o.geometry.deleteAttribute('skinIndex'); o.geometry.deleteAttribute('skinWeight'); o.parent.add(m); o.parent.remove(o);
          }
          spec._gltf = g; spec._loading = null; for (const k in map) if (/\.bin$/.test(k)) URL.revokeObjectURL(map[k]); PC.Assets.drop && PC.Assets.drop(dir); });
    }).catch((e) => { spec._loading = null; throw e; }));
  };
  PC.disposeExtCar = function (spec) {
    const car = spec._car; if (!car) return;
    car.group.traverse((o) => { if (o.isMesh && !o.userData.keep) { o.geometry.dispose(); for (const m of Array.isArray(o.material) ? o.material : [o.material]) { for (const k in m) if (m[k] && m[k].isTexture && !m[k].isRenderTargetTexture) m[k].dispose(); m.dispose(); } } });
    spec._car = null; spec._gltf = null;
  };

  const _b = new T.Box3(), _c = new T.Vector3(), _s = new T.Vector3(), _q = new T.Quaternion();
  const RX = { hide: /shadow|ground|backdrop/i, blocker: /^blockers?$/i, tire: /rubber___tires|tireProtector|rubber_tires|tire_protector|wheel_nitto/i, glass: /glass|^windshield$|window/i, paint: /body|carpaint|car_?paint/i, head: /^headlights?$|fog_?light|headlight_cover/i, tail: /^taillights?$|taillight_chrome|taillight_cover|stoplight|brake_?light/i, sig: /turnlight|signal/i };
  // gerçek araç modellerinde (oyun iskeletli) tekerlek parçaları düğüm adından tanınır
  function wkey(o) {
    let p = o;
    for (let i = 0; i < 4 && p; i++, p = p.parent) {
      const nm = p.name || ''; let m = /^(?:rim|tyre|tire)_(LF|RF|LR|RR)_/.exec(nm) || /(?:rotor|drum)(LF|RF|LR|RR)_/.exec(nm);
      if (m) return { pos: m[1], spin: true }; m = /caliper(LF|RF|LR|RR)_/.exec(nm); if (m) return { pos: m[1], spin: false };
    }
    return null;
  }
  // aynı malzemeyi paylaşan sabit gövde parçalarını tek ağda birleştirir (yüzlerce çizim çağrısı -> malzeme sayısı kadar)
  function mergeStatic(car, meshes, root) {
    root.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(root.matrixWorld).invert(), by = new Map(), M = new T.Matrix4(), NM = new T.Matrix3(), v = new T.Vector3();
    for (const m of meshes) {
      if (!m.visible || m.userData.wheel || Array.isArray(m.material) || !m.geometry.attributes.position) continue;
      let p = m, dyn = false; while (p && p !== root) { if (p.userData.dyn) dyn = true; p = p.parent; } if (dyn) continue;
      const ca = m.geometry.attributes.color, key = m.material.uuid + '|' + (ca ? ca.itemSize : 0);
      if (!by.has(key)) by.set(key, []); by.get(key).push(m);
    }
    let before = 0, after = 0;
    by.forEach((list) => {
      const mat = list[0].material; before += list.length; if (list.length < 2) { after += list.length; return; }
      let nv = 0, ni = 0; const hasN = list.every((m) => m.geometry.attributes.normal), uvs = ['uv', 'uv1', 'uv2', 'uv3'].filter((k) => list.every((m) => m.geometry.attributes[k]));
      for (const m of list) { const g = m.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
      const cs = list[0].geometry.attributes.color ? list[0].geometry.attributes.color.itemSize : 0, C = cs ? new Float32Array(nv * cs) : null;
      const P = new Float32Array(nv * 3), N = hasN ? new Float32Array(nv * 3) : null, UA = uvs.map(() => new Float32Array(nv * 2)), I = new Uint32Array(ni); let vo = 0, io = 0;
      for (const m of list) {
        const g = m.geometry, p = g.attributes.position, nr = g.attributes.normal, ix = g.index, cnt = ix ? ix.count : p.count;
        M.multiplyMatrices(inv, m.matrixWorld); NM.getNormalMatrix(M); const flip = M.determinant() < 0;
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i).applyMatrix4(M); P[(vo + i) * 3] = v.x; P[(vo + i) * 3 + 1] = v.y; P[(vo + i) * 3 + 2] = v.z;
          if (N) { v.fromBufferAttribute(nr, i).applyMatrix3(NM).normalize(); N[(vo + i) * 3] = v.x; N[(vo + i) * 3 + 1] = v.y; N[(vo + i) * 3 + 2] = v.z; }
          if (C) { const ca = g.attributes.color; C[(vo + i) * cs] = ca.getX(i); C[(vo + i) * cs + 1] = ca.getY(i); C[(vo + i) * cs + 2] = ca.getZ(i); if (cs > 3) C[(vo + i) * cs + 3] = ca.getW(i); }
        }
        uvs.forEach((k, ui) => { const uv = g.attributes[k], A = UA[ui]; for (let i = 0; i < p.count; i++) { A[(vo + i) * 2] = uv.getX(i); A[(vo + i) * 2 + 1] = uv.getY(i); } });
        for (let t = 0; t + 2 < cnt; t += 3) { const a = (ix ? ix.getX(t) : t) + vo, b = (ix ? ix.getX(t + 1) : t + 1) + vo, c = (ix ? ix.getX(t + 2) : t + 2) + vo; I[io++] = a; I[io++] = flip ? c : b; I[io++] = flip ? b : c; }
        vo += p.count; m.parent.remove(m); g.dispose(); meshes.splice(meshes.indexOf(m), 1);
      }
      const g2 = new T.BufferGeometry(); g2.setAttribute('position', new T.BufferAttribute(P, 3)); if (N) g2.setAttribute('normal', new T.BufferAttribute(N, 3)); else g2.computeVertexNormals(); uvs.forEach((k, ui) => g2.setAttribute(k, new T.BufferAttribute(UA[ui], 2))); if (C) g2.setAttribute('color', new T.BufferAttribute(C, cs));
      g2.setIndex(new T.BufferAttribute(I.subarray(0, io), 1));
      const mm = new T.Mesh(g2, mat); mm.castShadow = true; root.add(mm); meshes.push(mm); after++;
    });
    car.diag.merge = before + '→' + after;
  }
  PC.buildExtCar = function (sp, color) {
    let car = sp._car;
    if (!car) {
      const E = sp.ext, scene = sp._gltf.scene, rx = (k) => E[k] || RX[k], REAL = !!(E.rig || E.real);
      const under = (o, re) => { for (let p = o, i = 0; p && i < 5; p = p.parent, i++) if (re.test(p.name || '')) return true; return false; };
      car = sp._car = { spec: sp, group: new T.Group(), body: new T.Group(), wheels: [], envMats: [], paints: [], diag: {}, visSteer: E.visSteer || 1 };
      const fix = new T.Group(); fix.add(scene); car.body.add(fix); car.group.add(car.body);
      const meshes = []; scene.traverse((o) => { if (o.isMesh) { const n = o.material.name || ''; if (rx('hide').test(n) || rx('blocker').test(n)) o.visible = false; else meshes.push(o); } });
      const box = (o, out) => { out.setFromObject(o); return out; };
      car.group.updateMatrixWorld(true);
      if (!REAL && !E.keepAll) { // modelle birlikte gelen, çok uzakta duran başıboş parçaları gizle
        const cs = meshes.map((o) => { box(o, _b); return { o, c: _b.getCenter(new T.Vector3()), s: _b.getSize(new T.Vector3()) }; }), med = (k) => { const a = cs.map((e) => e.c[k]).sort((p, q) => p - q); return a[a.length >> 1]; };
        const mx = med('x'), my = med('y'), mz = med('z'), spread = cs.map((e) => Math.abs(e.c.z - mz) + Math.abs(e.c.x - mx)).sort((p, q) => p - q)[(cs.length * 0.6) | 0] || 1, lim = Math.max(spread * 3.2, 0.01);
        for (const e of cs) if (Math.abs(e.c.x - mx) + Math.abs(e.c.z - mz) > lim || Math.abs(e.c.y - my) > lim || Math.max(e.s.x, e.s.y, e.s.z) > lim * 2.2) { e.o.visible = false; meshes.splice(meshes.indexOf(e.o), 1); }
      }
      // --- ölçek + yön ---
      let tires = E.rig ? meshes.filter((o) => (o.userData.wk = wkey(o)) && o.userData.wk.spin) : E.tireNode ? meshes.filter((o) => under(o, E.tireNode)) : meshes.filter((o) => rx('tire').test(o.material.name || ''));
      const tb = new T.Box3(); let hmax = 0, cx0 = 1e9, cx1 = -1e9, cz0 = 1e9, cz1 = -1e9;
      for (const t of tires) { box(t, _b); tb.union(_b); _b.getSize(_s); _b.getCenter(_c); hmax = Math.max(hmax, _s.y); cx0 = Math.min(cx0, _c.x); cx1 = Math.max(cx1, _c.x); cz0 = Math.min(cz0, _c.z); cz1 = Math.max(cz1, _c.z); }
      if (!tires.length) { for (const m of meshes) tb.union(box(m, _b)); tb.getSize(_s); hmax = _s.y > 20 ? 70 : 0.7; cx0 = tb.min.x; cx1 = tb.max.x; cz0 = tb.min.z; cz1 = tb.max.z; }
      const scale = E.scale || (hmax > 8 ? 0.01 : 1);
      tb.getSize(_s); const alongZ = E.axis ? E.axis === 'z' : _s.z >= _s.x;
      const mid = alongZ ? (tb.min.z + tb.max.z) / 2 : (tb.min.x + tb.max.x) / 2;
      const cen = (re) => { let s = 0, n = 0; for (const m of meshes) if (re.test(m.material.name || '')) { box(m, _b).getCenter(_c); s += alongZ ? _c.z : _c.x; n++; } return n ? s / n - mid : null; };
      const hc = cen(rx('head')), tc = cen(rx('tail'));
      let fwd = hc !== null && Math.abs(hc) > 0.05 * scale ? Math.sign(hc) : tc !== null && Math.abs(tc) > 0.05 * scale ? -Math.sign(tc) : 1;
      if (E.rig) { let fs = 0, fn = 0, rs = 0, rn = 0; for (const t of tires) { box(t, _b).getCenter(_c); const vv = alongZ ? _c.z : _c.x; if (/F$/.test(t.userData.wk.pos)) { fs += vv; fn++; } else { rs += vv; rn++; } } if (fn && rn) fwd = Math.sign(fs / fn - rs / rn) || 1; }
      if (E.flip) fwd = -fwd;
      fix.rotation.y = alongZ ? (fwd * Math.PI) / 2 : fwd > 0 ? 0 : Math.PI; fix.scale.setScalar(scale);
      car.group.updateMatrixWorld(true);
      car.diag = { scale, alongZ, fwd, headC: hc, tailC: tc, tires: tires.length, meshes: meshes.length };
      // --- tekerlek kümeleri ---
      const tinfo = tires.map((t) => { const b = box(t, new T.Box3()); return { t, b, c: b.getCenter(new T.Vector3()), s: b.getSize(new T.Vector3()) }; });
      const all = new T.Box3(); for (const ti of tinfo) all.union(ti.b);
      let merged = tinfo.length < 4 || tinfo.some((ti) => ti.s.z > 1.1 || ti.s.x > 1.6);
      if (merged && tinfo.length) { // köşe köşe ayır: lastik köşeleri 4 kutu verir, sonra o silindirlere düşen bütün üçgenler tekerleğe taşınır
        const mxA = (all.min.x + all.max.x) / 2, mzA = (all.min.z + all.max.z) / 2, qb = [new T.Box3(), new T.Box3(), new T.Box3(), new T.Box3()], v = new T.Vector3();
        for (const ti of tinfo) { const p = ti.t.geometry.attributes.position; ti.t.updateWorldMatrix(true, false); for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(ti.t.matrixWorld); qb[(v.x > mxA ? 0 : 2) + (v.z < mzA ? 0 : 1)].expandByPoint(v); } }
        if (!qb.some((b) => b.isEmpty())) {
          const cyl = qb.map((b) => { const c = b.getCenter(new T.Vector3()), s2 = b.getSize(new T.Vector3()); return { c, r: Math.max(s2.x, s2.y) / 2 + 0.004, z0: b.min.z - 0.03, z1: b.max.z + 0.03 }; });
          const a = new T.Vector3(), b2 = new T.Vector3(), c2 = new T.Vector3(), made = [[], [], [], []], car_qb = () => new T.Box3(new T.Vector3(-1, -1, -1), new T.Vector3(1, 1, 1));
          for (const m of meshes.slice()) {
            if (E.splitSkip && E.splitSkip.test(m.material.name || '')) continue; // gövdeye ait teker kapağı yerinde kalsın
            box(m, _b); if (!cyl.some((cy) => _b.max.x > cy.c.x - cy.r && _b.min.x < cy.c.x + cy.r && _b.max.z > cy.z0 && _b.min.z < cy.z1 && _b.min.y < cy.c.y + cy.r)) continue;
            const g = m.geometry, p = g.attributes.position, ix = g.index ? g.index.array : null, nt = (ix ? ix.length : p.count) / 3, lists = [[], [], [], [], []];
            m.updateWorldMatrix(true, false);
            for (let t = 0; t < nt; t++) {
              const i0 = ix ? ix[t * 3] : t * 3, i1 = ix ? ix[t * 3 + 1] : t * 3 + 1, i2 = ix ? ix[t * 3 + 2] : t * 3 + 2;
              a.fromBufferAttribute(p, i0); b2.fromBufferAttribute(p, i1); c2.fromBufferAttribute(p, i2); a.add(b2).add(c2).multiplyScalar(1 / 3).applyMatrix4(m.matrixWorld);
              let w = 4; for (let k = 0; k < 4; k++) { const cy = cyl[k]; if (a.z > cy.z0 && a.z < cy.z1 && Math.hypot(a.x - cy.c.x, a.y - cy.c.y) < cy.r) { w = k; break; } }
              lists[w].push(i0, i1, i2);
            }
            if (lists[4].length === nt * 3) continue;
            for (let k = 0; k < 4; k++) if (lists[k].length) { const g2 = new T.BufferGeometry(); for (const an in g.attributes) g2.setAttribute(an, g.attributes[an]); g2.setIndex(lists[k]); g2.boundingBox = car_qb(k); g2.boundingSphere = new T.Sphere(); g2.boundingBox.getBoundingSphere(g2.boundingSphere); const m2 = new T.Mesh(g2, m.material); m2.frustumCulled = false; m2.castShadow = true; m.parent.add(m2); m2.position.copy(m.position); m2.quaternion.copy(m.quaternion); m2.scale.copy(m.scale); m2.updateMatrixWorld(true); made[k].push(m2); }
            if (lists[4].length) m.geometry = (() => { const g2 = new T.BufferGeometry(); for (const an in g.attributes) g2.setAttribute(an, g.attributes[an]); g2.setIndex(lists[4]); return g2; })(); else { m.visible = false; meshes.splice(meshes.indexOf(m), 1); }
          }
          car._split = { cyl, made, qb }; merged = false; car.diag.split = made.map((l) => l.length).join('/');
        }
      }
      let ground = tinfo.length ? all.min.y : 0, xf, xr, R, track, zc = 0, clusters = null;
      if (tinfo.length && !merged) {
        const mx = (all.min.x + all.max.x) / 2, mz = (all.min.z + all.max.z) / 2; clusters = { FL: new T.Box3(), FR: new T.Box3(), RL: new T.Box3(), RR: new T.Box3() };
        if (car._split) ['FL', 'FR', 'RL', 'RR'].forEach((k, i) => clusters[k].copy(car._split.qb[i]));
        else for (const ti of tinfo) clusters[(ti.c.x > mx ? 'F' : 'R') + (ti.c.z < mz ? 'L' : 'R')].union(ti.b);
        if (Object.values(clusters).some((b) => b.isEmpty())) clusters = null;
      }
      if (clusters) {
        const g = (k) => clusters[k].getCenter(new T.Vector3());
        xf = (g('FL').x + g('FR').x) / 2; xr = (g('RL').x + g('RR').x) / 2; track = Math.abs(g('FR').z - g('FL').z); zc = (g('FL').z + g('FR').z) / 2;
        clusters.FL.getSize(_s); R = _s.y / 2;
      } else if (tinfo.length) { all.getSize(_s); R = Math.min(0.45, _s.y / 2); xf = all.max.x - R; xr = all.min.x + R; track = _s.z - 0.26; zc = (all.min.z + all.max.z) / 2; }
      else { const bb = new T.Box3(); for (const m of meshes) bb.union(box(m, _b)); bb.getSize(_s); R = 0.36; xf = bb.max.x - _s.x * 0.2; xr = bb.min.x + _s.x * 0.2; track = _s.z * 0.82; zc = (bb.min.z + bb.max.z) / 2; ground = bb.min.y; }
      sp.L = xf - xr; sp.track = track; sp.R = R;
      const shiftX = -sp.L * sp.cg - xr;
      fix.position.set(shiftX, -ground, -zc); car.group.updateMatrixWorld(true);
      car.diag.wheelMode = clusters ? 'ayrı' : tinfo.length ? 'birleşik' : 'yok'; car.diag.L = +sp.L.toFixed(2); car.diag.track = +track.toFixed(2); car.diag.R = +R.toFixed(2);
      if (clusters) {
        const keys = ['FL', 'FR', 'RL', 'RR'], hubs = keys.map((k) => { const b = clusters[k].clone().translate(new T.Vector3(shiftX, -ground, -zc)), hub = new T.Group(), spin = new T.Group(); b.getCenter(hub.position); hub.add(spin); car.group.add(hub); return { hub, spin, b: b.expandByScalar(0.05) }; });
        car.group.updateMatrixWorld(true);
        if (car._split) car._split.made.forEach((l, i) => { for (const m2 of l) { (/caliper/i.test(m2.material.name || '') ? hubs[i].hub : hubs[i].spin).attach(m2); m2.userData.wheel = true; meshes.push(m2); } });
        else for (const m of meshes) {
          if (E.rig) { const k = m.userData.wk || wkey(m); if (k) { box(m, _b); _b.getCenter(_c); let bh = hubs[0], bd = 1e9; for (const h of hubs) { const d = _c.distanceTo(h.hub.position); if (d < bd) { bd = d; bh = h; } } (k.spin ? bh.spin : bh.hub).attach(m); m.userData.wheel = true; } continue; }
          box(m, _b); _b.getCenter(_c); _b.getSize(_s); for (const h of hubs) { if (h.b.containsPoint(_c) && _s.y <= (h.b.max.y - h.b.min.y) + 0.02 && _s.x <= (h.b.max.x - h.b.min.x) + 0.02) {
            // lastik çevresinde duran küçük parçalar (menteşe pimi, cıvata) tekerleğe ait değil: bağlanırsa tekerle birlikte dönüp 'nokta' gibi görünür
            if (Math.max(_s.x, _s.y, _s.z) < 0.12 && Math.hypot(_c.x - h.hub.position.x, _c.y - h.hub.position.y) > R * 0.9) { m.visible = false; car.diag.stray = (car.diag.stray || 0) + 1; break; }
            (/caliper/i.test(m.material.name || '') ? h.hub : h.spin).attach(m); m.userData.wheel = true; break; } } }
        // iskeletten gelen, gövde yanında açıkta kalan küçük menteşe parçalarını gizle
        for (const m of meshes) { if (m.userData.wheel || !m.userData.bone || !m.visible) continue; box(m, _b); _b.getCenter(_c); _b.getSize(_s); if (Math.max(_s.x, _s.y, _s.z) < 0.18 && Math.abs(_c.z) > track / 2 - 0.3 && _c.y < 1.0 && /^(metal_1|metal_dark_2|material_0|metal|bolt_metal)$/.test(m.material.name || '')) { m.visible = false; car.diag.hinge = (car.diag.hinge || 0) + 1; } }
        hubs.forEach((h, i) => car.wheels.push({ hub: h.hub, spin: h.spin, left: false, front: i < 2 }));
      } else for (let i = 0; i < 4; i++) { const hub = new T.Group(), spin = new T.Group(); hub.add(spin); car.group.add(hub); car.wheels.push({ hub, spin, left: false, front: i < 2 }); }
      // --- gövde ölçüleri ---
      const bb = new T.Box3(); for (const m of meshes) if (!m.userData.wheel) { box(m, _b); _b.getSize(_s); if (_s.x < 7 && _s.z < 3.2) bb.union(_b); }
      bb.getSize(_s); sp.len = U.clamp(_s.x, 3.4, 5.6); sp.width = U.clamp(_s.z, 1.6, 2.25); const roof = bb.max.y;
      car.diag.len = +_s.x.toFixed(2); car.diag.width = +_s.z.toFixed(2); car.diag.roof = +roof.toFixed(2);
      // --- malzemeler ---
      const seen = new Set(), triBy = new Map();
      for (const o of meshes) {
        const m = o.material, nm = m.name || ''; o.castShadow = true;
        const tri = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
        if (!rx('glass').test(nm) && !rx('tire').test(nm) && !o.userData.wheel) triBy.set(m, (triBy.get(m) || 0) + tri);
        if (seen.has(m)) continue; seen.add(m); car.envMats.push(m);
        if (REAL && /glass|gls_/i.test(nm)) { if (m.transparent || m.transmission > 0) { m.transmission = 0; PC.glassify(m, undefined, true); (car.glasses = car.glasses || []).push(m); car.glass = car.glass || m; } else if (!m.map) { m.transparent = true; m.opacity = 0.06; m.depthWrite = false; m.roughness = 0.05; } } // dokusuz opak 'cam' = gösterge / far merceği: berrak yap
        else if (!REAL && (rx('glass').test(nm) || m.transmission > 0)) { m.transmission = 0; PC.glassify(m, E.interior ? 0.26 : 0.42); car.glass = m; }
        else if (rx('paint').test(nm)) car.paints.push(m);
        if (rx('head').test(nm)) (car.mHeads = car.mHeads || []).push(m); else if (rx('tail').test(nm)) (car.mTails = car.mTails || []).push(m); else if (rx('sig').test(nm)) (car.mSigs = car.mSigs || []).push(m);
        if ('envMapIntensity' in m) m.envMapIntensity = 1.15;
        if (REAL && m.emissiveIntensity > 0.4) m.emissiveIntensity = 0.4; // gösterge / ekran ışıkları parlama efektinde patlamasın
      }
      if (!REAL && (!car.glass || !rx('glass').test(car.glass.name || ''))) {
        let best = null, bt = 0; const gb = new Map();
        for (const o of meshes) { if (o.userData.wheel) continue; const m = o.material, c = m.color; if (!c || rx('paint').test(m.name || '') || c.r + c.g + c.b > 0.3 || (m.roughness !== undefined && m.roughness > 0.3)) continue; box(o, _b); _b.getCenter(_c); _b.getSize(_s); if (_c.y < roof * 0.6 || _s.x < 0.8) continue; const tri = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; gb.set(m, (gb.get(m) || 0) + tri * _s.x * _s.z); }
        gb.forEach((v, m) => { if (v > bt) { bt = v; best = m; } });
        if (best) { PC.glassify(best, 0.42); car.glass = best; car.diag.glassGuess = best.name; const pi = car.paints.indexOf(best); if (pi >= 0) car.paints.splice(pi, 1); }
      }
      if (!car.paints.length) { let best = null, bt = 0; triBy.forEach((v, m) => { const c = m.color, l = c.r + c.g + c.b; if (v > bt && l > 0.15 && !(car.mHeads || []).includes(m)) { bt = v; best = m; } }); if (best) car.paints.push(best); }
      // boya: vernikli (clearcoat) fiziksel malzemeye yükselt
      car.paints = car.paints.map((m) => { if (REAL) return m; if (m.isMeshPhysicalMaterial) { m.clearcoat = 1; m.clearcoatRoughness = 0.05; return m; }
        const pm = new T.MeshPhysicalMaterial({ color: m.color, map: m.map, normalMap: m.normalMap, roughnessMap: m.roughnessMap, metalnessMap: m.metalnessMap, roughness: m.roughness, metalness: m.metalness, clearcoat: 1, clearcoatRoughness: 0.05, side: m.side, envMapIntensity: 1.25 }); pm.name = m.name; if (m.normalScale) pm.normalScale.copy(m.normalScale);
        for (const o of meshes) if (o.material === m) o.material = pm; const ei = car.envMats.indexOf(m); if (ei >= 0) car.envMats[ei] = pm; m.dispose(); return pm; });
      if (REAL) for (const m of car.paints) { // boya rengi köşe renginde gömülü: malzeme rengine taşı ki renk seçenekleri çalışsın
        if (!m.vertexColors) continue; const o = meshes.find((x) => x.material === m && x.geometry.attributes.color); if (!o) continue; const ca = o.geometry.attributes.color;
        m.color.setRGB(ca.getX(0), ca.getY(0), ca.getZ(0)); m.vertexColors = false; m.needsUpdate = true; }
      for (const m of car.paints) { m.userData.c0 = m.color.getHex(); if (m.isMeshStandardMaterial) { m.roughness = Math.min(m.roughness, 0.32); m.metalness = Math.max(m.metalness, 0.5); } }
      if (!E.interior) for (const m of car.paints) m.side = T.DoubleSide; // içi boş modeller: boyalı gövde içeriden de görünsün
      car.diag.paint = car.paints.map((m) => m.name).join('|'); car.diag.glass = car.glass ? car.glass.name : '-'; car.diag.head = (car.mHeads || []).map((m) => m.name).join('|'); car.diag.tail = (car.mTails || []).map((m) => m.name).join('|');
      for (const m of car.mHeads || []) m.emissive.setHex(0xfff2dc); for (const m of car.mTails || []) m.emissive.setHex(0xff1208); for (const m of car.mSigs || []) m.emissive.setHex(0xff8a00);
      car.paint = car.paints[0] || car.envMats[0]; car.glass = car.glass || car.paint;
      car.setLights = function (head, brake, il, ir, rev) {
        for (const m of car.mHeads || []) m.emissiveIntensity = head ? 5 : 0.2;
        for (const m of car.mTails || []) m.emissiveIntensity = brake ? 6 : head ? 1.4 : 0.25;
        for (const m of car.mSigs || []) m.emissiveIntensity = 0; // sinyaller yalnız soldaki / sağdaki parlamalarla (malzeme iki yanda ortak)
        if (car.spr) car.spr(head, brake, il, ir, rev);
      };
      if (E.steerNode) {
        const parts = meshes.filter((o) => { if (o.userData.wheel || !under(o, E.steerNode)) return false; if (!E.steerNear) return true; box(o, _b).getCenter(_c); return _c.distanceTo(new T.Vector3(E.steerNear[0], E.steerNear[1], E.steerNear[2])) < E.steerNear[3]; });
        if (parts.length) {
          car.group.updateMatrixWorld(true); const bbA = new T.Box3(), pts = [], v = new T.Vector3();
          for (const o of parts) { bbA.union(box(o, _b)); const p = o.geometry.attributes.position, st = Math.max(1, (p.count / 150) | 0); for (let i = 0; i < p.count; i += st) pts.push(v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).clone()); }
          const cen = bbA.getCenter(new T.Vector3()); let bestT = 0.4, bv = 1e9;
          if (E.swTilt !== undefined) bestT = E.swTilt; else for (let th = 0.1; th <= 0.62; th += 0.02) { const ax = Math.cos(th), ay = -Math.sin(th); let s2 = 0; for (const q of pts) { const d = (q.x - cen.x) * ax + (q.y - cen.y) * ay; s2 += d * d; } if (s2 < bv) { bv = s2; bestT = th; } }
          const piv = new T.Group(); piv.name = 'SW_Empty_auto'; piv.position.copy(cen); piv.rotation.z = -bestT; piv.userData.dyn = true; car.body.add(piv); piv.updateMatrixWorld(true);
          for (const o of parts) piv.attach(o); car.diag.swTilt = +bestT.toFixed(2);
        }
      }
      let sn = null, swp = null; const swRe = E.rig ? /^boneSteeringWheelSpindle/ : /^SW_Empty/; car.group.traverse((o) => { if (!sn && swRe.test(o.name)) sn = o; });
      if (sn) { let has = false; sn.traverse((o) => { if (o.isMesh) has = true; });
        if (!has) { // direksiyon ağları düğümün altında değil (iskeletten çevrilmiş): yakındaki küçük parçaları düğüme bağla
          car.group.updateMatrixWorld(true); const p0 = sn.getWorldPosition(new T.Vector3()); let n = 0;
          if (E.rig) { for (const m of meshes) if (m.userData.bone === sn.name) { sn.attach(m); n++; } sn.userData.dyn = true; }
          else for (const m of meshes) { if (m.userData.wheel) continue; box(m, _b); _b.getCenter(_c); _b.getSize(_s); if (_c.distanceTo(p0) < 0.2 && Math.max(_s.x, _s.y, _s.z) < 0.5) { sn.attach(m); n++; } }
          car.diag.swAttach = n;
        } }
      if (sn) { // direksiyon: sütun ekseni = araç x eksenine en yakın yerel eksen; sağa dönüş sürücüden bakınca saat yönü
        car.group.updateMatrixWorld(true); swp = sn.getWorldPosition(new T.Vector3()); const wq = sn.getWorldQuaternion(new T.Quaternion()); let ax = null, bx = 0, sg = 1;
        for (const v of [new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1)]) { const w = v.clone().applyQuaternion(wq); if (Math.abs(w.x) > bx) { bx = Math.abs(w.x); ax = v; sg = w.x < 0 ? -1 : 1; } }
        car.steerNode = sn; const b0 = sn.quaternion.clone(); car.setSteer = (a) => { sn.quaternion.copy(b0).multiply(_q.setFromAxisAngle(ax, a * sg * (E.steerSign || 1))); };
        car.diag.sw = [swp.x, swp.y, swp.z].map((v) => +v.toFixed(2));
      }
      if (REAL) {
        const gb = new Map();
        for (const o of meshes) { const m = o.material; if (!/glass|gls_/i.test(m.name || '') || o.userData.wheel) continue; box(o, _b); if (!gb.has(m)) gb.set(m, new T.Box3()); gb.get(m).union(_b); }
        car.glasses = []; let wn = 0;
        gb.forEach((b, m) => { b.getSize(_s); b.getCenter(_c); const win = _s.y > 0.22 && Math.max(_s.x, _s.z) > 0.6 && _c.y > roof * 0.5;
          if (win) { m.transmission = 0; m.map = null; m.alphaMap = null; m.transmissionMap = null; m.userData.glassy = false; m.onBeforeCompile = () => {}; PC.glassify(m, 0.24); m.side = T.DoubleSide; car.glasses.push(m); wn++; } });
        car.glass = car.glasses[0] || car.glass; car.diag.windows = wn;
      }
      if (E.rig) { // modelin kendi gösterge ibreleri: 'speedometer' / 'tachometer' / 'fuel' animasyonlarının ibre kemiği izinden okunur (1 kare = 1 birim)
        const anims = sp._gltf.animations || [], G = {}, qa = new T.Quaternion(), qb = new T.Quaternion();
        const mk = (key, clipRe, boneRe) => {
          const clip = anims.find((c) => clipRe.test(c.name)); let bone = null; scene.traverse((o) => { if (!bone && boneRe.test(o.name)) bone = o; }); if (!clip || !bone) return;
          const tr = clip.tracks.find((t) => t.name === bone.name + '.quaternion'); if (!tr) return;
          let n = 0; for (const m of meshes) if (m.userData.bone === bone.name) { bone.attach(m); n++; } bone.userData.dyn = true;
          G[key] = { bone, times: tr.times, values: tr.values, dur: clip.duration, n };
        };
        mk('speed', /^speedometer$/i, /^bonespeed/i); mk('tach', /^tachometer$/i, /^bonetach/i); mk('fuel', /^fuel$/i, /^bonefuel/i);
        const setG = (g, t) => { if (!g) return; const tm = g.times; t = U.clamp(t, 0, tm[tm.length - 1]); let i = 0, hi = tm.length - 1; while (hi - i > 1) { const mid = (i + hi) >> 1; if (tm[mid] <= t) i = mid; else hi = mid; }
          const k = tm[hi] > tm[i] ? (t - tm[i]) / (tm[hi] - tm[i]) : 0; qa.fromArray(g.values, i * 4); qb.fromArray(g.values, hi * 4); g.bone.quaternion.copy(qa).slerp(qb, k); };
        const GA = E.gauge || {};
        car.setGauges = (kmh, rpm, fuel) => { setG(G.speed, (Math.abs(kmh) / (GA.mph ? 1.609 : 1)) / 30); setG(G.tach, rpm / (GA.rpmPer || 300)); if (G.fuel) setG(G.fuel, fuel * G.fuel.dur); };
        car.diag.gauges = Object.keys(G).map((k) => k + ':' + G[k].n).join(' ');
        let mc = null; scene.traverse((o) => { if (!mc && /^boneMirrorC/.test(o.name)) mc = o; }); if (mc) { car.group.updateMatrixWorld(true); car._mirrorPos = mc.getWorldPosition(new T.Vector3()); }
      }
      if ((E.merge || REAL) && !E.noMerge) mergeStatic(car, meshes, car.body);
      { // alt taban (yolun gövdenin içinden görünmemesi için) + sinyal / geri vites parlamaları
        const fl = new T.Mesh(new T.BoxGeometry(sp.L + sp.R * 1.6, 0.05, Math.max(0.6, sp.track - 0.34)), new T.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.9 }));
        fl.position.set(sp.L * (0.5 - sp.cg), Math.max(0.13, sp.R * 0.42), 0);
        if (!E.interior) { car.body.add(fl); const fl2 = new T.Mesh(new T.BoxGeometry(sp.L - sp.R * 2.6, 0.04, sp.width - 0.16), fl.material); fl2.position.set((bb.min.x + bb.max.x) / 2 + 0.0, Math.max(0.15, sp.R * 0.5), (bb.min.z + bb.max.z) / 2); car.body.add(fl2); }
        if (PC.carLamps) car.spr = PC.carLamps(car, { bb, roof, head: !(car.mHeads || []).length });
      }
      const bs = PC.blobShadow(sp.len, sp.width); bs.userData.keep = true; car.group.add(bs);
      // --- kokpit yerleşimi (gövde koordinatları: x ileri, y yukarı, z sağ) ---
      // içi boş modellerde kabin yeri gövde profilinden bulunur: sürücü hattında (z≈-0.36) yukarıdan ışın atıp tavan yüksekliği h(x) çıkarılır;
      // en yüksek tavan platosunun ön kenarı = ön cam üst kenarı, göz ondan ~0.7 m geride, ayna camın hemen altında
      let fitEye = null, fitMir = null;
      if (!E.interior && !E.eye) {
        const rc = new T.Raycaster(), objs = [], sides = []; car.group.updateMatrixWorld(true);
        car.body.traverse((o) => { if (o.isMesh && o.visible && !o.userData.wheel && !o.userData.keep) { objs.push(o); sides.push(o.material.side); o.material.side = T.DoubleSide; } });
        const inv = new T.Matrix4().copy(car.body.matrixWorld), bw = car.body.matrixWorld, pr = [], dn = new T.Vector3(0, -1, 0), o3 = new T.Vector3();
        const zq = E.eyeZ !== undefined ? E.eyeZ : -0.36; let H = -1;
        for (let x = bb.min.x; x <= bb.max.x; x += 0.04) {
          o3.set(x, 3, zq).applyMatrix4(bw); rc.set(o3, dn.clone()); const hit = rc.intersectObjects(objs, false)[0];
          const y = hit ? hit.point.clone().applyMatrix4(new T.Matrix4().copy(bw).invert()).y : 0; pr.push([x, y]); if (x > bb.min.x + 0.5 && x < bb.max.x - 0.5) H = Math.max(H, y);
        }
        objs.forEach((o, i) => { o.material.side = sides[i]; });
        let ip = 0; pr.forEach((p, i) => { if (Math.abs(p[1] - H) < 1e-6) ip = i; });
        let i0 = ip, i1 = ip; while (i0 > 0 && pr[i0 - 1][1] > H - 0.1) i0--; while (i1 < pr.length - 1 && pr[i1 + 1][1] > H - 0.1) i1++;
        const x0 = pr[i0][0], x1 = pr[i1][0];
        const ex = Math.max(x1 - 0.72, x0 + 0.25), ey = Math.min(H - 0.2, 1.2);
        fitEye = [ex, ey, zq]; fitMir = [x1 - 0.1, H - 0.13, 0]; car.diag.cabin = [x0, x1, H].map((v) => +v.toFixed(2)).join('/');
      }
      const xr2 = -sp.L * sp.cg, ez = E.eyeZ !== undefined ? E.eyeZ : -0.36;
      const eye = E.eye || fitEye || (swp ? [swp.x - 0.46 + (E.eyeDX || 0), swp.y + 0.26 + (E.eyeDY || 0), swp.z] : [xr2 + sp.L * (E.eyeAt || 0.42), Math.min(roof - 0.17, 1.12), ez]);
      car.keepHud = !!E.keepHud;
      car.ck = { kit: !E.interior, cabin: REAL ? 1.6 : 7, noCluster: !!(E.rig || E.noCluster), eye: new T.Vector3().fromArray(eye), cluster: E.cluster || (swp ? [swp.x + 0.2 + (E.clDX || 0), swp.y + 0.2 + (E.clDY || 0), swp.z] : [eye[0] + 0.66, eye[1] - 0.17, eye[2]]), clusterScale: E.clusterScale || (swp ? 0.58 : 0.8), clusterTilt: -0.22,
        mirror: E.mirror || fitMir || [eye[0] + 0.5, Math.min(roof - 0.1, eye[1] + 0.12), 0], mirrorScale: 0.75, mirrorCam: [xr2 - 0.6, roof - 0.1, 0], width: sp.width };
      if (E.interior && !REAL && !E.keepModelCluster) { // modelin kendi (sabit) gösterge ekranı canlı göstergemizin altında ikinci bir panel gibi duruyordu: ışıklı ekran parçaları gizlenir, canlı gösterge onun yerine oturur
        const cp = new T.Vector3().fromArray(car.ck.cluster), hit = [], ub = new T.Box3();
        for (const o of meshes) { if (!o.visible || o.userData.wheel) continue; const m = o.material; if (!(m.emissiveMap || (m.emissive && m.emissive.getHex() > 0))) continue; box(o, _b); _b.getCenter(_c); _b.getSize(_s); if (Math.max(_s.x, _s.y, _s.z) > 0.9 || _c.distanceTo(cp) > 0.7 || _c.y < cp.y - 0.3) continue; hit.push(o); ub.union(_b); }
        if (hit.length >= 3) { ub.getCenter(_c); car.ck.cluster = [_c.x - 0.09, _c.y + 0.01, _c.z]; car.diag.clusterHidden = hit.length; } // canlı gösterge, modelin ekranının hemen önüne (göze doğru) oturur ve onu örter
      }
      if (car._mirrorPos) { car.ck.mirror = [car._mirrorPos.x - 0.07, car._mirrorPos.y - 0.02, car._mirrorPos.z]; car.ck.mirrorScale = E.mirrorScale || 0.55; }
      car.hoodCam = new T.Vector3(xr2 + sp.L * 0.78, Math.min(roof, 1.2) * 0.9, 0);
    }
    for (const m of car.paints) m.color.setHex(color === null || color === undefined ? m.userData.c0 : color);
    return car;
  };
})();
