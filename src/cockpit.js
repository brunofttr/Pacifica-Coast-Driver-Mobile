// Pacifica Coast — iç mekân: gösterge paneli (geometri ibreler), direksiyon, koltuklar, orta ekran, dikiz aynası
(function () {
  'use strict';
  const PC = window.PC, U = PC.U, T = THREE, Geo = PC.Geo;
  const A0 = (225 * Math.PI) / 180, SW = (270 * Math.PI) / 180;

  function dialTex(spec, style) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 768; const g = c.getContext('2d');
    const acc = style === 'rugged' ? '#ffb347' : style === 'modern' ? '#6fd6ff' : '#ff3b30';
    const bg = g.createLinearGradient(0, 0, 0, 768); bg.addColorStop(0, '#0b0c0f'); bg.addColorStop(1, '#050506'); g.fillStyle = bg; g.fillRect(0, 0, 2048, 768);
    const dial = (cx, cy, r, max, step, sub, label, unit, red) => {
      const gr = g.createRadialGradient(cx, cy, r * 0.2, cx, cy, r); gr.addColorStop(0, '#15171c'); gr.addColorStop(1, '#08090b');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
      g.strokeStyle = '#3a3d44'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r - 3, 0, 7); g.stroke();
      g.strokeStyle = '#1b1d22'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r - 14, 0, 7); g.stroke();
      const n = Math.round(max / step);
      for (let i = 0; i <= n * sub; i++) {
        const t = i / (n * sub), th = A0 - SW * t, major = i % sub === 0, v = (i / sub) * step;
        const r0 = r - 24, r1 = r - (major ? 62 : 42);
        g.strokeStyle = red && v >= red ? '#ff3b30' : major ? '#f2f2f2' : '#9a9da3'; g.lineWidth = major ? 7 : 3;
        g.beginPath(); g.moveTo(cx + Math.cos(th) * r0, cy - Math.sin(th) * r0); g.lineTo(cx + Math.cos(th) * r1, cy - Math.sin(th) * r1); g.stroke();
        if (major) { g.fillStyle = red && v >= red ? '#ff5a50' : '#f4f4f4'; g.font = '600 ' + (max > 400 ? 50 : 44) + 'px "Segoe UI", Roboto, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(max > 400 ? Math.round(v / 1000) : v), cx + Math.cos(th) * (r - 104), cy - Math.sin(th) * (r - 104)); }
      }
      if (red) { g.strokeStyle = 'rgba(255,59,48,0.9)'; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, r - 19, -(A0 - SW * (red / max)), -(A0 - SW), false); g.stroke(); }
      g.fillStyle = '#b8bcc4'; g.font = '500 34px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText(label, cx, cy + r * 0.42); g.fillStyle = acc; g.font = '600 30px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText(unit, cx, cy + r * 0.6);
    };
    const tmax = Math.ceil((spec.redline + 600) / 1000) * 1000, vstep = spec.vmaxDial > 260 ? 30 : 20;
    dial(424, 392, 350, tmax, 1000, 5, 'x1000', 'rpm', spec.redline);
    dial(1624, 392, 350, spec.vmaxDial, vstep, 2, 'km/h', '', 0);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 16; t.generateMipmaps = true;
    return { tex: t, tmax, acc };
  }

  PC.buildCockpit = function (car, spec, minimapCanvas) {
    const ext = car.ck || null, P = car.P, b = ext ? { cowl: 0, deck: 0, roofF: 0, roofR: 0, clear: 0 } : P.b, sh = ext ? 0 : P.shift, X = (x) => x + sh;
    const xc = ext ? ext.cluster[0] + 0.325 : b.cowl, yb = ext ? ext.cluster[1] - 0.078 : P.belt(xc) - 0.02, hw = ext ? 0.9 : P.hw(xc - 0.3), zd = ext ? ext.cluster[2] : -0.37, style = spec.dash;
    const grp = new T.Group(); car.body.add(grp);
    const parts = [];
    const dark = 'int', soft = 'soft', seatK = 'seat';
    // --- torpido ---
    const sp = new T.Shape();
    sp.moveTo(X(xc + 0.12), yb + 0.02); sp.lineTo(X(xc - 0.4), yb - 0.01); sp.lineTo(X(xc - 0.5), yb - 0.09); sp.lineTo(X(xc - 0.47), yb - 0.36); sp.lineTo(X(xc - 0.2), yb - 0.6); sp.lineTo(X(xc + 0.12), yb - 0.6);
    const wdt = (hw - 0.07) * 2, dg = new T.ExtrudeGeometry(sp, { depth: wdt, bevelEnabled: false }); dg.translate(0, 0, -wdt / 2);
    parts.push({ g: dg, m: dark });
    // gösterge siperliği
    parts.push(Geo.box(dark, 0.22, 0.022, 0.46, X(xc - 0.39), yb + 0.168, zd, 0, 0, 0.1));
    for (const s of [-1, 1]) parts.push(Geo.box(dark, 0.2, 0.18, 0.02, X(xc - 0.39), yb + 0.075, zd + s * 0.225));
    parts.push(Geo.box(dark, 0.02, 0.18, 0.46, X(xc - 0.3), yb + 0.075, zd));
    // havalandırmalar + süs şeridi
    for (const z of [-hw + 0.2, 0.12, 0.34, hw - 0.2]) parts.push(Geo.box('vent', 0.02, 0.05, 0.13, X(xc - 0.492), yb - 0.13, z));
    parts.push(Geo.box('accent', 0.012, 0.012, wdt - 0.1, X(xc - 0.502), yb - 0.19, 0));
    // orta konsol + vites
    parts.push(Geo.box(dark, 0.95, 0.22, 0.22, X(xc - 0.92), spec.seat.y - 0.02, 0));
    parts.push(Geo.box(soft, 0.3, 0.05, 0.2, X(xc - 1.2), spec.seat.y + 0.1, 0));
    parts.push(Geo.cyl('accent', 0.012, 0.012, 0.11, X(xc - 0.72), spec.seat.y + 0.14, 0, 0, 0, 0.2, 8));
    parts.push(Geo.ell(dark, 0.03, 0.035, 0.028, X(xc - 0.73), spec.seat.y + 0.2, 0, 10));
    // zemin
    parts.push(Geo.box(dark, xc - b.deck + 0.1, 0.04, hw * 1.84, X((xc + b.deck) / 2), b.clear + 0.1, 0));
    // koltuklar
    const sx = xc - 1.08, sy = spec.seat.y;
    const seat = (x, z, w) => {
      parts.push(Geo.box(seatK, 0.5, 0.13, w, X(x), sy - 0.06, z));
      parts.push(Geo.box(seatK, 0.13, 0.62, w - 0.02, X(x - 0.33), sy + 0.28, z, 0, 0, 0.2));
      parts.push(Geo.box(seatK, 0.1, 0.17, w * 0.55, X(x - 0.43), sy + 0.68, z, 0, 0, 0.12));
      for (const s of [-1, 1]) { parts.push(Geo.box(seatK, 0.48, 0.07, 0.06, X(x), sy + 0.03, z + s * (w / 2 - 0.03))); parts.push(Geo.box(seatK, 0.1, 0.5, 0.06, X(x - 0.29), sy + 0.26, z + s * (w / 2 - 0.03), 0, 0, 0.2)); }
    };
    seat(sx, -0.37, 0.5); seat(sx, 0.37, 0.5);
    if (sx - 0.95 > b.roofR - 0.25 + 0.3 || spec.id === 'tera' || spec.id === 'bavaro' || spec.id === 'kaido' || spec.id === 'canyon' || spec.id === 'ironhorse') {
      const rx = sx - 0.88; if (rx - 0.45 > b.deck) { parts.push(Geo.box(seatK, 0.48, 0.13, hw * 1.6, X(rx), sy - 0.04, 0)); parts.push(Geo.box(seatK, 0.13, 0.6, hw * 1.6, X(rx - 0.32), sy + 0.28, 0, 0, 0, 0.22)); }
    }
    if (!ext) { // direkler, tavan kirişleri, tavan döşemesi, kapı panelleri (gerçek parçalar; gövde kabuğu yalnız dolgu)
      const beam = (m, a, c, r) => { const d = new T.Vector3().subVectors(c, a), l = d.length(), g = new T.CylinderGeometry(r, r, l, 10); g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize())); g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2); parts.push({ g, m }); };
      const V3 = (x, y, z) => new T.Vector3(X(x), y, z);
      const rw = Math.min(b.rw, P.hw(b.roofF) * 0.93) * 0.97, yRF = P.top(b.roofF) - 0.05, yRR = P.top(b.roofR) - 0.05, zA = P.hw(b.cowl) * 0.87, yA = P.belt(b.cowl) + 0.01, floorY = b.clear + 0.12;
      for (const s of [-1, 1]) {
        beam('pill', V3(b.cowl - 0.02, yA, s * zA), V3(b.roofF, yRF, s * rw), 0.042);
        beam('pill', V3(b.roofF, yRF, s * rw), V3(b.roofR, yRR, s * rw), 0.038);
        for (const pl of b.pillars || []) { const xm = (pl[0] + pl[1]) / 2; beam('pill', V3(xm, P.belt(xm) - 0.02, s * P.hw(xm) * 0.93), V3(xm, P.top(xm) - 0.05, s * rw), 0.05); }
        if (b.roofR - b.deck > 0.15) beam('pill', V3(b.roofR, yRR, s * rw), V3(b.deck + 0.06, P.belt(b.deck + 0.06) + 0.02, s * P.hw(b.deck + 0.06) * 0.88), 0.05);
        const xB = b.pillars && b.pillars.length ? b.pillars[b.pillars.length - 1][0] : b.roofR, x0 = b.cowl - 0.1, xm = (x0 + xB) / 2, len = x0 - xB, zc = s * (P.hw(xm) * 0.93 - 0.03), yb2 = P.belt(xm);
        parts.push(Geo.box('door', len, yb2 - floorY, 0.05, X(xm), (yb2 + floorY) / 2, zc));
        parts.push(Geo.box('soft', len * 0.72, 0.06, 0.12, X(xm), spec.seat.y + 0.24, zc - s * 0.07));
        parts.push(Geo.box('pill', len, 0.05, 0.08, X(xm), yb2 - 0.012, zc));
        parts.push(Geo.box('accent', 0.13, 0.022, 0.02, X(x0 - 0.38), yb2 - 0.15, zc - s * 0.035));
        parts.push(Geo.cyl('vent', 0.075, 0.075, 0.02, X(x0 - 0.2), floorY + 0.28, zc - s * 0.03, Math.PI / 2, 0, 0, 14));
      }
      beam('pill', V3(b.roofF, yRF, -rw), V3(b.roofF, yRF, rw), 0.042); beam('pill', V3(b.roofR, yRR, -rw), V3(b.roofR, yRR, rw), 0.038);
      if (!b.sunroof) parts.push(Geo.box('head', b.roofF - b.roofR, 0.03, rw * 1.96, X((b.roofF + b.roofR) / 2), (yRF + yRR) / 2 + 0.04, 0));
      for (const z of [zd, -zd]) parts.push(Geo.box('soft', 0.15, 0.016, 0.34, X(b.roofF - 0.09), yRF - 0.03, z, 0, 0, 0.3));
      parts.push(Geo.box('head', 0.1, 0.03, 0.14, X(b.roofF - 0.25), yRF - 0.005, 0));
    }
    // direksiyon kolonu
    parts.push(Geo.cyl(dark, 0.035, 0.04, 0.3, X(xc - 0.42), yb - 0.19, zd, 0, 0, Math.PI / 2 - 0.38, 8));
    const mg = Geo.merge(parts);
    const acc = style === 'rugged' ? 0xd98a2b : style === 'modern' ? 0x58c9f5 : 0xb01818;
    const im = {
      pill: new T.MeshStandardMaterial({ color: 0x3a3c41, roughness: 0.85 }), head: new T.MeshStandardMaterial({ color: 0x5a5d62, roughness: 0.95 }), door: new T.MeshStandardMaterial({ color: 0x25262a, roughness: 0.8 }),
      int: new T.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.82 }), soft: new T.MeshStandardMaterial({ color: 0x2a2b2f, roughness: 0.95 }),
      seat: new T.MeshStandardMaterial({ color: style === 'rugged' ? 0x3a3027 : style === 'modern' ? 0x34373c : 0x1a1a1c, roughness: 0.9 }),
      vent: new T.MeshStandardMaterial({ color: 0x08080a, roughness: 0.5, metalness: 0.4 }), accent: new T.MeshStandardMaterial({ color: acc, roughness: 0.3, metalness: 0.7 }),
    };
    if (!ext) grp.add(new T.Mesh(mg.geometry, mg.keys.map((k) => im[k])));
    if (ext && ext.kit) { // içi boş gelen modeller için kokpit kiti: torpido, konsol, koltuklar, zemin
      const kp = [], cx = ext.cluster[0], cy = ext.cluster[1], ex = ext.eye.x, ey = ext.eye.y, ez = ext.eye.z, w = (ext.width || 1.9) - 0.34;
      kp.push(Geo.box('int', 0.6, 0.36, w, cx + 0.24, cy - 0.21, 0)); kp.push(Geo.box('soft', 0.56, 0.03, w, cx + 0.24, cy - 0.025, 0, 0, 0, 0.06));
      kp.push(Geo.box('int', 0.2, 0.02, 0.46, cx - 0.06, cy + 0.092, ez, 0, 0, 0.1)); for (const sd of [-1, 1]) kp.push(Geo.box('int', 0.2, 0.17, 0.02, cx - 0.06, cy + 0.0, ez + sd * 0.225)); kp.push(Geo.box('int', 0.02, 0.18, 0.46, cx + 0.03, cy, ez));
      kp.push(Geo.box('accent', 0.012, 0.012, w - 0.1, cx - 0.062, cy - 0.12, 0)); for (const z of [-w / 2 + 0.16, w / 2 - 0.16, 0.1, -0.1]) kp.push(Geo.box('vent', 0.02, 0.05, 0.13, cx - 0.062, cy - 0.06, z === 0.1 || z === -0.1 ? z - ez * 0.0 : z));
      kp.push(Geo.box('int', 1.0, 0.22, 0.2, ex + 0.18, ey - 0.7, 0)); kp.push(Geo.box('soft', 0.3, 0.05, 0.18, ex - 0.05, ey - 0.57, 0));
      for (const z of [ez, -ez]) { kp.push(Geo.box('seat', 0.5, 0.13, 0.5, ex - 0.02, ey - 0.74, z)); kp.push(Geo.box('seat', 0.13, 0.64, 0.48, ex - 0.36, ey - 0.42, z, 0, 0, 0.2)); kp.push(Geo.box('seat', 0.1, 0.17, 0.27, ex - 0.46, ey - 0.02, z, 0, 0, 0.12)); }
      kp.push(Geo.box('int', 2.3, 0.03, w + 0.1, ex + 0.1, ey - 0.96, 0));
      kp.push(Geo.cyl('int', 0.035, 0.04, 0.3, cx - 0.1, cy - 0.19, ez, 0, 0, Math.PI / 2 - 0.38, 8));
      const km = Geo.merge(kp); grp.add(new T.Mesh(km.geometry, km.keys.map((k) => im[k])));
    }

    // --- gösterge paneli ---
    const D = dialTex(spec, style);
    const tilt = new T.Group(); tilt.position.set(X(xc - 0.325), yb + 0.078, zd); tilt.rotation.z = -0.16; if (ext) { tilt.scale.setScalar(ext.clusterScale); tilt.rotation.z = ext.clusterTilt; if (ext.noCluster) tilt.visible = false; } grp.add(tilt);
    const yaw = new T.Group(); yaw.rotation.y = -Math.PI / 2; tilt.add(yaw);
    const CW = 0.4, CH = 0.15;
    const face = new T.Mesh(new T.PlaneGeometry(CW, CH), new T.MeshBasicMaterial({ map: D.tex, toneMapped: false })); yaw.add(face);
    const ndl = (cxPix) => {
      const piv = new T.Group(); piv.position.set(((cxPix - 1024) / 2048) * CW, ((384 - 392) / 768) * CH, 0.004); yaw.add(piv);
      const g = new T.BoxGeometry(0.066, 0.0032, 0.002); g.translate(0.021, 0, 0);
      piv.add(new T.Mesh(g, new T.MeshBasicMaterial({ color: D.acc, toneMapped: false })));
      const cap = new T.Mesh(new T.CylinderGeometry(0.0085, 0.0085, 0.005, 16), new T.MeshStandardMaterial({ color: 0x15161a, roughness: 0.3, metalness: 0.8 })); cap.rotation.x = Math.PI / 2; piv.add(cap);
      return piv;
    };
    const nT = ndl(424), nS = ndl(1624);
    // orta dijital ekran
    const dc = document.createElement('canvas'); dc.width = 512; dc.height = 512; const dg2 = dc.getContext('2d');
    const dtex = new T.CanvasTexture(dc); dtex.colorSpace = T.SRGBColorSpace; dtex.anisotropy = 16;
    const disp = new T.Mesh(new T.PlaneGeometry(0.096, 0.096), new T.MeshBasicMaterial({ map: dtex, toneMapped: false })); disp.position.set(0, 0.002, 0.003); yaw.add(disp);
    let sig = '';
    function drawDisp(v, st) {
      const g = dg2; g.fillStyle = '#060709'; g.fillRect(0, 0, 512, 512);
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const gear = v.mode === 'D' ? (v.manual ? 'M' : 'D') + v.gear : v.mode;
      g.fillStyle = '#ffffff'; g.font = '700 150px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText(String(Math.round(v.kmh)), 256, 220);
      g.fillStyle = '#9aa0a8'; g.font = '500 40px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText('km/h', 256, 268);
      g.fillStyle = D.acc; g.font = '700 84px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText(gear, 256, 372);
      // yakıt / hararet
      const bar = (x, frac, col, lab) => { g.fillStyle = '#22252b'; g.fillRect(x, 300, 26, 150); g.fillStyle = col; g.fillRect(x, 450 - 150 * U.clamp(frac, 0, 1), 26, 150 * U.clamp(frac, 0, 1)); g.fillStyle = '#9aa0a8'; g.font = '600 30px sans-serif'; g.fillText(lab, x + 13, 490); };
      bar(36, v.fuel / spec.tank, v.fuel / spec.tank < 0.12 ? '#ff5a50' : '#e9e9e9', 'F'); bar(450, (v.temp - 50) / 70, v.temp > 108 ? '#ff5a50' : '#6fd6ff', '°C');
      g.fillStyle = '#7c828b'; g.font = '500 30px "Segoe UI", Roboto, Arial, sans-serif'; g.fillText((v.odo / 1000).toFixed(1) + ' km', 256, 440);
      g.font = '700 30px "Segoe UI", Roboto, Arial, sans-serif';
      const ic = (x, txt, on, col) => { g.fillStyle = on ? col : '#2a2d33'; g.fillText(txt, x, 492); };
      ic(150, 'ABS', v.absOn, '#ffb020'); ic(256, 'TCS', v.tcsOn || v.escMode === 0, '#ffb020'); ic(362, 'ESC', v.escOn || v.escMode === 0, '#ffb020');
      g.font = '700 60px sans-serif'; g.fillStyle = st.indL ? '#35e06a' : '#1d2025'; g.fillText('◀', 70, 70); g.fillStyle = st.indR ? '#35e06a' : '#1d2025'; g.fillText('▶', 442, 70);
      g.font = '700 30px sans-serif'; g.fillStyle = st.lights ? '#35e06a' : '#1d2025'; g.fillText('FAR', 200, 60); g.fillStyle = st.handbrake ? '#ff5a50' : '#1d2025'; g.fillText('(P)', 312, 60);
      dtex.needsUpdate = true;
    }
    // --- direksiyon ---
    const wt = new T.Group(); wt.position.set(X(xc - 0.56), yb - 0.1, zd); wt.rotation.z = -0.38; grp.add(wt);
    const wy = new T.Group(); wy.rotation.y = -Math.PI / 2; wt.add(wy);
    const wparts = [];
    wparts.push({ g: new T.TorusGeometry(0.185, 0.0165, 12, 44), m: 'rim' });
    wparts.push(Geo.box('spoke', 0.15, 0.035, 0.014, -0.105, 0.005, -0.012)); wparts.push(Geo.box('spoke', 0.15, 0.035, 0.014, 0.105, 0.005, -0.012)); wparts.push(Geo.box('spoke', 0.035, 0.15, 0.014, 0, -0.105, -0.012));
    wparts.push({ g: Geo.xf(new T.CylinderGeometry(0.062, 0.07, 0.045, 24), 0, 0, -0.012, Math.PI / 2, 0, 0), m: 'hub' });
    wparts.push({ g: Geo.xf(new T.TorusGeometry(0.022, 0.004, 6, 20), 0, 0, 0.012, 0, 0, 0), m: 'badge' });
    if (style === 'sport') wparts.push(Geo.box('mark', 0.014, 0.012, 0.036, 0, 0.185, 0));
    const wm = Geo.merge(wparts);
    const wmat = { rim: new T.MeshStandardMaterial({ color: 0x141416, roughness: 0.75 }), spoke: new T.MeshStandardMaterial({ color: 0x2c2d31, roughness: 0.45, metalness: 0.6 }), hub: new T.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.7 }), badge: new T.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.2, metalness: 1 }), mark: new T.MeshStandardMaterial({ color: acc, roughness: 0.5 }) };
    const wheel = new T.Mesh(wm.geometry, wm.keys.map((k) => wmat[k])); if (!ext || ext.kit) wy.add(wheel);
    // --- orta ekran (harita) ---
    let screenTex = null;
    if (minimapCanvas && !ext) {
      screenTex = new T.CanvasTexture(minimapCanvas); screenTex.colorSpace = T.SRGBColorSpace; screenTex.anisotropy = 8;
      const sg = new T.Group(); sg.position.set(X(xc - 0.5), yb + 0.02, 0.02); sg.rotation.z = -0.12; grp.add(sg);
      const sy2 = new T.Group(); sy2.rotation.y = -Math.PI / 2 - 0.16; sg.add(sy2);
      sy2.add(new T.Mesh(new T.BoxGeometry(0.29, 0.175, 0.012), im.vent));
      const scr = new T.Mesh(new T.PlaneGeometry(0.27, 0.155), new T.MeshBasicMaterial({ map: screenTex, toneMapped: false })); scr.position.z = 0.0065; sy2.add(scr);
    }
    // --- dikiz aynası ---
    const mirrorRT = new T.WebGLRenderTarget(768, 224, { samples: 0 });
    if (car.mirrorMat) { car.mirrorMat.map = mirrorRT.texture; car.mirrorMat.color.setHex(0xffffff); car.mirrorMat.needsUpdate = true; }
    mirrorRT.texture.wrapS = T.RepeatWrapping; mirrorRT.texture.repeat.x = -1; mirrorRT.texture.offset.x = 1;
    const mg2 = new T.Group(); if (ext) { mg2.position.fromArray(ext.mirror); mg2.scale.setScalar(ext.mirrorScale || 1); } else mg2.position.set(X(b.roofF + 0.2), P.top(b.roofF) - 0.2, -0.17); grp.add(mg2);
    const my = new T.Group(); my.rotation.y = -Math.PI / 2 + (ext ? 0 : 0.18); mg2.add(my);
    my.add(new T.Mesh(new T.BoxGeometry(0.26, 0.082, 0.02), im.int));
    const mface = new T.Mesh(new T.PlaneGeometry(0.24, 0.07), new T.MeshBasicMaterial({ map: mirrorRT.texture, toneMapped: false })); mface.position.z = 0.011; my.add(mface);
    mg2.add(new T.Mesh(Geo.xf(new T.CylinderGeometry(0.008, 0.008, 0.1, 6), 0.04, 0.05, 0, 0, 0, -0.6), im.int));
    const mcam = new T.PerspectiveCamera(22, 768 / 224, 1.2, 1500);
    if (ext) mcam.position.fromArray(ext.mirrorCam); else mcam.position.set(X(b.deck > 0.5 ? b.roofR - 0.2 : 0.3), P.top(b.roofF) - 0.2, 0); mcam.rotation.set(0, Math.PI / 2, 0); car.body.add(mcam);

    { const ey = ext ? ext.eye : new T.Vector3(X(xc - 0.96), Math.max(spec.seat.y + 0.7, yb + 0.28), zd); const cab = new T.PointLight(0xfff1df, (ext && ext.cabin) || 7, 3.6, 1.4); cab.position.set(ey.x + 0.15, ey.y + 0.18, 0); grp.add(cab); } // kabin iç aydınlatması
    const ck = {
      group: grp, eye: ext ? ext.eye.clone() : new T.Vector3(X(xc - 0.96), Math.max(spec.seat.y + 0.7, yb + 0.28), zd), mirrorRT, mirrorCam: mcam, mirrorFace: mface, screenTex, dispT: 0,
      update(v, st, dt) {
        nT.rotation.z = A0 - SW * U.clamp(v.rpm / D.tmax, 0, 1); nS.rotation.z = A0 - SW * U.clamp(v.kmh / spec.vmaxDial, 0, 1);
        wheel.rotation.z = -v.delta * 13.5; if (car.setSteer) car.setSteer(v.delta * 13.5);
        this.dispT -= dt;
        if (this.dispT <= 0) {
          const s = [Math.round(v.kmh), v.mode, v.gear, v.manual, Math.round(v.fuel * 4), Math.round(v.temp / 2), Math.round(v.odo / 100), v.absOn, v.tcsOn, v.escOn, v.escMode, st.indL, st.indR, st.lights, st.handbrake].join();
          if (s !== sig) { sig = s; drawDisp(v, st); }
          this.dispT = 0.08;
        }
      },
    };
    return ck;
  };
})();
