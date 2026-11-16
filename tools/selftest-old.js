// geliştirme aracı: oyunun tamamını sayfa içinde dener, rapor döndürür (dağıtıma girmez)
window.selfTest = async function (opt) {
  opt = opt || {};
  const G = PC.Game, UI = PC.UI, W = PC.World, ST = PC.Settings, T = THREE, R = [], errs = [];
  const onErr = (e) => errs.push(String(e.message || e.reason || e)); window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
  const ok = (name, cond, info) => R.push((cond ? 'OK   ' : 'HATA ') + name + (info !== undefined ? ' — ' + info : ''));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frames = async (n) => { for (let i = 0; i < n; i++) await new Promise((r) => { let d = false; requestAnimationFrame(() => { d = true; r(); }); setTimeout(() => { if (!d) r(); }, 2500); }); };
  const fin = (v) => [v.x, v.y, v.z, v.heading, v.vx, v.vy, v.rpm].every(isFinite);
  const H = 1 / 120;
  UI.openMenu();
  const cars = PC.CarSpecs.map((s, i) => [s, i]).filter((p) => !p[0].hidden && (!opt.ids || opt.ids.indexOf(p[0].id) >= 0));
  ok('menüde yalnız kategorili araçlar', cars.length === PC.CarSpecs.filter((s) => !s.body).length && cars.every((p) => p[0].cat), cars.length + ' araç');
  for (const [sp, idx] of cars) {
    ST.car = idx; ST.color = 0; UI.on.car();
    for (let k = 0; k < 120 && !(G.car && G.car.spec === sp); k++) await wait(250);
    const car = G.car, veh = G.veh, id = sp.id;
    if (!car || car.spec !== sp) { ok(id + ' yükleme', false, 'yüklenmedi'); continue; }
    let sk = 0, wm = []; car.group.traverse((o) => { if (o.isSkinnedMesh) sk++; });
    for (const w of car.wheels) { let n = 0; w.spin.traverse((o) => { if (o.isMesh) n++; }); wm.push(n); }
    ok(id + ' teker ağları', car.wheels.length === 4 && wm.every((n) => n > 0) && sk === 0, wm.join('/') + (sk ? ' iskeletli:' + sk : ''));
    // görsel dönüş: bir karede tekerlek ağı gerçekten yer değiştiriyor mu
    const probe = (w) => { const v = new T.Vector3(), best = new T.Vector3(), hp = w.hub.getWorldPosition(new T.Vector3()); let bd = -1; w.spin.traverse((m) => { if (!m.isMesh) return; const p = m.geometry.attributes.position, ix = m.geometry.index, cnt = ix ? ix.count : p.count; m.updateWorldMatrix(true, false); for (let i = 0; i < cnt; i += Math.max(1, (cnt / 40) | 0)) { v.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(m.matrixWorld); const d = Math.hypot(v.x - hp.x, v.y - hp.y); if (d > bd) { bd = d; best.copy(v); best.userData = [m, ix ? ix.getX(i) : i]; } } }); return best; };
    const reprobe = (b) => { const m = b.userData[0]; m.updateWorldMatrix(true, false); return new T.Vector3().fromBufferAttribute(m.geometry.attributes.position, b.userData[1]).applyMatrix4(m.matrixWorld); };
    veh.wheelRot[0] = veh.wheelRot[1] = veh.wheelRot[2] = veh.wheelRot[3] = 0; veh.delta = 0; await frames(2); car.group.updateMatrixWorld(true);
    const a0 = car.wheels.map(probe);
    for (let i = 0; i < 4; i++) veh.wheelRot[i] = 1.1; veh.delta = 0.3; await frames(2); car.group.updateMatrixWorld(true);
    const a1 = a0.map(reprobe), mv = a0.map((p, i) => p.distanceTo(a1[i]));
    ok(id + ' tekerler dönüyor', mv.every((d) => d > 0.05), mv.map((d) => d.toFixed(2)).join('/'));
    ok(id + ' ön teker kırılıyor', Math.abs(car.wheels[0].hub.rotation.y) > 0.05 && Math.abs(car.wheels[2].hub.rotation.y) < 1e-6, car.wheels[0].hub.rotation.y.toFixed(2));
    veh.delta = 0;
    ok(id + ' cam', !!(car.glass && car.glass.userData.glassy && car.glass.transparent), car.glass ? car.glass.name + ' op ' + car.glass.opacity : '-');
    let lt = true; try { car.setLights(true, true, true, false, true); car.setLights(false, false, false, false, false); } catch (e) { lt = false; errs.push(id + ' ışık: ' + e.message); } ok(id + ' ışıklar', lt);
    ok(id + ' direksiyon simidi', !!car.setSteer || !!(car.ck && car.ck.kit), car.setSteer ? 'model' : 'kit');
    // fizik: hızlan, fren, geri vites
    UI.on.teleport(1); veh.startEngine && veh.startEngine(); veh.engineOn = true; veh.setMode('D');
    const inp = { throttle: 1, brake: 0, steer: 0, handbrake: 0 }; let vmax = 0, good = true;
    for (let i = 0; i < 6 * 120; i++) { veh.step(H, inp, W); vmax = Math.max(vmax, veh.speed); if (!fin(veh)) { good = false; break; } }
    inp.throttle = 0; inp.brake = 1; for (let i = 0; i < 7 * 120 && good; i++) { veh.step(H, inp, W); if (!fin(veh)) good = false; }
    const vstop = veh.speed;
    inp.brake = 0; veh.setMode('R'); inp.throttle = 1; for (let i = 0; i < 3 * 120 && good; i++) { veh.step(H, inp, W); if (!fin(veh)) good = false; }
    const vrev = veh.vx; veh.setMode('D');
    inp.throttle = 0.6; inp.steer = 0.6; for (let i = 0; i < 5 * 120 && good; i++) { veh.step(H, inp, W); if (!fin(veh)) good = false; }
    ok(id + ' fizik', good && vmax > 12 && vstop < 1.5 && vrev < -1, '6 sn: ' + (vmax * 3.6).toFixed(0) + ' km/s, fren sonrası ' + vstop.toFixed(1) + ' m/s, geri ' + (vrev * 3.6).toFixed(0) + ' km/s');
    veh.vx = veh.vy = veh.r = 0; UI.on.reset();
    await frames(1);
  }
  const veh = G.veh, car = G.car;
  // ışınlanma
  for (let i = 0; i < W.teleports.length; i++) { UI.on.teleport(i); const o = {}; W.groundAt(veh.x, veh.z, o); ok('ışınlanma: ' + W.teleports[i].name, fin(veh) && Math.abs(veh.y - o.y) < 1.5 && o.surf !== 3, 'y farkı ' + (veh.y - o.y).toFixed(2) + ' zemin ' + o.surf); await frames(1); }
  // saat
  let tOk = true; for (let h = 0; h <= 24; h += 2) { try { UI.on.setting('hour', h); await frames(1); } catch (e) { tOk = false; errs.push('saat ' + h + ': ' + e.message); } } UI.on.setting('hour', ST.hour); ok('gün saati 0–24', tOk);
  // kalite
  const q0 = ST.quality; for (const q of ['low', 'med', 'high', 'ultra']) { ST.quality = q; let g = true; try { UI.on.setting('quality', q); await frames(2); } catch (e) { g = false; errs.push('kalite ' + q + ': ' + e.message); } ok('kalite ' + q, g); } ST.quality = q0; UI.on.setting('quality', q0);
  for (const k of ['post', 'shadows']) { const v0 = ST[k]; ST[k] = 0; UI.on.setting(k, 0); await frames(2); ST[k] = 1; UI.on.setting(k, 1); await frames(1); ST[k] = v0; UI.on.setting(k, v0); } ok('shader / gölge aç-kapa', true);
  // kameralar (menü kapalı)
  UI.closeMenu(); let cOk = true; for (let i = 0; i < 4; i++) { try { UI.on.camera(); await frames(3); } catch (e) { cOk = false; errs.push('kamera: ' + e.message); } } ok('4 kamera modu', cOk && [G.camera.position.x, G.camera.position.y, G.camera.position.z].every(isFinite));
  // lastik izi + duman
  UI.on.teleport(1); await frames(1);
  const FX = PC.FX, sk = FX && FX._dbg ? FX._dbg() : null;
  if (FX) {
    veh.surf = 0; veh.slipR = 1; veh.slipF = 1; veh.vx = 12; const b = FX._dbg();
    for (let i = 0; i < 30; i++) { car.group.position.x += 0.3; car.group.updateMatrixWorld(true); veh.surf = 0; veh.slipR = 1; veh.slipF = 1; veh.vx = 12; FX.update(0.04, veh, car, G.camera, 0); }
    const a = FX._dbg(); ok('lastik izi', a.skid !== b.skid, b.skid + ' → ' + a.skid); ok('lastik dumanı', a.smoke > 0, a.smoke + ' parçacık');
    veh.slipR = veh.slipF = 0;
    // görev
    UI.on.mission(); const M = FX.mission; ok('görev başlıyor', M.on && isFinite(M.x) && !!UI.target, Math.round(M.d0) + ' m');
    if (M.on) { veh.reset(M.x, M.y, M.z, 0); FX.update(0.016, veh, car, G.camera, 0); ok('görev varışta bitiyor', !M.on && M.done > 0 && !UI.target); }
    UI.on.mission(); UI.on.mission(); ok('görev iptal', !M.on);
  }
  UI.on.reset(); UI.openMenu(); await frames(2);
  window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr);
  ok('çalışma hatası yok', errs.length === 0, errs.slice(0, 6).join(' | '));
  void sk;
  return R.filter((l) => opt.all || /^HATA/.test(l)).join('\n') + '\n' + R.filter((l) => /^OK/.test(l)).length + ' geçti / ' + R.filter((l) => /^HATA/.test(l)).length + ' hata';
};
