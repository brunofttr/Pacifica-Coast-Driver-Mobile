// geliştirme aracı: dış modelleri 4 açıdan, tekerlekler döndürülmüş/kırılmış halde çizer
window.insp = async function (ids, opt) {
  opt = opt || {};
  const T = THREE, G = PC.Game, renderer = G.renderer, TW = 640, TH = 360;
  const rt = new T.WebGLRenderTarget(TW, TH, { samples: 4 }), sc = new T.Scene(), cm = new T.PerspectiveCamera(32, TW / TH, 0.2, 80);
  sc.environment = G.scene.environment; sc.background = new T.Color(0x8fa3b5);
  const d = new T.DirectionalLight(0xffffff, 3); d.position.set(4, 8, 5); sc.add(d); sc.add(new T.HemisphereLight(0xdfe9ff, 0x50504c, 1.6));
  const fl = new T.Mesh(new T.CircleGeometry(12, 40), new T.MeshStandardMaterial({ color: 0x9a9a96, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; sc.add(fl);
  const px = new Uint8Array(TW * TH * 4), cv = document.createElement('canvas'); cv.width = TW * 2; cv.height = TH * 2; const g = cv.getContext('2d'), im = g.createImageData(TW, TH), out = {};
  const specs = PC.CarSpecs.filter((s) => !ids || ids.indexOf(s.id) >= 0);
  for (const sp of specs) {
    try {
      let c;
      if (sp.ext) { await PC.loadExtCar(sp); c = PC.buildExtCar(sp, sp.colors[opt.color || 0]); }
      else if (sp.glb) c = PC.buildGlbCar(sp, sp.colors[0]); else c = PC.buildCar(sp, { player: true, color: sp.colors[0] });
      c.setLights.apply(null, opt.lights || [true, true, true, true, true]);
      const spin = opt.spin === undefined ? 0.9 : opt.spin, st = opt.steer === undefined ? 0.45 : opt.steer;
      for (const w of c.wheels) { if (w.front) w.hub.rotation.y = -st * (c.visSteer || 1); w.spin.rotation.z = (w.left ? 1 : -1) * spin; }
      if (c.setSteer) c.setSteer(st * 3); if (c.setGauges) c.setGauges(opt.kmh === undefined ? 90 : opt.kmh, 3500, 0.5);
      sc.add(c.group); sc.updateMatrixWorld(true);
      const L = sp.len, xfw = sp.L * (1 - sp.cg);
      const views = opt.views || [[L * 1.25, L * 0.36, L * 0.95, 0, 0.5, 0], [-L * 1.25, L * 0.4, -L * 0.95, 0, 0.5, 0], [xfw + 0.6, 0.55, 3.2, xfw, 0.4, 0], [0.2, L * 1.6, 0.01, 0, 0, 0]];
      views.forEach((v, i) => {
        cm.fov = 32; cm.position.set(v[0], v[1], v[2]); cm.lookAt(v[3], v[4], v[5]);
        if (i === 3 && c.ck && c.ck.eye && !opt.views) { const e = c.ck.eye; cm.fov = 75; cm.position.set(e.x - 0.1, e.y + 0.02, e.z); cm.lookAt(e.x + 3, e.y - 0.9, e.z + 0.6); }
        cm.updateProjectionMatrix();
        renderer.setRenderTarget(rt); renderer.render(sc, cm); renderer.readRenderTargetPixels(rt, 0, 0, TW, TH, px);
        for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const s = ((TH - 1 - y) * TW + x) * 4, o = (y * TW + x) * 4; for (let k = 0; k < 3; k++) { const vv = px[s + k] / 255; im.data[o + k] = Math.pow(vv / (vv * 0.55 + 0.45), 1 / 2.2) * 255; } im.data[o + 3] = 255; }
        g.putImageData(im, (i % 2) * TW, (i >> 1) * TH);
      });
      await fetch('_save.php?n=i_' + sp.id + (opt.tag || ''), { method: 'POST', body: cv.toDataURL('image/jpeg', 0.88) });
      const wc = c.wheels.map((w) => { let n = 0, t = 0; w.spin.traverse((o) => { if (o.isMesh) { n++; t += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } }); return n + ':' + Math.round(t); });
      out[sp.id] = Object.assign({ wheels: wc.join(' '), steer: !!c.setSteer }, c.diag || {});
      sc.remove(c.group); for (const w of c.wheels) { w.hub.rotation.y = 0; w.spin.rotation.z = 0; } if (c.setSteer) c.setSteer(0);
      if (sp.ext && G.car !== c) PC.disposeExtCar(sp);
    } catch (e) { out[sp.id] = 'HATA ' + (e && e.message); }
  }
  renderer.setRenderTarget(null); rt.dispose(); return out;
};
window.dump = async function (id, re) {
  const sp = PC.ExtCars.find((s) => s.id === id); await PC.loadExtCar(sp); const c = PC.buildExtCar(sp, null); c.group.updateMatrixWorld(true);
  const T = THREE, b = new T.Box3(), out = [], hubs = c.wheels.map((w) => w.hub.getWorldPosition(new T.Vector3()));
  c.group.traverse((o) => {
    if (!o.isMesh || !o.visible) return; let p = o, wh = false, vis = true, path = [];
    while (p) { if (p.userData && p.userData.wheel) wh = true; if (!p.visible) vis = false; if (p.name) path.push(p.name); p = p.parent; }
    if (!vis) return; b.setFromObject(o); const s = b.getSize(new T.Vector3()), ce = b.getCenter(new T.Vector3());
    const near = hubs.some((h) => Math.abs(ce.x - h.x) < sp.R + 0.3 && Math.abs(ce.z - h.z) < 0.5 && ce.y < sp.R * 2 + 0.2 && Math.max(s.x, s.y, s.z) < 1.2);
    const nm = (o.material.name || '') + ' @ ' + path.slice(0, 3).join('<');
    if (re ? re.test(nm) : near && !wh) out.push([nm, wh ? 'W' : '-', ce.toArray().map((v) => +v.toFixed(2)).join(','), s.toArray().map((v) => +v.toFixed(2)).join(','), o.material.color ? o.material.color.getHexString() : ''].join(' | '));
  });
  return 'hubs ' + hubs.map((h) => h.toArray().map((v) => +v.toFixed(2)).join(',')).join(' ; ') + '\n' + out.join('\n');
};
window.mats = async function (id) {
  const sp = PC.ExtCars.find((s) => s.id === id); await PC.loadExtCar(sp); const c = PC.buildExtCar(sp, null); const m = {};
  c.group.traverse((o) => { if (o.isMesh && o.visible) { const k = o.material.name; m[k] = (m[k] || 0) + 1; } });
  return Object.entries(m).map(([k, v]) => k + ':' + v).join('  ');
};
