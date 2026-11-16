// Pacifica Coast — oyun döngüsü, kameralar, yansımalar, kalite yönetimi
(function () {
  'use strict';
  const PC = window.PC, U = PC.U, T = THREE, ST = PC.Settings, UI = PC.UI, W = PC.World, S = PC.Scenery, TR = PC.Traffic, AU = PC.Audio;
  const G = (PC.Game = {});
  const H = 1 / 120, CAMS = ['Takip kamerası', 'Kokpit', 'Kaput', 'Serbest kamera'];
  let renderer, scene, camera, veh, car, ck, cubeRT, cubeCam, cubeSize = 0, pr = 1, maxPr = 1, minPr = 0.6, frameN = 0, face = 0, acc = 0, lastDraw = 0, raf = 0, upT = 0;
  let graceT = 0; // oyuna girişteki ilk saniyelerde dinamik çözünürlük ve otomatik ayar çalışmaz (yükleme takılmaları FPS'i yanlış gösterir)
  let camH = 0, orbit = 0.6, waterT = 0, histT = 0, blinkT = 0, fpsT = 0, fpsN = 0, lowT = 0, lastBlink = false, firstStart = true;
  const ENVF = [0, 4, 2, 1], MIRF = [0, 4, 3, 2], MIRS = [[2, 2], [384, 112], [576, 168], [768, 224]], CUBE = [64, 128, 256, 256], SHAD = [0, 1024, 2048, 4096];
  const nextFrame = () => new Promise((r) => setTimeout(r, 20));
  G.mode = 'boot';
  const state = (G.state = { lights: false, indL: false, indR: false, blink: false, handbrake: false, slowmo: false, cam: 0, rewind: false });
  const hist = [], player = { x: 0, z: 0, heading: 0, vxw: 0, vzw: 0, speed: 0, width: 1.9, len: 4.6 };
  const spots = [], inp = { throttle: 0, brake: 0, steer: 0, handbrake: 0 };
  const _v = new T.Vector3(), _v2 = new T.Vector3(), _q = new T.Quaternion(), _q2 = new T.Quaternion(), _e = new T.Euler();
  const _g = {};
  const QFIX = new T.Quaternion().setFromEuler(new T.Euler(0, -Math.PI / 2, 0));
  const $ = (id) => document.getElementById(id);

  let TSPECS = [];
  async function init() {
    const B = PC.Menu;
    B.bootProgress(0.04, 'Dünya oluşturuluyor…'); await nextFrame();
    TSPECS = PC.CarSpecs.filter((s) => s.body);
    for (const s of PC.CarSpecs) { if (s.body) s.hidden = true; else s.cat = s.cat || 'Bilim kurgu'; }
    await filterCars();
    if (PC.Menu.first) { const i0 = PC.CarSpecs.findIndex((s) => !s.hidden && s.cat === 'Araçlar'); if (i0 >= 0) ST.car = i0; } // ilk açılış: birincil kategori "Araçlar"
    if (!PC.CarSpecs[ST.car] || PC.CarSpecs[ST.car].hidden) ST.car = PC.CarSpecs.findIndex((s) => !s.hidden);
    W.build();
    B.bootProgress(0.18, 'Grafik motoru başlatılıyor…'); await nextFrame();
    renderer = new T.WebGLRenderer({ canvas: $('game'), antialias: false, powerPreference: 'high-performance', stencil: false });
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.info.autoReset = false; renderer.localClippingEnabled = true; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
    PC.Post.samples = ST.gMsaa; PC.Post.init(renderer);
    scene = new T.Scene(); camera = new T.PerspectiveCamera(52, 2, 0.3, 6000);
    G.renderer = renderer; G.scene = scene; G.camera = camera;
    B.bootProgress(0.3, 'Şehir, arazi ve ağaçlar kuruluyor…'); await nextFrame();
    S.build(scene, W, { aniso: Math.min(ST.gAniso, renderer.capabilities.getMaxAnisotropy()) });
    B.bootProgress(0.55, 'Arayüz ve trafik hazırlanıyor…'); await nextFrame();
    UI.build(); UI.buildMap(W);
    if (PC.FX) PC.FX.init(scene, W);
    TR.init(W, TSPECS); TR.max = ST.traffic; TR.maxParked = ST.parked; TR.aggression = ST.aggr;
    cubeCam = new T.CubeCamera(0.6, 2000, new T.WebGLCubeRenderTarget(16)); scene.add(cubeCam); cubeRT = cubeCam.renderTarget;
    for (const z of [-0.6, 0.6]) { const sp = new T.SpotLight(0xfff1d6, 0, 110, 0.5, 0.65, 1.4); sp.userData.z = z; spots.push(sp); }
    S.setTime(ST.hour); S.makeEnv(renderer);
    applyGfx();
    B.bootProgress(0.68, 'Araç küçük resimleri çiziliyor…'); await nextFrame();
    makeThumbs();
    B.bootProgress(0.78, 'Araç modeli yükleniyor…'); await nextFrame();
    await setCar(true);
    bind();
    window.addEventListener('resize', resize); resize();
    B.bootProgress(0.9, B.first ? 'Gölgelendiriciler derleniyor ve önbelleğe alınıyor…' : 'Gölgelendiriciler hazırlanıyor…'); await nextFrame();
    try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); else renderer.compile(scene, camera); } catch (e) { /* yok say */ }
    camera.position.set(veh.x, veh.y + 4, veh.z); camera.lookAt(veh.x + Math.cos(veh.heading) * 10, veh.y + 1, veh.z + Math.sin(veh.heading) * 10);
    try { renderPasses(); } catch (e) { console.warn('ısınma', e); }
    B.bootProgress(1, 'Hazır'); await new Promise((r) => setTimeout(r, B.first ? 900 : 350));
    G.ready = true; G.mode = 'menu';
    B.bootEnd(); B.markLaunched(); B.showMain(); B.checkUpdate(false);
  }
  // dosyası bulunmayan araçlar (örn. lisans nedeniyle depoya konmayan modeller) menüden gizlenir
  async function filterCars() {
    const ext = PC.CarSpecs.filter((s) => s.ext);
    if (window.PC_CARS) { for (const s of ext) if (window.PC_CARS.indexOf(s.id) < 0) s.hidden = true; return; }
    await Promise.all(ext.map((s) => fetch('assets/cars/' + s.id + '/scene.gltf', { method: 'HEAD' }).then((r) => { if (!r.ok) s.hidden = true; }).catch(() => { s.hidden = true; })));
  }
  // ---- oyun durumu: ana menüde ve duraklatmada HİÇBİR şey çizilmez ----
  G.start = async function () {
    if (!G.ready) return;
    if (ST.car !== (PC.CarSpecs.indexOf(car.spec))) await setCar(false); else await carChain;
    if (firstStart) { firstStart = false; state.cam = ST.camDef || 0; if (ST.startAt !== undefined && ST.startAt >= 0 && W.teleports[ST.startAt]) UI.on.teleport(ST.startAt); }
    PC.Menu.ctx = 'play'; AU.init(); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
    G.resume(); graceT = 10;
  };
  G.carReady = () => carChain;
  G.resume = function () {
    graceT = Math.max(graceT, 3); G.mode = 'play'; UI.menuOpen = false; PC.Menu.ctx = 'play'; $('hud').classList.remove('hidden'); $('rotate').classList.add('need'); lastDraw = 0; acc = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    const el = document.documentElement;
    try { const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : null; if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {}); } catch (e) { /* */ }
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) { /* */ }
    if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  };
  G.pause = function () {
    if (G.mode === 'pause') return; if (G.saveStats) G.saveStats(); G.mode = 'pause'; UI.menuOpen = true; cancelAnimationFrame(raf); raf = 0;
    UI.tGas = UI.tBrake = UI.tHB = UI.throttle = UI.brake = 0; UI.tSteer = 0; AU.horn && AU.horn(false); if (AU.ctx) AU.ctx.suspend();
  };
  G.stop = function () { G.pause(); G.mode = 'menu'; $('hud').classList.add('hidden'); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* */ } };
  // araç seçme menüsü için her aracın küçük resmini çiz
  function makeThumbs() {
    const TW = 384, TH = 216, rt = new T.WebGLRenderTarget(TW, TH, { samples: 4 }), sc = new T.Scene(), cm = new T.PerspectiveCamera(30, TW / TH, 0.5, 60);
    sc.environment = scene.environment; sc.background = new T.Color(0x1a222b);
    const d = new T.DirectionalLight(0xffffff, 3); d.position.set(4, 8, 5); sc.add(d); sc.add(new T.HemisphereLight(0xdfe9ff, 0x30302c, 1.2));
    const fl = new T.Mesh(new T.CircleGeometry(9, 40), new T.MeshStandardMaterial({ color: 0x20262d, roughness: 0.35, metalness: 0.3 })); fl.rotation.x = -Math.PI / 2; sc.add(fl);
    const px = new Uint8Array(TW * TH * 4), cv = document.createElement('canvas'); cv.width = TW; cv.height = TH; const g = cv.getContext('2d'), im = g.createImageData(TW, TH);
    PC.Thumbs = [];
    for (const sp of PC.CarSpecs) {
      if (sp.hidden) { PC.Thumbs.push(''); continue; }
      if (sp.ext) { PC.Thumbs.push(PC.Assets.imgs['thumb_' + sp.id] ? PC.Assets.imgs['thumb_' + sp.id].src : ''); continue; }
      const c = sp.glb ? PC.buildGlbCar(sp, sp.colors[0]) : PC.buildCar(sp, { player: true, color: sp.colors[0] });
      c.setLights(true, false, false, false); sc.add(c.group);
      const r = sp.len * 1.55; cm.position.set(Math.cos(0.62) * r, sp.len * 0.36, Math.sin(0.62) * r); cm.lookAt(0, 0.5, 0);
      renderer.setRenderTarget(rt); renderer.render(sc, cm); renderer.readRenderTargetPixels(rt, 0, 0, TW, TH, px);
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const s = ((TH - 1 - y) * TW + x) * 4, o = (y * TW + x) * 4; for (let k = 0; k < 3; k++) { const v = px[s + k] / 255; im.data[o + k] = Math.pow(v / (v * 0.55 + 0.45), 1 / 2.2) * 255; } im.data[o + 3] = 255; }
      g.putImageData(im, 0, 0); PC.Thumbs.push(cv.toDataURL('image/jpeg', 0.85));
      sc.remove(c.group); c.setLights(false, false, false, false);
      if (!sp.glb && c.mesh) c.mesh.geometry.dispose();
    }
    renderer.setRenderTarget(null); rt.dispose();
    if (UI.refreshMenu) UI.refreshMenu();
  }
  // geliştirme aracı: dış modellerin küçük resmini çizip yerel sunucuya kaydeder, tanılama bilgisini döndürür
  G.extThumbs = async function (ids, view) {
    const TW = 384, TH = 216, rt = new T.WebGLRenderTarget(TW, TH, { samples: 4 }), sc = new T.Scene(), cm = new T.PerspectiveCamera(30, TW / TH, 0.3, 60);
    sc.environment = scene.environment; sc.background = new T.Color(0x1a222b);
    const d = new T.DirectionalLight(0xffffff, 3); d.position.set(4, 8, 5); sc.add(d); sc.add(new T.HemisphereLight(0xdfe9ff, 0x30302c, 1.2));
    const fl = new T.Mesh(new T.CircleGeometry(9, 40), new T.MeshStandardMaterial({ color: 0x20262d, roughness: 0.35, metalness: 0.3 })); fl.rotation.x = -Math.PI / 2; sc.add(fl);
    const px = new Uint8Array(TW * TH * 4), cv = document.createElement('canvas'); cv.width = TW; cv.height = TH; const g = cv.getContext('2d'), im = g.createImageData(TW, TH), out = {};
    for (const sp of PC.ExtCars) {
      if (ids && ids.indexOf(sp.id) < 0) continue;
      try {
        await PC.loadExtCar(sp); const c = PC.buildExtCar(sp, sp.colors[0]); c.setLights(true, false, false, false); if (view === 'in') { const k = PC.buildCockpit(c, sp, null); k.update({ rpm: 3000, kmh: 80, delta: 0, mode: 'D', gear: 3, fuel: 40, temp: 90, odo: 12000 }, {}, 1); } sc.add(c.group); sc.updateMatrixWorld(true);
        if (view === 'in') { cm.fov = 62; cm.updateProjectionMatrix(); cm.position.copy(c.ck.eye); cm.lookAt(c.ck.eye.x + 3, c.ck.eye.y - 0.35, c.ck.eye.z); }
        else if (view === 'side') { cm.position.set(0, 1.2, 9); cm.lookAt(0, 0.6, 0); }
        else { const r = sp.len * 1.55; cm.position.set(Math.cos(0.62) * r, sp.len * 0.36, Math.sin(0.62) * r); cm.lookAt(0, 0.5, 0); }
        renderer.setRenderTarget(rt); renderer.render(sc, cm); renderer.readRenderTargetPixels(rt, 0, 0, TW, TH, px);
        for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const s = ((TH - 1 - y) * TW + x) * 4, o = (y * TW + x) * 4; for (let k = 0; k < 3; k++) { const v = px[s + k] / 255; im.data[o + k] = Math.pow(v / (v * 0.55 + 0.45), 1 / 2.2) * 255; } im.data[o + 3] = 255; }
        g.putImageData(im, 0, 0);
        await fetch('_save.php?n=' + sp.id + (view ? '_' + view : ''), { method: 'POST', body: cv.toDataURL('image/jpeg', 0.86) });
        out[sp.id] = c.diag; sc.remove(c.group); if (G.car !== c) PC.disposeExtCar(sp);
      } catch (e) { out[sp.id] = 'HATA ' + (e && e.message); }
    }
    renderer.setRenderTarget(null); rt.dispose(); return out;
  };
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    PC.Post.setSize(Math.round(w * pr), Math.round(h * pr));
  }
  // gelişmiş grafik ayarlarının tamamı tek yerde uygulanır (tekrar çağrılabilir)
  function applyGfx() {
    if (!renderer) return;
    const dpr = window.devicePixelRatio || 1, P = PC.Post;
    maxPr = U.clamp(dpr * ST.gRes, 0.5, 3); minPr = Math.max(0.5, maxPr * 0.62);
    if (!pr || pr > maxPr || !ST.gDyn || pr < minPr) pr = maxPr;
    // gölgeler
    const sz = SHAD[ST.gShadow] || 0; S.sun.castShadow = sz > 0;
    if (sz && S.sun.shadow.mapSize.x !== sz) { S.sun.shadow.mapSize.set(sz, sz); if (S.sun.shadow.map) { S.sun.shadow.map.dispose(); S.sun.shadow.map = null; } }
    const d = ST.gShadowDist, sh = S.sun.shadow.camera; sh.left = -d; sh.right = d; sh.top = d; sh.bottom = -d; sh.updateProjectionMatrix(); S.shadowSpan = d * 2;
    // yansımalar (küp harita boyutu)
    const cs = CUBE[ST.gRefl] || 64;
    if (cs !== cubeSize) { cubeSize = cs; if (cubeCam.renderTarget) cubeCam.renderTarget.dispose(); cubeRT = new T.WebGLCubeRenderTarget(cs, { generateMipmaps: true, minFilter: T.LinearMipmapLinearFilter, type: T.HalfFloatType }); cubeCam.renderTarget = cubeRT; }
    cubeCam.far = Math.min(2000, ST.gDist);
    // görüntü işleme
    P.enabled = P.ok; P.bloom = !!ST.gBloom; P.strength = ST.gBloomK; P.ao = ST.gSsao ? 0.8 : 0; P.sharp = ST.gSharp; P.contrast = ST.gContrast; P.sat = ST.gSat; P.exposure = ST.gExp; P.vig = ST.gVig; P.grain = ST.gGrain;
    if (P.ok && P.samples !== ST.gMsaa) { P.samples = ST.gMsaa; P.resetTargets(); }
    // dünya
    camera.far = ST.gDist * 1.25; camera.updateProjectionMatrix(); S.setDist(ST.gDist); S.setTrees(ST.gTrees / 100, ST.gTreeDist); S.setGrass(ST.gGrass); if (S.waterUni) S.waterUni.uQ.value = ST.gWater ? 1 : 0;
    if (PC.FX) PC.FX.enabled = !!ST.gParticles;
    applyMirrorQ(); if (car) envAssign(); resize();
  }
  function applyMirrorQ() { if (ck && ck.mirrorRT) { const m = MIRS[ST.gMirror] || MIRS[1]; if (ck.mirrorRT.width !== m[0]) ck.mirrorRT.setSize(m[0], m[1]); } }
  function applyAniso() {
    if (!scene) return; const mx = Math.min(ST.gAniso, renderer.capabilities.getMaxAnisotropy()), seen = new Set();
    scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) { const t = m[k]; if (t && !seen.has(t) && t.anisotropy !== mx && !t.isRenderTargetTexture) { seen.add(t); t.anisotropy = mx; t.needsUpdate = true; } } });
  }
  function envAssign() { const t = ST.gRefl ? cubeRT.texture : null; for (const m of car.envMats) { m.envMap = t; m.needsUpdate = true; } }
  // araç değişimleri sıraya girer: aynı anda iki yükleme / kurulum birbirini bozmaz
  let carChain = Promise.resolve();
  function setCar(first) { const p = carChain.then(() => setCarNow(first)); carChain = p.catch(() => {}); return p; }
  function setCarNow(first) {
    const spec = PC.CarSpecs[ST.car];
    if (spec.ext && !spec._gltf) return PC.loadExtCar(spec).then(() => setCarNow(first)).catch((e) => { console.warn(e); G.carError = String((e && e.message) || e); UI.toast('Araç yüklenemedi: ' + spec.name); ST.car = PC.CarSpecs.findIndex((s) => !s.ext && !s.hidden); return setCarNow(first); });
    const old = veh;
    if (car) { scene.remove(car.group); ck.mirrorRT.dispose(); if (ck.group.parent) ck.group.parent.remove(ck.group); if (ck.mirrorCam.parent) ck.mirrorCam.parent.remove(ck.mirrorCam); if (car.mesh) car.mesh.geometry.dispose(); if (car.spec.ext && car.spec !== spec) PC.disposeExtCar(car.spec); }
    car = spec.ext ? PC.buildExtCar(spec, spec.colors[ST.color]) : spec.glb ? PC.buildGlbCar(spec, spec.colors[ST.color]) : PC.buildCar(spec, { player: true, color: spec.colors[ST.color] });
    car.group.rotation.order = 'YZX';
    ck = PC.buildCockpit(car, spec, UI.mapCanvas);
    scene.add(car.group);
    for (const sp of spots) { car.group.add(sp); sp.position.set(spec.L * (1 - spec.cg) + 0.6, 0.7, sp.userData.z); car.group.add(sp.target); sp.target.position.set(40, -1.5, sp.userData.z * 2.5); }
    veh = new PC.Vehicle(spec); G.veh = veh; G.car = car; state.keepHud = !!car.keepHud;
    if (old) { veh.reset(old.x, old.y, old.z, old.heading); veh.fuel = spec.tank * 0.8; }
    else { const sp = W.spawn, o = {}; W.groundAt(sp.x, sp.z, o); veh.reset(sp.x, o.y, sp.z, sp.heading); camH = sp.heading; }
    player.width = spec.width; player.len = spec.len;
    for (const k of ['esc', 'tcs', 'abs', 'assist', 'manual', 'grip', 'susp', 'bias', 'final']) applySetting(k, ST[k]);
    ST.lowRange = 0; ST.diffLock = 0; if (UI.refreshMenu) UI.refreshMenu();
    envAssign();
    if (ST.gRefl) { car.group.visible = false; cubeCam.position.set(veh.x, veh.y + 1.2, veh.z); cubeCam.update(renderer, scene); car.group.visible = true; }
    applyMirrorQ(); void first;
    return Promise.resolve();
  }
  function applySetting(k, v) {
    if (k === 'hour') S.setTime(v);
    else if (k === 'traffic') TR.max = v; else if (k === 'parked') { TR.maxParked = v; TR.parkT = 0; } else if (k === 'aggr') TR.aggression = v;
    else if (k === 'esc') veh.escMode = +v; else if (k === 'tcs') veh.tcs = !!v; else if (k === 'abs') veh.abs = !!v; else if (k === 'assist') veh.steerAssist = !!v; else if (k === 'manual') veh.manual = !!v;
    else if (k === 'grip') veh.tune.grip = v; else if (k === 'susp') veh.tune.susp = v; else if (k === 'bias') veh.tune.bias = U.clamp(veh.spec.bias + v, 0.4, 0.85); else if (k === 'final') veh.tune.final = v;
    else if (k === 'lowRange' || k === 'diffLock') { if (!veh.spec.lowRange && v) { UI.toast('Bu araçta 4x4 donanımı yok'); ST[k] = 0; UI.refreshMenu(); } else veh[k] = !!v; }
    else if (k === 'volume') AU.setVolume(v); else if (k === 'vEngine') AU.kEng = v; else if (k === 'vTire') AU.kTire = v;
    else if (k === 'gAniso') { applyGfx(); applyAniso(); } else if (k === 'preset') { /* parça parça gelir */ } else if (/^g[A-Z]/.test(k)) applyGfx();
    else if (k === 'hudScale' || k === 'hudOpacity' || k === 'lefty') UI.applyMode();
  }
  function recover(msg) {
    const nl = W.nearestLane(veh.x, veh.z, Math.cos(veh.heading), Math.sin(veh.heading));
    const mode = veh.mode; veh.reset(nl.x, nl.y, nl.z, nl.heading); veh.mode = mode === 'P' ? 'D' : mode;
    if (veh.fuel <= 0.5) { veh.fuel = veh.spec.tank * 0.8; veh.engineOn = true; }
    hist.length = 0; if (msg) UI.toast(msg);
  }
  function bind() {
    const on = UI.on;
    on.camera = () => { state.cam = (state.cam + 1) % 4; UI.lookYaw = UI.lookPitch = 0; UI.toast(CAMS[state.cam]); };
    on.shiftUp = () => veh.shift(1); on.shiftDown = () => veh.shift(-1);
    on.mode = (m) => { if ((m === 'R' || m === 'P') && veh.vx > 2.5) return UI.toast('Önce yavaşla'); if (m === 'D' && veh.vx < -2.5) return UI.toast('Önce dur'); veh.setMode(m); };
    on.manual = () => { ST.manual = ST.manual ? 0 : 1; veh.manual = !!ST.manual; UI.refreshMenu(); UI.toast(ST.manual ? 'Manuel vites' : 'Otomatik vites'); };
    on.lights = () => { state.lights = !state.lights; };
    on.indL = () => { state.indL = !state.indL || state.indR; state.indR = false; }; on.indR = () => { state.indR = !state.indR || state.indL; state.indL = false; };
    on.hazard = () => { const b = !(state.indL && state.indR); state.indL = state.indR = b; };
    on.horn = (d) => {
      AU.horn(d); if (!d) return;
      // yakındaki trafik aracına 3 kez korna: bir sonraki ışığa kadar yarışır
      let best = null, bd = 32; for (const c of TR.cars) { const dd = Math.hypot(c.x - veh.x, c.z - veh.z); if (dd < bd) { bd = dd; best = c; } }
      if (!best) return;
      const now = performance.now(); if (now - (best.honkT || 0) > 5000) best.honks = 0;
      best.honks = (best.honks || 0) + 1; best.honkT = now;
      if (best.honks >= 3 && !(best.raceT > 0)) { best.raceT = 25; best.honks = 0; UI.toast('Yarış! Bir sonraki ışığa kadar'); AU.trafficHorn(bd, 0); }
    }; on.rewind = (d) => { state.rewind = d; if (!d) { veh.vx = veh.vy = veh.r = 0; } };
    on.slowmo = () => { state.slowmo = !state.slowmo; UI.toast(state.slowmo ? 'Ağır çekim ×0.25' : 'Normal hız'); };
    on.reset = () => recover('Yola kondu');
    on.mission = () => { if (PC.FX) PC.FX.mission.toggle(W, veh); };
    on.teleport = (i) => { if (i === undefined) return PC.Menu.pause('garage'); PC.Props.teleport(W, veh, i); hist.length = 0; camH = veh.heading; UI.toast(W.teleports[i].name); };
    on.menu = () => PC.Menu.toggle();
    on.ignition = () => { if (veh.engineOn) { veh.engineOn = false; UI.toast('Motor kapatıldı'); } else { veh.startEngine(); UI.toast('Marş'); } };
    on.setting = applySetting; on.car = () => setCar(false);
    document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play') PC.Menu.pause(); }); // uygulama arka plana gidince otomatik duraklat
  }

  // ---------- çarpışma (hasarsız itme) ----------
  function collideCars() {
    const s = veh.spec, c = Math.cos(veh.heading), sn = Math.sin(veh.heading), pr2 = s.width / 2, po = s.len * 0.27;
    const test = (o, moving) => {
      const dx = o.x - veh.x, dz = o.z - veh.z; if (dx * dx + dz * dz > 49) return;
      const oc = Math.cos(o.heading), os = Math.sin(o.heading), oo = o.len * 0.27, orr = o.width / 2;
      for (const a of [-1, 1]) for (const b of [-1, 1]) {
        const ax = veh.x + c * po * a, az = veh.z + sn * po * a, bx = o.x + oc * oo * b, bz = o.z + os * oo * b;
        let nx = ax - bx, nz = az - bz; const d = Math.hypot(nx, nz), ov = pr2 + orr - d;
        if (ov > 0 && d > 1e-3) { nx /= d; nz /= d; veh.x += nx * ov; veh.z += nz * ov; veh.bounce(nx, nz, 0.1); if (moving) o.v *= 0.97; }
      }
    };
    for (const o of TR.cars) test(o, true);
    for (const o of TR.parked) test(o, false);
  }

  // ---------- trafik görselleri ----------
  function vis(o, parked) {
    if (o.vis) return o.vis;
    const cr = PC.buildCar(TSPECS[o.model], { lod: 1, color: o.color });
    cr.group.rotation.order = 'YZX'; cr.sig = ''; scene.add(cr.group); o.vis = cr;
    if (parked) { cr.group.position.set(o.x, o.y, o.z); cr.group.rotation.y = -o.heading; cr.group.updateMatrix(); }
    return cr;
  }
  const parkedSet = new Set(), movSet = new Set();
  function syncTraffic() {
    const night = S.night > 0.35;
    for (const c of movSet) if (TR.cars.indexOf(c) < 0) { scene.remove(c.vis.group); c.vis = null; movSet.delete(c); }
    for (const c of TR.cars) {
      const v = vis(c); movSet.add(c);
      v.group.position.set(c.x, c.y, c.z); v.group.rotation.set(0, -c.heading, Math.atan(c.slope));
      const sg = (night ? 1 : 0) + (c.brake ? 2 : 0) + (c.ind < 0 && c.blink ? 4 : 0) + (c.ind > 0 && c.blink ? 8 : 0);
      if (sg !== v.sig) { v.sig = sg; v.setLights(night, c.brake, c.ind < 0 && c.blink, c.ind > 0 && c.blink); }
    }
    for (const p of parkedSet) if (TR.parked.indexOf(p) < 0) { scene.remove(p.vis.group); p.vis = null; parkedSet.delete(p); }
    for (const p of TR.parked) { vis(p, true); parkedSet.add(p); }
    for (const c of TR.horns) { const dx = c.x - veh.x, dz = c.z - veh.z; _v.set(dx, 0, dz).applyQuaternion(_q.copy(camera.quaternion).invert()); AU.trafficHorn(Math.hypot(dx, dz), _v.x / (Math.abs(_v.x) + Math.abs(_v.z) + 1)); }
  }

  // ---------- kamera ----------
  // içi boş (kit kokpitli) modellerde kokpit kamerasında göz hizasının üstündeki gövde parçaları (tavan çerçevesi, kanatçıklar) kesilir
  const clipPlane = new T.Plane(new T.Vector3(0, -1, 0), 0), clipArr = [clipPlane];
  function kitClip(on, eyeY) {
    if (!car.ck || !car.ck.kit) on = false;
    if (on) clipPlane.constant = eyeY - 0.03;
    if (on !== !!car._clip) { car._clip = on; for (const m of car.envMats) if (m !== car.glass) { m.clippingPlanes = on ? clipArr : null; m.needsUpdate = true; } }
  }
  function updateCamera(dt) {
    if (state.cam !== 1 || UI.menuOpen) kitClip(false, 0);
    if (G.dbg) { camera.position.set(G.dbg[0], G.dbg[1], G.dbg[2]); camera.lookAt(G.dbg[3], G.dbg[4], G.dbg[5]); return; }
    const sp = veh.spec, cam = UI.menuOpen ? 3 : state.cam;
    let near = 0.3, fov = 52;
    if (cam === 0) {
      camH += U.angDiff(veh.heading - (veh.vx < -2 ? Math.PI : 0), camH) * (1 - Math.exp(-4.2 * dt));
      const a = camH + UI.lookYaw, dist = 5.6 + sp.len * 0.25 + veh.speed * 0.022, hgt = 1.55 + sp.cgH * 1.3 + UI.lookPitch * 4;
      _v.set(veh.x - Math.cos(a) * dist, veh.y + hgt, veh.z - Math.sin(a) * dist);
      W.groundAt(_v.x, _v.z, _g); const gy = Math.max(_g.y, W.SEA) + 0.7; if (_v.y < gy) _v.y = gy;
      if (Math.abs(camera.position.y - _v.y) > 4) camera.position.y = _v.y;
      camera.position.y += (_v.y - camera.position.y) * (1 - Math.exp(-14 * dt));
      camera.position.x = _v.x; camera.position.z = _v.z;
      camera.lookAt(veh.x + Math.cos(camH) * 2.2, veh.y + 1.05 + sp.cgH * 0.5, veh.z + Math.sin(camH) * 2.2);
      fov = (ST.fovOut || 52) - 2 + Math.min(16, veh.speed * 0.22);
    } else if (cam === 1 || cam === 2) {
      car.body.updateWorldMatrix(true, false);
      if (cam === 1) { _v.copy(ck.eye); _v.x -= U.clamp(veh.axF, -8, 8) * 0.0035; _v.z -= U.clamp(veh.ayF, -8, 8) * 0.003; near = 0.1; fov = ST.fov || 58; _v.y += ST.seatY || 0; _v.x -= ST.seatX || 0; }
      else { _v.copy(car.hoodCam); fov = 52; near = 0.15; }
      camera.position.copy(_v.applyMatrix4(car.body.matrixWorld)); kitClip(cam === 1, camera.position.y);
      car.body.getWorldQuaternion(_q); _q.multiply(QFIX);
      _e.set(-UI.lookPitch * 0.8 - (cam === 1 ? 0.1 : 0.04), -UI.lookYaw, 0, 'YXZ'); _q.multiply(_q2.setFromEuler(_e));
      camera.quaternion.copy(_q);
      camH = veh.heading;
    } else {
      if (UI.menuOpen) orbit += dt * 0.22; else orbit = UI.lookYaw + 0.6;
      const a = veh.heading + orbit + Math.PI, r = 6.2 + sp.len * 0.35, hy = 1.5 + (UI.menuOpen ? 0.25 : UI.lookPitch * 5);
      W.groundAt(veh.x + Math.cos(a) * r, veh.z + Math.sin(a) * r, _g);
      camera.position.set(veh.x + Math.cos(a) * r, Math.max(veh.y + hy, Math.max(_g.y, W.SEA) + 0.5), veh.z + Math.sin(a) * r);
      const sh = UI.menuOpen ? 1.9 : 0;
      camera.lookAt(veh.x + Math.sin(a) * sh, veh.y + 0.75, veh.z - Math.cos(a) * sh);
      fov = 42; camH = veh.heading;
    }
    if (Math.abs(camera.fov - fov) > 0.05 || camera.near !== near) { camera.fov = U.damp(camera.fov, fov, 6, dt); camera.near = near; camera.updateProjectionMatrix(); }
  }

  function syncPlayer(dt) {
    car.group.position.set(veh.x, veh.y, veh.z); car.group.rotation.set(veh.gRoll, -veh.heading, veh.gPitch);
    car.body.position.y = veh.heave; car.body.rotation.set(veh.roll, 0, veh.pitch);
    for (let i = 0; i < 4; i++) { const w = car.wheels[i]; if (w.front) w.hub.rotation.y = -veh.delta * (car.visSteer || 1); w.spin.rotation.z = (w.left ? 1 : -1) * veh.wheelRot[i]; }
    for (const gm of car.glasses || (car.glass ? [car.glass] : [])) if (gm.userData.glassy) { const go = state.cam === 1 && !UI.menuOpen ? Math.min(0.1, gm.userData.op0) : gm.userData.op0; if (gm.opacity !== go) gm.opacity = go; }
    if (car.setGauges) car.setGauges(veh.kmh, veh.engineOn ? veh.rpm : 0, veh.fuel / veh.spec.tank); // içeriden bakarken cam neredeyse berrak
    const braking = UI.brake > 0.05 || UI.handbrake > 0;
    car.setLights(state.lights, braking, state.indL && state.blink, state.indR && state.blink, veh.mode === 'R');
    for (const sp of spots) sp.intensity = state.lights && ST.gSpot ? 260 : 0;
    state.handbrake = UI.handbrake > 0 || veh.mode === 'P';
    ck.update(veh, state, dt);
  }

  // kübik yansıma + ayna + ana çizim (oyun döngüsünden ve ısınma turundan çağrılır)
  function renderPasses() {
    renderer.info.reset();
    const ef = ENVF[ST.gRefl];
    if (ef && frameN % ef === 0) {
      car.group.visible = false;
      cubeCam.position.set(veh.x, veh.y + 1.1, veh.z); cubeCam.updateMatrixWorld();
      renderer.setRenderTarget(cubeRT, face); renderer.render(scene, cubeCam.children[face]); renderer.setRenderTarget(null);
      car.group.visible = true;
      face = (face + 1) % 6; if (face === 0) cubeRT.texture.needsPMREMUpdate = true;
    }
    const mf = MIRF[ST.gMirror];
    if (state.cam === 1 && !UI.menuOpen && ST.mirror && mf && frameN % mf === 0) {
      car.group.visible = false; scene.updateMatrixWorld();
      renderer.setRenderTarget(ck.mirrorRT); renderer.render(scene, ck.mirrorCam); renderer.setRenderTarget(null);
      car.group.visible = true;
    }
    ck.mirrorFace.visible = !!(ST.mirror && mf);
    renderer.shadowMap.needsUpdate = ST.gShadow >= 2 || frameN % 2 === 0; // orta ve altında gölge haritası iki karede bir tazelenir
    if (PC.Post.enabled) PC.Post.render(scene, camera, S.night, 0.016); else renderer.render(scene, camera);
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (G.mode !== 'play') return;
    const minDt = ST.gFps ? 1000 / ST.gFps : 0;
    if (!lastDraw) lastDraw = t - 16;
    if (minDt && t - lastDraw < minDt - 2.5) return; // FPS sınırı
    const rdt = Math.max(0.001, (t - lastDraw) / 1000); lastDraw = t;
    const dt = Math.min(0.05, rdt);
    frameN++;
    // FPS + dinamik çözünürlük (hedef FPS'in altına düşünce çözünürlüğü kıs, toparlanınca yükselt)
    fpsT += rdt; fpsN++; if (graceT > 0) graceT -= rdt;
    if (fpsT >= 1) {
      const fps = fpsN / fpsT; fpsT = 0; fpsN = 0; const target = ST.gFps || 60;
      if (graceT > 0) { lowT = 0; upT = 0; }
      else if (ST.gDyn) {
        if (fps < target * 0.88) { upT = 0; lowT++; if (lowT >= 2 && pr > minPr + 0.01) { pr = Math.max(minPr, pr - 0.1); resize(); lowT = 0; } }
        else { lowT = 0; if (fps > target * 0.96 && pr < maxPr - 0.01 && ++upT >= 5) { pr = Math.min(maxPr, pr + 0.05); resize(); upT = 0; } }
      }
      if (graceT <= 0) autoTune(fps);
      UI.fps(Math.round(fps) + ' FPS · ' + pr.toFixed(2) + 'x · ' + renderer.info.render.calls + ' çağrı');
    }
    UI.update(dt, veh.speed);
    const ts = state.slowmo ? 0.25 : 1;
    if (state.rewind) {
      histT += dt * 5;
      while (histT > 0.2 && hist.length > 1) { histT -= 0.2; hist.pop(); }
      const hsn = hist[hist.length - 1]; if (hsn) { veh.reset(hsn[0], hsn[1], hsn[2], hsn[3]); }
    } else {
      inp.throttle = UI.throttle; inp.brake = UI.brake; inp.steer = UI.steer; inp.handbrake = UI.handbrake;
      acc += dt * ts; let n = 0;
      while (acc >= H && n < 10) { veh.step(H, inp, W); collideCars(); acc -= H; n++; }
      if (n === 10) acc = 0;
      histT += dt * ts; if (histT > 0.2) { histT = 0; hist.push([veh.x, veh.y, veh.z, veh.heading]); if (hist.length > 450) hist.shift(); }
      if (veh.hitT > 0.39 && veh.lastHit) { AU.thud(veh.lastHit); if (ST.vibrate && navigator.vibrate) { try { navigator.vibrate(Math.min(60, 20 + veh.lastHit * 4)); } catch (e) { /* */ } } veh.lastHit = 0; }
      if (veh.inWater) { waterT += dt; if (waterT > 1.4) { waterT = 0; recover('Sudan çıkarıldı'); } } else waterT = 0;
      if (veh.y < -40 || !isFinite(veh.x)) recover('Yola kondu');
    }
    const c = Math.cos(veh.heading), s = Math.sin(veh.heading);
    player.x = veh.x; player.z = veh.z; player.heading = veh.heading; player.vxw = c * veh.vx - s * veh.vy; player.vzw = s * veh.vx + c * veh.vy; player.speed = veh.speed;
    updateStats(dt * ts);
    TR.update(dt * ts, player);
    if (PC.Props && W.villa) PC.Props.update(dt * ts, veh, W);
    blinkT += dt; state.blink = blinkT % 0.7 < 0.35;
    if (state.blink !== lastBlink && (state.indL || state.indR)) AU.tick(state.blink); lastBlink = state.blink;
    if (ST.autoLights) { const want = S.night > 0.45; if (want !== state._auto) { state._auto = want; state.lights = want; } }
    syncPlayer(dt); syncTraffic(); updateCamera(dt);
    S.update(dt, camera, car.group.position);
    if (PC.FX) PC.FX.update(dt * ts, veh, car, camera, S.night);
    if (S.envDirty && frameN % 20 === 0) S.makeEnv(renderer);
    AU.update(veh, state.cam === 1);
    UI.hud(dt, veh, state);
    if (frameN % 6 === 0) { if (ST.showMap) UI.drawMap(veh, TR.cars); if (ck.screenTex && state.cam === 1) ck.screenTex.needsUpdate = true; }
    renderPasses();
  }
  // ---- sürüş istatistikleri (km, süre, en yüksek hız) ----
  const stats = (G.stats = (() => { try { return Object.assign({ km: 0, sec: 0, top: 0, trips: 0 }, JSON.parse(localStorage.getItem('pcd-stats') || '{}')); } catch (e) { return { km: 0, sec: 0, top: 0, trips: 0 }; } })());
  let statT = 0; const saveStats = () => { try { localStorage.setItem('pcd-stats', JSON.stringify(stats)); } catch (e) { /* */ } }; G.saveStats = saveStats;
  function updateStats(dt) { stats.km += (veh.speed * dt) / 1000; stats.sec += dt; stats.top = Math.max(stats.top, veh.kmh); statT += dt; if (statT > 10) { statT = 0; saveStats(); } }
  // ---- ilk oyunda cihaza göre otomatik kalite ----
  let tune = { n: 0, sum: 0, done: (() => { try { return localStorage.getItem('pcd-tuned') === '1'; } catch (e) { return true; } })() };
  function autoTune(fps) {
    if (tune.done) return; tune.n++; if (tune.n <= 3) return; tune.sum += fps; // ilk 3 sn ısınma
    if (tune.n >= 10) { tune.done = true; try { localStorage.setItem('pcd-tuned', '1'); } catch (e) { /* */ }
      const avg = tune.sum / (tune.n - 3), target = ST.gFps || 60;
      if (avg < target * 0.72 && ST.preset === 'med') { PC.Menu.set('preset', 'low'); UI.toast('Cihazın için grafik ayarı Düşük yapıldı (Ayarlar > Grafik)'); }
      else if (avg < target * 0.72 && ST.preset === 'high') { PC.Menu.set('preset', 'med'); UI.toast('Cihazın için grafik ayarı Orta yapıldı (Ayarlar > Grafik)'); } }
  }
  G.applyGfx = applyGfx; G.renderPasses = renderPasses;  window.addEventListener('load', () => setTimeout(() => {
    PC.Menu.init(); PC.Menu.bootStart(PC.Menu.first);
    PC.Menu.bootProgress(0.02, 'Kaynaklar yükleniyor…');
    Promise.all([PC.loadModels ? PC.loadModels() : 0, PC.Assets ? PC.Assets.loadImages() : 0]).then(() => { if (ST.car >= PC.CarSpecs.length) ST.car = 0; return init(); }).catch((e) => { console.error(e); PC.Menu.bootProgress(0, 'Hata: ' + (e && e.message)); });
  }, 60));
})();
