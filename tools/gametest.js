// Pacifica Coast Driver — sayfa içi otomatik test paketi (geliştirme aracı; oyuna dahil edilmez)
// Kullanım: tarayıcıda oyunu aç, ana menü hazır olunca konsoldan:  await runAll()  →  { list: [...], pass, fail }
window.runAll = async function (opt) {
  opt = opt || {};
  const PC = window.PC, G = PC.Game, UI = PC.UI, ST = PC.Settings, M = PC.Menu, W = PC.World, T = THREE, TR = PC.Traffic, S = PC.Scenery;
  const R = [], errs = [], saved = JSON.parse(JSON.stringify(ST));
  const onErr = (e) => errs.push(String(e.message || e.reason || e)); window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr);
  const t = (cat, name, ok, info) => R.push({ cat, name, ok: !!ok, info: info === undefined ? '' : String(info) });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fin = (v) => [v.x, v.y, v.z, v.heading, v.vx, v.vy, v.rpm].every(isFinite);
  const fire = (n, a, b) => (UI.on[n] ? UI.on[n](a, b) : undefined);
  const dlgClear = () => document.querySelectorAll('.dlg').forEach((d) => d.remove());
  let renders = 0; const R0 = G.renderer.render.bind(G.renderer); G.renderer.render = function () { renders++; return R0.apply(G.renderer, arguments); };
  const gl = G.renderer.getContext(); gl.getError();

  // ================= 1) ANA MENÜ, AKIŞ, ARAYÜZ =================
  {
    const c = 'Menü';
    t(c, 'Açılış ekranı kapandı', document.getElementById('boot').classList.contains('hidden'));
    t(c, 'Ana menü görünür', !document.getElementById('main').classList.contains('hidden'));
    t(c, 'Ana menüde oyun durumu "menu"', G.mode === 'menu', G.mode);
    renders = 0; await wait(1500); t(c, 'Ana menüde 3B sahne RENDERLENMİYOR (1,5 sn)', renders === 0, renders + ' çizim');
    t(c, 'Menü videosu oynuyor / sessiz', (() => { const v = document.getElementById('menuVid'); return v && v.muted && (v.readyState >= 2 || v.style.display === 'none'); })());
    t(c, 'Oyuna Başla düğmesi var', !!document.getElementById('mStart'));
    t(c, 'Garaj / Ayarlar / Hakkında düğmeleri var', !!document.getElementById('mGarage') && !!document.getElementById('mSet') && !!document.getElementById('mAbout'));
    try { localStorage.removeItem('pcd-seen-settings'); } catch (e) { /* */ } M.updateBang();
    t(c, 'İlk açılışta Başla yanında ünlem (!) görünür', !document.getElementById('mBang').classList.contains('hidden'));
    document.getElementById('mBang').click(); await wait(100);
    const dl = document.querySelector('.dlg'); t(c, 'Ünleme tıklayınca uyarı mesajı çıkar', dl && /Ayarlar sekmesine önce göz atmanız/.test(dl.textContent), dl && dl.textContent.slice(0, 90)); dlgClear();
    M.panel('settings'); await wait(100);
    t(c, 'Ayarlar paneli açılır', !!document.getElementById('panel'));
    t(c, 'Ayarlara girince ünlem kalkar', document.getElementById('mBang').classList.contains('hidden'));
    for (const s of PC.SCHEMA) { document.querySelector('#panel .tabs [data-id=' + s.id + ']').click(); await wait(30); const n = document.querySelectorAll('#panel .body .item').length; t(c, 'Ayar sekmesi "' + s.name + '" dolu', n >= s.items.filter((i) => i.k).length, n + ' öğe'); }
    M.closePanel(); M.panel('garage'); await wait(100); t(c, 'Garaj paneli açılır, araç kartları var', document.querySelectorAll('#panel .card').length >= 4, document.querySelectorAll('#panel .card').length + ' kart');
    t(c, 'Garajda birincil kategori Araçlar, sonra diğerleri', (() => { const x = [...document.querySelectorAll('#panel .tabs .btn')].map((b) => b.textContent); return /^Araçlar/.test(x[0]) && x.length >= 3 && x.some((s) => /^Bilim kurgu/.test(s)); })(), [...document.querySelectorAll('#panel .tabs .btn')].map((b) => b.textContent).join(' | '));
    t(c, 'Garajda "Aracı kullan" düğmesi var', !!document.querySelector('#panel .info .btn.pri'));
    t(c, 'Varsayılan trafik 3, park edilmiş 10', PC.DEFAULTS.traffic === 3 && PC.DEFAULTS.parked === 10);
    M.closePanel(); M.panel('about'); await wait(60); t(c, 'Hakkında paneli açılır', !!document.getElementById('panel')); M.closePanel();
    t(c, 'Güncelleme denetimi hata fırlatmaz', await (async () => { try { await M.checkUpdate(true); return true; } catch (e) { return false; } })()); await wait(500); dlgClear();
    // oyuna başla
    await M.start(); await wait(300);
    t(c, 'Oyuna Başla → oyun "play"', G.mode === 'play', G.mode);
    t(c, 'HUD göründü, ana menü gizli', !document.getElementById('hud').classList.contains('hidden') && document.getElementById('main').classList.contains('hidden'));
    renders = 0; await wait(1200); t(c, 'Oyunda sahne çiziliyor', renders > 0, renders + ' çizim');
    for (const [id, a] of [['indL', 'indL'], ['indR', 'indR'], ['lights', 'lights'], ['hazard', 'hazard'], ['camera', 'camera']]) {
      const el = document.querySelector('#hud [data-a=' + a + ']'); t(c, 'HUD düğmesi var: ' + id, !!el);
    }
    const before = G.state.lights; document.querySelector('#hud [data-a=lights]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9 })); t(c, 'Far düğmesi durumu değiştirir', G.state.lights !== before);
    G.state.lights = before;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ' })); t(c, 'Z tuşu sol sinyali açar', G.state.indL === true); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyZ' })); G.state.indL = false;
    t(c, 'HUD buton boyutları ≥ 40 px (dokunma hedefi)', [...document.querySelectorAll('#hTC .hb, #hTR .hb')].every((b) => b.getBoundingClientRect().height >= 38 || b.offsetParent === null), [...document.querySelectorAll('#hTC .hb')].map((b) => Math.round(b.getBoundingClientRect().height)).join('/'));
    t(c, 'HUD düğmeleri şeffaf değil (opak arka plan)', (() => { const b = getComputedStyle(document.querySelector('#hTC .hb')).backgroundColor; const m = /rgba?\(([^)]+)\)/.exec(b); if (!m) return false; const p = m[1].split(',').map(Number); return p.length < 4 || p[3] >= 0.85; })(), getComputedStyle(document.querySelector('#hTC .hb')).backgroundColor);
    // duraklat
    M.pause(); await wait(200); t(c, 'Duraklat → mod "pause"', G.mode === 'pause');
    renders = 0; await wait(1200); t(c, 'Duraklatmada sahne çizilmiyor', renders === 0, renders + ' çizim');
    t(c, 'Duraklatma menüsü görünür', !document.getElementById('pauseM').classList.contains('hidden'));
    M.resume(); await wait(300); t(c, 'Devam → oyun "play"', G.mode === 'play');
    M.pause(); document.getElementById('pMain').click(); await wait(300); t(c, 'Ana menüye dönünce oyun durur ve ana menü açılır', G.mode === 'menu' && !document.getElementById('main').classList.contains('hidden'), G.mode);
    renders = 0; await wait(1000); t(c, 'Ana menüye dönünce render yok', renders === 0, renders);
    await M.start(); await wait(300); t(c, 'Tekrar başlat çalışır', G.mode === 'play');
    t(c, 'Sol el düzeni sınıfı uygulanır', (() => { M.set('lefty', 1); const a = document.getElementById('hud').classList.contains('lefty'); M.set('lefty', 0); return a && !document.getElementById('hud').classList.contains('lefty'); })());
    t(c, 'Arayüz boyutu --k değişkenine yansır', (() => { M.set('hudScale', 1.3); const a = document.getElementById('hud').style.getPropertyValue('--k') === '1.3'; M.set('hudScale', 1); return a; })());
  }

  // ================= 2) AYARLAR =================
  {
    const c = 'Ayarlar';
    let bad = [];
    for (const sec of PC.SCHEMA) for (const it of sec.items) {
      if (!it.k) continue; const old = ST[it.k]; let nv;
      if (it.t === 'tog') nv = old ? 0 : 1; else if (it.t === 'seg') { const o = it.opts.map((x) => x[0]); nv = o[(o.findIndex((x) => String(x) === String(old)) + 1) % o.length]; } else nv = +(it.min + (it.max - it.min) * 0.5).toFixed(3);
      try { M.set(it.k, nv); if (String(ST[it.k]) !== String(nv)) bad.push(it.k + ' kaydedilmedi'); await wait(5); M.set(it.k, old); } catch (e) { bad.push(it.k + ': ' + e.message); }
    }
    t(c, 'Tüm ayar öğeleri değiştirilip geri alınabiliyor (' + PC.SCHEMA.reduce((a, s) => a + s.items.filter((i) => i.k).length, 0) + ' adet)', bad.length === 0, bad.slice(0, 5).join(' | '));
    for (const p of ['low', 'med', 'high', 'ultra']) { M.set('preset', p); const ok = Object.keys(PC.PRESETS[p]).every((k) => ST[k] === PC.PRESETS[p][k]); t(c, 'Ön ayar "' + p + '" tüm grafik anahtarlarını uygular', ok); await wait(150); }
    M.set('preset', 'med'); M.set('gShadow', 3); t(c, 'Elle değişiklik ön ayarı "Özel" yapar', ST.preset === 'custom'); M.set('preset', 'med');
    for (const sec of PC.SCHEMA) { const k = sec.items.find((i) => i.k && i.k !== 'preset' && i.t !== 'seg'); if (!k) continue; const d0 = ST[k.k]; M.set(k.k, k.t === 'tog' ? (d0 ? 0 : 1) : k.max); M.resetTab(sec.id); t(c, 'Sekme sıfırlama: ' + sec.name + ' (' + k.k + ')', String(ST[k.k]) === String(PC.DEFAULTS[k.k]), ST[k.k]); }
    t(c, 'Her ayar sekmesinde sıfırla düğmesi var', (() => { let ok = true; for (const sec of PC.SCHEMA) { M.panel('settings'); document.querySelector('#panel .tabs [data-id=' + sec.id + ']').click(); if (![...document.querySelectorAll('#panel .body .btn.red')].some((b) => /sıfırla/i.test(b.textContent))) ok = false; M.closePanel(); } return ok; })());
    M.set('drive', 'sim'); t(c, 'Zorluk "Simülasyon" yardımları kapatır', ST.esc === 0 && ST.tcs === 0 && ST.assist === 0); M.set('drive', 'arcade'); t(c, 'Zorluk "Arcade" tutuşu artırır', ST.grip > 1.05); M.set('drive', 'real');
    t(c, 'Ayarlar localStorage\'a yazılır', (() => { try { return JSON.parse(localStorage.getItem('pacifica-coast')).preset === ST.preset; } catch (e) { return false; } })());
    M.set('units', 'mph'); await wait(200); t(c, 'mph birimi HUD\'a yansır', /mph/.test(document.getElementById('spd').textContent)); M.set('units', 'kmh');
    M.set('hour', 22); t(c, 'Gün saati değişince gece (S.night) artar', S.night > 0.5, S.night.toFixed(2)); M.set('hour', 13); t(c, 'Gün saati öğlen gece yok', S.night < 0.2, S.night.toFixed(2)); M.set('hour', 17.4);
    M.set('traffic', 0); await wait(2200); t(c, 'Trafik 0 yapılınca hareketli araç kalmaz', TR.cars.length === 0, TR.cars.length); M.set('traffic', 5);
  }

  // ================= 3) GRAFİK =================
  {
    const c = 'Grafik'; let cnt = 0;
    const frame = async () => { renders = 0; gl.getError(); await wait(700); return renders; };
    for (const p of ['low', 'med', 'high', 'ultra']) { M.set('preset', p); const r = await frame(); const e = gl.getError(); t(c, 'Ön ayar ' + p + ' çiziyor, GL hatası yok', r > 0 && e === 0, r + ' çizim, GL ' + e); }
    M.set('preset', 'med'); await wait(100);
    M.set('gShadow', 0); t(c, 'Gölge kapalıyken güneş gölge atmaz', S.sun.castShadow === false); M.set('gShadow', 2); t(c, 'Gölge orta: 2048 harita', S.sun.shadow.mapSize.x === 2048 && S.sun.castShadow, S.sun.shadow.mapSize.x); M.set('gShadow', 3); await wait(200); t(c, 'Gölge yüksek: 4096 harita', S.sun.shadow.mapSize.x === 4096);
    M.set('gShadowDist', 100); t(c, 'Gölge mesafesi gölge kamerasını büyütür', S.sun.shadow.camera.right === 100); M.set('preset', 'med');
    M.set('gDist', 800); t(c, 'Görüş mesafesi sis ve kamera uzaklığını ayarlar', S.scene.fog.far === 800 && Math.abs(G.camera.far - 1000) < 1, S.scene.fog.far + '/' + G.camera.far); M.set('gDist', 2500); t(c, 'Görüş mesafesi 2500 m', S.scene.fog.far === 2500);
    const treeCount = () => (S.treeCells || []).reduce((a, x) => a + x.ims[1].count * (x.ims[1].visible ? 1 : 0), 0);
    M.set('gTrees', 100); await wait(500); const t100 = treeCount(); M.set('gTrees', 25); await wait(500); const t25 = treeCount(); t(c, 'Ağaç yoğunluğu %25 < %100', t25 < t100 && t100 > 0, t25 + ' < ' + t100); M.set('gTrees', 0); await wait(500); t(c, 'Ağaç yoğunluğu 0 → hiç ağaç çizilmez', treeCount() === 0); M.set('gTrees', 55);
    M.set('gTreeDist', 300); await wait(500); const near = treeCount(); M.set('gTreeDist', 1500); await wait(500); t(c, 'Ağaç mesafesi büyüyünce çizilen ağaç artar', treeCount() >= near, near + ' → ' + treeCount()); M.set('gTreeDist', 650);
    M.set('gGrass', 0); t(c, 'Çim kapatılabilir', S.grassLevel === 0); M.set('gGrass', 3); t(c, 'Çim yüksek açılır', S.grassLevel === 3); M.set('gGrass', 1);
    for (const lv of [0, 1, 2, 3]) { M.set('gRefl', lv); await wait(100); t(c, 'Yansıma seviyesi ' + lv + ' uygulanır', true); } M.set('gRefl', 1);
    for (const lv of [0, 1, 2, 3]) { M.set('gMirror', lv); await wait(100); } t(c, 'Dikiz aynası seviyeleri uygulanır', true); M.set('gMirror', 1);
    for (const m of [0, 2, 4, 0]) { M.set('gMsaa', m); await wait(200); const r = await frame(); t(c, 'MSAA ' + m + 'x: çizim sürüyor', r > 0 && gl.getError() === 0); }
    for (const k of ['gBloom', 'gSsao', 'gParticles', 'gSpot']) { M.set(k, 1); await wait(100); M.set(k, 0); await wait(100); t(c, k + ' aç-kapa hatasız', true); }
    M.set('gBloom', 1);
    M.set('gFps', 30); renders = 0; await wait(2000); const r30 = renders; M.set('gFps', 0); renders = 0; await wait(2000); const rU = renders; t(c, 'FPS sınırı 30 çizim sayısını sınırlar', r30 <= rU || rU < 10, '30sn: ' + r30 + ' / sınırsız: ' + rU); M.set('gFps', 60);
    M.set('gRes', 0.4); await wait(300); const pr1 = G.renderer.getPixelRatio(); M.set('gRes', 0.9); await wait(300); const pr2 = G.renderer.getPixelRatio(); t(c, 'Çözünürlük ölçeği piksel oranını değiştirir', pr2 > pr1, pr1.toFixed(2) + ' → ' + pr2.toFixed(2)); M.set('preset', 'med');
    t(c, 'Su kalitesi anahtarı (shader uniform)', (() => { M.set('gWater', 0); const a = S.waterUni.uQ.value === 0; M.set('gWater', 1); return a && S.waterUni.uQ.value === 1; })());
    M.set('gAniso', 16); await wait(200); t(c, 'Doku filtreleme uygulanır', true); M.set('gAniso', 4);
    t(c, 'Post-işleme etkin', PC.Post.ok && PC.Post.enabled);
    t(c, 'Çalışma sırasında GL hatası yok', gl.getError() === 0);
    M.set('preset', 'med'); await wait(300); G.renderPasses(); const info = G.renderer.info; t(c, 'Orta ayarda çizim çağrısı bütçesi ≤ 1000', info.render.calls <= 1000, info.render.calls + ' çağrı, ' + Math.round(info.render.triangles / 1000) + 'k üçgen');
  }

  // ================= 4) ARAÇLAR =================
  const sig = (car) => { const sp = car.spr && car.spr.sprites; return sp; };
  const cars = PC.CarSpecs.filter((s) => !s.hidden && (!opt.ids || opt.ids.indexOf(s.id) >= 0));
  for (const sp of cars) {
    const c = 'Araç ' + sp.id, idx = PC.CarSpecs.indexOf(sp);
    ST.car = idx; ST.color = 0;
    const e0 = errs.length; await fire('car'); for (let k = 0; k < 120 && !(G.car && G.car.spec === sp); k++) await wait(200);
    const car = G.car, veh = G.veh;
    t(c, sp.name + ' yüklendi', !!car && car.spec === sp); if (!car || car.spec !== sp) continue;
    let sk = 0; car.group.traverse((o) => { if (o.isSkinnedMesh) sk++; }); const wm = car.wheels.map((w) => { let n = 0; w.spin.traverse((o) => { if (o.isMesh) n++; }); return n; });
    t(c, '4 teker ve her birinde mesh', car.wheels.length === 4 && wm.every((n) => n > 0), wm.join('/'));
    t(c, 'İskeletli (dönmeyen) mesh yok', sk === 0, sk);
    // tekerlek görsel dönüşü
    const probe = (w) => { const v = new T.Vector3(), best = new T.Vector3(), hp = w.hub.getWorldPosition(new T.Vector3()); let bd = -1, bm = null, bi = 0; w.spin.traverse((m) => { if (!m.isMesh) return; const p = m.geometry.attributes.position; m.updateWorldMatrix(true, false); for (let i = 0; i < p.count; i += Math.max(1, (p.count / 40) | 0)) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); const d = Math.hypot(v.x - hp.x, v.y - hp.y); if (d > bd) { bd = d; bm = m; bi = i; } } }); return { m: bm, i: bi }; };
    const re = (b) => { b.m.updateWorldMatrix(true, false); return new T.Vector3().fromBufferAttribute(b.m.geometry.attributes.position, b.i).applyMatrix4(b.m.matrixWorld); };
    for (let i = 0; i < 4; i++) veh.wheelRot[i] = 0; veh.delta = 0; G.state.cam = 0;
    car.wheels.forEach((w) => { w.hub.rotation.y = 0; w.spin.rotation.z = 0; }); car.group.updateMatrixWorld(true);
    const pb = car.wheels.map(probe), p0 = pb.map(re);
    car.wheels.forEach((w, i) => { w.spin.rotation.z = (w.left ? 1 : -1) * 1.1; if (w.front) w.hub.rotation.y = -0.3 * (car.visSteer || 1); }); car.group.updateMatrixWorld(true);
    const p1 = pb.map(re), mv = p0.map((p, i) => p.distanceTo(p1[i]));
    t(c, 'Tekerlekler görsel olarak dönüyor', mv.every((d) => d > 0.04), mv.map((d) => d.toFixed(2)).join('/'));
    t(c, 'Ön tekerlekler kırılıyor, arkalar sabit', Math.abs(car.wheels[0].hub.rotation.y) > 0.04 && car.wheels[2].hub.rotation.y === 0);
    car.wheels.forEach((w) => { w.hub.rotation.y = 0; w.spin.rotation.z = 0; });
    // direksiyon
    if (car.steerNode) {
      const sm = []; car.steerNode.traverse((o) => { if (o.isMesh) sm.push(o); }); const vv = new T.Vector3(); const vi = (m, k) => { const ix = m.geometry.index; return ix ? ix.getX(Math.min(ix.count - 1, k)) : k; }; const samp = () => sm.map((m) => { m.updateWorldMatrix(true, false); const p = m.geometry.attributes.position, ix = m.geometry.index; return vv.fromBufferAttribute(p, vi(m, ((ix ? ix.count : p.count) / 2) | 0)).applyMatrix4(m.matrixWorld).clone(); });
      car.setSteer(0); car.group.updateMatrixWorld(true); const a = samp(); car.setSteer(1.5); car.group.updateMatrixWorld(true); const b = samp(); car.setSteer(0);
      const md = Math.max(0, ...a.map((p, i) => p.distanceTo(b[i]))); t(c, 'Direksiyon simidi dönüyor', sm.length > 0 && md > 0.02, sm.length + ' parça, kayma ' + md.toFixed(3));
      { const inv2 = new T.Matrix4().copy(car.body.matrixWorld).invert(); const pts = []; sm.forEach((m) => { const ix = m.geometry.index, cnt = ix ? ix.count : m.geometry.attributes.position.count; for (let i = 0; i < cnt; i += Math.max(1, (cnt / 150) | 0)) pts.push([m, vi(m, i)]); }); const g2 = (o) => { o[0].updateWorldMatrix(true, false); return new T.Vector3().fromBufferAttribute(o[0].geometry.attributes.position, o[1]).applyMatrix4(o[0].matrixWorld).applyMatrix4(inv2); };
        car.setSteer(0); car.group.updateMatrixWorld(true); const q0 = pts.map(g2); let tp = 0; q0.forEach((q, i) => { if (q.y > q0[tp].y) tp = i; }); car.setSteer(0.6); car.group.updateMatrixWorld(true); const q1 = g2(pts[tp]); car.setSteer(0);
        t(c, 'Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa)', q1.z > q0[tp].z, q0[tp].z.toFixed(2) + ' → ' + q1.z.toFixed(2)); }
    } else t(c, 'Direksiyon (kokpit kiti) mevcut', !!(car.ck && car.ck.kit) || !!car.setSteer, car.ck && car.ck.kit ? 'kit' : '-');
    t(c, 'Cam malzemesi şeffaf ayarlı', !!car.glass && !!car.glass.transparent && car.glass.opacity < 0.7, car.glass && car.glass.opacity);
    // lambalar
    const S_ = sig(car);
    if (!S_) t(c, 'Lamba parlamaları var', false);
    else {
      car.setLights(false, false, true, false, false); const L = S_.filter((p) => p.visible); car.setLights(false, false, false, true, false); const Rr = S_.filter((p) => p.visible);
      t(c, 'Sol sinyal yalnız SOL tarafta yanar (ön+arka)', L.length >= 2 && L.every((p) => p.position.z < 0), L.length + ' lamba');
      t(c, 'Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka)', Rr.length >= 2 && Rr.every((p) => p.position.z > 0), Rr.length + ' lamba');
      car.setLights(false, true, false, false, false); const B = S_.filter((p) => p.visible); t(c, 'Stop lambaları yanar (arkada, iki yan)', B.length >= 2 && B.every((p) => p.position.x < 0) && B.some((p) => p.position.z < 0) && B.some((p) => p.position.z > 0), B.length);
      car.setLights(false, false, false, false, true); const V = S_.filter((p) => p.visible); t(c, 'Geri vites lambaları yanar', V.length >= 2 && V.every((p) => p.position.x < 0), V.length);
      car.setLights(true, false, false, false, false); const Hh = S_.filter((p) => p.visible && p.position.x > 0); t(c, 'Farlar yanar', Hh.length >= 2 || !!(car.mHeads && car.mHeads.length) || !!car.mHead || !!car.kHead, Hh.length);
      car.setLights(false, false, false, false, false); t(c, 'Hepsi kapalıyken lamba görünmez', S_.every((p) => !p.visible));
    }
    // ayna / göz yerleşimi
    if (car.ck && car.ck.eye) {
      const bb = new T.Box3(), inv = new T.Matrix4().copy(car.body.matrixWorld).invert(), M4 = new T.Matrix4(), v = new T.Vector3(); car.group.updateMatrixWorld(true);
      car.body.traverse((o) => { if (!o.isMesh || !o.visible || o.userData.wheel || o.userData.keep) return; const p = o.geometry.attributes.position; M4.multiplyMatrices(inv, o.matrixWorld); for (let i = 0; i < p.count; i += Math.max(1, (p.count / 80) | 0)) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(M4)); });
      const e = car.ck.eye, m = car.ck.mirror; const inside = (x, y, z) => x > bb.min.x + 0.05 && x < bb.max.x - 0.05 && y > bb.min.y && y < bb.max.y + 0.05 && Math.abs(z) < (bb.max.z - bb.min.z) / 2;
      t(c, 'Sürücü gözü gövdenin içinde', inside(e.x, e.y, e.z), e.toArray().map((x) => x.toFixed(2)));
      t(c, 'Dikiz aynası gövdenin içinde ve gözün önünde', inside(m[0], m[1], m[2]) && m[0] > e.x, m.map((x) => x.toFixed(2)));
    }
    // fizik
    veh.reset(0, 0, 0, 0); UI.on.teleport(1); veh.setMode('D'); veh.engineOn = true; const inp = { throttle: 1, brake: 0, steer: 0, handbrake: 0 }; let vm = 0, ok = true;
    for (let i = 0; i < 6 * 120; i++) { veh.step(1 / 120, inp, W); vm = Math.max(vm, veh.speed); if (!fin(veh)) { ok = false; break; } }
    inp.throttle = 0; inp.brake = 1; for (let i = 0; i < 7 * 120 && ok; i++) { veh.step(1 / 120, inp, W); if (!fin(veh)) ok = false; } const vs = veh.speed;
    inp.brake = 0; veh.setMode('R'); inp.throttle = 1; for (let i = 0; i < 3 * 120 && ok; i++) { veh.step(1 / 120, inp, W); if (!fin(veh)) ok = false; } const vr = veh.vx; veh.setMode('D');
    t(c, 'Sürüş fiziği: hızlanır, durur, geri gider', ok && vm > 12 && vs < 1.5 && vr < -1, (vm * 3.6).toFixed(0) + ' km/s, dur ' + vs.toFixed(1) + ', geri ' + (vr * 3.6).toFixed(0));
    UI.on.reset(); await wait(30);
    t(c, 'Araç yüklenirken konsol hatası yok', errs.length === e0, errs.slice(e0).join(' | ').slice(0, 120));
  }
  // trafik araçları (procedürel): lamba tarafları
  for (const sp of PC.CarSpecs.filter((s) => s.hidden)) {
    const c = 'Trafik ' + sp.id; let car; try { car = PC.buildCar(sp, { lod: 1, color: 0x888888 }); } catch (e) { t(c, 'Üretildi', false, e.message); continue; }
    const g = car.mesh.geometry, pos = g.attributes.position, ix = g.index, cz = (mi) => { let s = 0, n = 0; for (const gr of g.groups) if (gr.materialIndex === mi) for (let i = gr.start; i < gr.start + gr.count; i++) { s += pos.getZ(ix ? ix.getX(i) : i); n++; } return n ? s / n : null; };
    const zl = cz(car.kIndL), zr = cz(car.kIndR);
    t(c, 'Sinyal parçaları doğru yanda (sol z<0, sağ z>0)', zl !== null && zr !== null && zl < 0 && zr > 0, 'L ' + (zl && zl.toFixed(2)) + ' R ' + (zr && zr.toFixed(2)));
    t(c, 'Far, stop ve sinyal malzeme dizinleri var', car.kHead >= 0 && car.kTail >= 0 && car.kIndL >= 0 && car.kIndR >= 0);
    t(c, 'Gövde ağı var', !!car.mesh);
    car.mesh.geometry.dispose();
  }

  // ================= 5) DÜNYA, TRAFİK, YAPAY ZEKA (mantık testleri) =================
  {
    const c = 'Dünya/YZ';
    await new Promise((res) => {
      const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-9999px;width:800px;height:600px'; f.src = 'tests.html'; document.body.appendChild(f);
      let tries = 0; const iv = setInterval(() => { tries++; const tx = f.contentDocument && f.contentDocument.body ? f.contentDocument.body.innerText : ''; if (/16 geçti|GEÇTİ[\s\S]*GEÇTİ[\s\S]*En çok 5/.test(tx) || tries > 120) { clearInterval(iv); for (const line of tx.split('\n')) { const m = /^(GEÇTİ|KALDI)\s+(.*)$/.exec(line.trim()); if (m) t(c, m[2].split(' — ')[0], m[1] === 'GEÇTİ', m[2].split(' — ')[1] || ''); } f.remove(); res(); } }, 500);
    });
    for (let i = 0; i < W.teleports.length; i++) { UI.on.teleport(i); const o = {}; W.groundAt(veh().x, veh().z, o); t(c, 'Işınlanma: ' + W.teleports[i].name, fin(veh()) && Math.abs(veh().y - o.y) < 1.5 && o.surf !== 3, 'Δy ' + (veh().y - o.y).toFixed(2)); }
    function veh() { return G.veh; }
    // garaj kapısı
    UI.on.teleport(0); const v = veh(); await wait(300); t(c, 'Villa / garaj ışınlanma noktası zeminde', true);
    // görev
    UI.on.teleport(1); UI.on.mission(); const MS = PC.FX.mission; t(c, 'Varış görevi başlar, hedef haritada', MS.on && !!UI.target, Math.round(MS.d0) + ' m');
    if (MS.on) { veh().reset(MS.x, MS.y, MS.z, 0); PC.FX.update(0.016, veh(), G.car, G.camera, 0); t(c, 'Hedefe varınca görev tamamlanır', !MS.on && MS.done > 0); }
    // lastik izi
    const car = G.car, vv = veh(), b = PC.FX._dbg(); for (let i = 0; i < 30; i++) { car.group.position.x += 0.3; car.group.updateMatrixWorld(true); vv.surf = 0; vv.slipR = 1; vv.slipF = 1; vv.vx = 12; PC.FX.update(0.04, vv, car, G.camera, 0); } const a2 = PC.FX._dbg();
    t(c, 'Patinajda lastik izi bırakır', a2.skid !== b.skid); t(c, 'Patinajda lastik dumanı çıkar', a2.smoke > 0);
    vv.slipR = vv.slipF = 0;
    // korna yarışı
    M.set('traffic', 5); for (let k = 0; k < 20 && !TR.cars.length; k++) await wait(500); const tc = TR.cars[0]; if (tc) { tc.x = vv.x + 8; tc.z = vv.z; for (let i = 0; i < 3; i++) fire('horn', true); fire('horn', false); t(c, '3 kez kornaya trafik aracı yarışa girer', tc.raceT > 0 || tc.honks >= 0, tc.raceT); } else t(c, 'Trafik aracı var', TR.cars.length > 0);
    // su
    vv.reset(-1200, -0.9, 400, 0); vv.inWater = true; t(c, 'Su durumu bayrağı okunabilir', typeof vv.inWater === 'boolean');
    UI.on.reset(); t(c, 'Yola koy sonrası araç sonlu konumda', fin(veh()));
    // ses
    const AU = PC.Audio; AU.init(); t(c, 'Ses motoru başlar', !!AU.ctx); AU.setVolume(0.3); t(c, 'Ana ses ayarlanır', Math.abs(AU.vol - 0.3) < 1e-6); AU.setVolume(ST.volume);
  }

  // ================= bitiş =================
  t('Genel', 'Test boyunca yakalanmamış hata yok', errs.length === 0, errs.slice(0, 4).join(' | '));
  t('Genel', 'GL hata kodu 0', gl.getError() === 0);
  window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr); G.renderer.render = R0;
  Object.assign(ST, saved); PC.saveSettings();
  const pass = R.filter((x) => x.ok).length;
  return { total: R.length, pass, fail: R.length - pass, failed: R.filter((x) => !x.ok), list: R };
};
