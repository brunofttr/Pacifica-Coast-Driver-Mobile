// Pacifica Coast Driver — oyun içi arayüz: dokunmatik kontroller, klavye/gamepad/eğme, HUD, mini harita
// (ana menü, ayarlar ve garaj src/menu.js içinde)
(function () {
  'use strict';
  const PC = window.PC, U = PC.U;
  // ---- ayarlar (varsayılanlar) ----
  const DEF = {
    car: 0, color: 0, hour: 17.4, traffic: 3, parked: 10, aggr: 0.6,
    // oynanış
    steerMode: 'slide', sens: 1, esc: 2, tcs: 1, abs: 1, assist: 1, manual: 0, drive: 'real', units: 'kmh', camDef: 0, camShake: 1, autoLights: 1, vibrate: 1,
    fov: 58, fovOut: 52, seatY: -0.04, seatX: 0.1, hudScale: 1, hudOpacity: 0.92, lefty: 0, showMap: 1, showMeters: 0, fpsShow: 0, mirror: 1,
    grip: 1, susp: 1, bias: 0, final: 1,
    // ses
    volume: 0.7, vEngine: 1, vTire: 1, vFx: 1,
    // grafik
    preset: 'med', gRes: 0.58, gDyn: 1, gFps: 60, gDist: 1500, gShadow: 1, gShadowDist: 55, gRefl: 1, gMirror: 1, gTrees: 55, gTreeDist: 600, gGrass: 1, gMsaa: 0, gBloom: 1, gBloomK: 0.5,
    gSsao: 0, gSharp: 0.18, gAniso: 4, gParticles: 1, gWater: 1, gSpot: 1, gExp: 1, gContrast: 1.06, gSat: 1.12, gVig: 0.26, gGrain: 0.014,
  };
  const ST = (PC.Settings = Object.assign({}, DEF));
  const KEY = 'pacifica-coast';
  try { Object.assign(ST, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* yok say */ }
  if (!ST.v4) { ST.v4 = 1; ST.preset = 'med'; ST.compact = 0; }
  if (!ST.v5) { ST.v5 = 1; ST.traffic = 3; ST.parked = 10; } // yeni varsayılan trafik (bir kez uygulanır)
  const save = (PC.saveSettings = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* yok say */ } });
  PC.DEFAULTS = DEF;

  const UI = (PC.UI = {
    on: {}, throttle: 0, brake: 0, steer: 0, handbrake: 0, lookYaw: 0, lookPitch: 0, lookHeld: false, lookIdle: 9, hornOn: false, rewind: false,
    tSteer: 0, tGas: 0, tBrake: 0, tHB: 0, digital: false, keys: {}, tilt: 0, menuOpen: true,
  });
  const $ = (id) => document.getElementById(id);
  const fire = (n, a, b) => { if (UI.on[n]) UI.on[n](a, b); };
  UI.fire = fire;

  const IC = {
    cam: '<svg viewBox="0 0 24 24"><path d="M9 4l-1.8 2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3.2L15 4H9zm3 4.5A4.5 4.5 0 1112 17.5 4.5 4.5 0 0112 8.5zm0 2A2.5 2.5 0 1014.5 13 2.5 2.5 0 0012 10.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>',
    lamp: '<svg viewBox="0 0 24 24"><path d="M3 9.5c0-3 2.5-5.5 6-5.5h2v14H9c-3.5 0-6-2.5-6-5.5v-3zM13 6h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8z"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 3L1.5 21h21L12 3zm1 14h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M3 12l9-8v5h9v6h-9v5z"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M21 12l-9-8v5H3v6h9v5z"/></svg>',
    horn: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z"/></svg>',
    hb: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm-1 4v5h2V8h-2zm0 7v2h2v-2h-2z"/></svg>',
  };

  UI.build = function () {
    const hud = document.createElement('div'); hud.id = 'hud'; hud.className = 'hidden';
    hud.innerHTML = `
      <div id="hTL"><canvas id="mini" width="256" height="256"></canvas><div id="limit"><small>LİMİT</small><span id="limV">50</span></div></div>
      <div id="hTC">
        <button class="hb sig" data-a="indL" aria-label="Sol sinyal">${IC.left}</button>
        <button class="hb warn" data-a="hazard" aria-label="Dörtlü">${IC.warn}</button>
        <button class="hb sig" data-a="indR" aria-label="Sağ sinyal">${IC.right}</button>
        <button class="hb" data-a="lights" aria-label="Far">${IC.lamp}</button>
      </div>
      <div id="hTR">
        <button class="hb" data-a="camera" aria-label="Kamera">${IC.cam}</button>
        <button class="hb" data-a="more" id="bMore" aria-label="Daha fazla">${IC.more}</button>
        <button class="hb" data-a="menu" aria-label="Duraklat">${IC.pause}</button>
      </div>
      <div id="more" class="hidden">
        <button class="hb wide" data-h="horn">${IC.horn}<span>Korna</span></button>
        <button class="hb wide" data-a="ignition"><span>Motor</span></button>
        <button class="hb wide" data-a="reset"><span>Yola koy</span></button>
        <button class="hb wide" data-a="slowmo"><span>Ağır çekim</span></button>
        <button class="hb wide" data-h="rewind"><span>⟲ Geri sar</span></button>
        <button class="hb wide" data-a="manual"><span>Manuel vites</span></button>
        <button class="hb wide" data-a="mission"><span>🏁 Görev</span></button>
        <button class="hb wide" data-a="teleport"><span>Işınlan</span></button>
      </div>
      <div id="fps"></div>
      <div id="apps"><canvas id="gmeter" width="168" height="168"></canvas></div>
      <div id="steerZone"><div id="slideInd"><div id="slideDot"></div></div><div id="wheelUI"></div><div id="arrows"><button class="hb big" data-s="-1">${IC.left}</button><button class="hb big" data-s="1">${IC.right}</button></div></div>
      <div id="hBR">
        <div id="gearSel"><button class="hb sm" data-g="P">P</button><button class="hb sm" data-g="R">R</button><button class="hb sm" data-g="N">N</button><button class="hb sm" data-g="D">D</button></div>
        <div id="sideB"><button class="hb round" data-h="horn" aria-label="Korna">${IC.horn}</button><button class="hb round" data-h="hb" aria-label="El freni">${IC.hb}</button></div>
        <div id="pedals"><div class="pedal" id="brake"><i></i><span>FREN</span></div><div class="pedal" id="gas"><i></i><span>GAZ</span></div></div>
        <div id="shiftB"><button class="hb sm2" data-a="shiftUp" id="bUp">▲</button><button class="hb sm2" data-a="shiftDown" id="bDn">▼</button></div>
      </div>
      <div id="speedo"><div id="gearTxt">D1</div><div id="spd">0<small>km/h</small></div><div id="rpmBar"><div id="rpmFill"></div></div><div id="aids"><b id="aABS">ABS</b><b id="aTCS">TCS</b><b id="aESC">ESC</b><b id="a4L">4L</b></div></div>
      <div id="msn"></div>
      <div id="toast"></div>`;
    document.body.appendChild(hud);
    const rot = document.createElement('div'); rot.id = 'rotate'; rot.innerHTML = '<div style="font-size:44px">⟳</div><div>Telefonu yatay çevir</div>'; document.body.appendChild(rot);
    bindControls(); bindKeys();
    UI.applyMode();
  };

  UI.toast = function (t) { const e = $('toast'); if (!e) return; e.textContent = t; e.style.opacity = 1; clearTimeout(UI._tt); UI._tt = setTimeout(() => (e.style.opacity = 0), 1800); };
  UI.applyMode = function () {
    if (!$('hud')) return;
    const m = ST.steerMode;
    $('slideInd').classList.toggle('hidden', m !== 'slide'); $('wheelUI').classList.toggle('hidden', m !== 'wheel'); $('arrows').classList.toggle('hidden', m !== 'buttons');
    $('apps').classList.toggle('hidden', !ST.showMeters); $('fps').classList.toggle('hidden', !ST.fpsShow); $('hTL').classList.toggle('nomap', !ST.showMap);
    const h = $('hud'); h.classList.toggle('lefty', !!ST.lefty);
    h.style.setProperty('--k', String(ST.hudScale)); h.style.setProperty('--op', String(ST.hudOpacity));
  };

  function hold(el, down, up) {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* */ } el.classList.add('down'); down(e); });
    const end = (e) => { el.classList.remove('down'); up && up(e); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  function bindControls() {
    document.querySelectorAll('#hud [data-a]').forEach((el) => hold(el, () => { if (el.dataset.a === 'more') $('more').classList.toggle('hidden'); else { fire(el.dataset.a); if (['teleport', 'mission'].indexOf(el.dataset.a) >= 0) $('more').classList.add('hidden'); } }));
    document.querySelectorAll('#hud [data-g]').forEach((el) => hold(el, () => fire('mode', el.dataset.g)));
    document.querySelectorAll('#hud [data-h]').forEach((el) => { const k = el.dataset.h; hold(el, () => { if (k === 'hb') UI.tHB = 1; else fire(k, true); }, () => { if (k === 'hb') UI.tHB = 0; else fire(k, false); }); });
    // pedallar
    for (const [id, key] of [['gas', 'tGas'], ['brake', 'tBrake']]) {
      const el = $(id), fill = el.querySelector('i');
      const set = (e) => { const r = el.getBoundingClientRect(); UI[key] = U.clamp(((r.bottom - e.clientY) / r.height) * 1.35, 0.18, 1); fill.style.height = UI[key] * 100 + '%'; };
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* */ } el._p = e.pointerId; set(e); });
      el.addEventListener('pointermove', (e) => { if (el._p === e.pointerId) set(e); });
      const end = (e) => { if (el._p === e.pointerId) { el._p = null; UI[key] = 0; fill.style.height = '0%'; } };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    }
    // direksiyon
    const sz = $('steerZone'), dot = $('slideDot'), wh = $('wheelUI');
    let sp = null, x0 = 0, wAng = 0, wLast = 0;
    sz.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#arrows')) return;
      if (ST.steerMode === 'tilt') return;
      e.preventDefault(); try { sz.setPointerCapture(e.pointerId); } catch (x) { /* */ }
      sp = e.pointerId; x0 = e.clientX;
      if (ST.steerMode === 'wheel') { const r = wh.getBoundingClientRect(); wLast = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); }
    });
    sz.addEventListener('pointermove', (e) => {
      if (sp !== e.pointerId) return;
      if (ST.steerMode === 'slide') UI.tSteer = U.clamp((e.clientX - x0) / (85 / ST.sens), -1, 1);
      else if (ST.steerMode === 'wheel') {
        const r = wh.getBoundingClientRect(), a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
        wAng = U.clamp(wAng + U.angDiff(a, wLast), -2.2, 2.2); wLast = a; UI.tSteer = U.clamp((wAng / 1.9) * ST.sens, -1, 1);
      }
    });
    const send = (e) => { if (sp === e.pointerId) { sp = null; UI.tSteer = 0; wAng = 0; } };
    sz.addEventListener('pointerup', send); sz.addEventListener('pointercancel', send);
    UI._steerVis = () => { dot.style.left = 50 + UI.steer * 50 + '%'; if (ST.steerMode === 'wheel') wh.style.transform = 'rotate(' + UI.steer * 110 + 'deg)'; };
    document.querySelectorAll('#arrows .hb').forEach((el) => hold(el, () => { UI._btnS = +el.dataset.s; }, () => { UI._btnS = 0; }));
    // etrafa bakma: oyun tuvalinde sürükle
    const cv = $('game'); let lp = null, lx = 0, ly = 0;
    cv.addEventListener('pointerdown', (e) => { lp = e.pointerId; lx = e.clientX; ly = e.clientY; UI.lookHeld = true; $('more').classList.add('hidden'); });
    cv.addEventListener('pointermove', (e) => { if (lp !== e.pointerId) return; UI.lookYaw += (e.clientX - lx) * 0.006; UI.lookPitch = U.clamp(UI.lookPitch + (e.clientY - ly) * 0.004, -0.7, 0.7); lx = e.clientX; ly = e.clientY; UI.lookIdle = 0; });
    const lend = (e) => { if (lp === e.pointerId) { lp = null; UI.lookHeld = false; } };
    cv.addEventListener('pointerup', lend); cv.addEventListener('pointercancel', lend);
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta === null) return;
      const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      UI.tilt = U.clamp(((ang === 270 || ang === -90 ? -e.beta : e.beta) / 28) * ST.sens, -1, 1);
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  function bindKeys() {
    const K = UI.keys, once = { KeyC: 'camera', KeyE: 'shiftUp', KeyQ: 'shiftDown', KeyR: 'reset', KeyL: 'lights', KeyZ: 'indL', KeyX: 'indR', KeyM: 'manual', Escape: 'menu', KeyT: 'slowmo', KeyI: 'ignition', KeyG: 'mission' };
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return; K[e.code] = true;
      if (once[e.code]) fire(once[e.code]); if (e.code === 'KeyH') fire('horn', true); if (e.code === 'Backspace') fire('rewind', true);
      if (e.code === 'Digit1') fire('mode', 'D'); if (e.code === 'Digit2') fire('mode', 'N'); if (e.code === 'Digit3') fire('mode', 'R'); if (e.code === 'Digit4') fire('mode', 'P');
    });
    window.addEventListener('keyup', (e) => { K[e.code] = false; if (e.code === 'KeyH') fire('horn', false); if (e.code === 'Backspace') fire('rewind', false); });
  }

  // her karede: girişleri birleştir
  UI.update = function (dt, speed) {
    const K = UI.keys;
    let tS = ST.steerMode === 'tilt' ? UI.tilt : UI.tSteer, digital = false;
    if (ST.steerMode === 'buttons' && UI._btnS) { tS = UI._btnS; digital = true; } else if (ST.steerMode === 'buttons') digital = true;
    let g = UI.tGas, b = UI.tBrake, hb = UI.tHB;
    const kl = K.ArrowLeft || K.KeyA, kr = K.ArrowRight || K.KeyD;
    if (kl || kr) { tS = (kr ? 1 : 0) - (kl ? 1 : 0); digital = true; }
    if (K.ArrowUp || K.KeyW) g = 1; if (K.ArrowDown || K.KeyS) b = 1; if (K.Space) hb = 1;
    const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.06) { tS = gp.axes[0]; digital = false; }
      if (gp.buttons[7] && gp.buttons[7].value > 0.03) g = gp.buttons[7].value; if (gp.buttons[6] && gp.buttons[6].value > 0.03) b = gp.buttons[6].value; if (gp.buttons[0] && gp.buttons[0].pressed) hb = 1;
    }
    if (digital || (kl || kr)) {
      const rate = (tS === 0 ? 4.5 : 2.6) / (1 + speed / 45);
      UI.steer += U.clamp(tS - UI.steer, -rate * dt, rate * dt);
    } else UI.steer = U.damp(UI.steer, tS, 16, dt);
    UI.throttle = U.damp(UI.throttle, g, g > UI.throttle ? 14 : 22, dt); UI.brake = U.damp(UI.brake, b, 22, dt); UI.handbrake = hb;
    if (!UI.lookHeld) { UI.lookIdle += dt; if (UI.lookIdle > 1.2) { UI.lookYaw = U.damp(UI.lookYaw, 0, 5, dt); UI.lookPitch = U.damp(UI.lookPitch, 0, 5, dt); } }
    UI._steerVis();
  };

  // ---------- HUD ----------
  let hudT = 0, gx = null, lastU = '';
  UI.hud = function (dt, v, st) {
    hudT -= dt; if (hudT > 0) return; hudT = 0.066;
    const mph = ST.units === 'mph', sp = mph ? v.kmh / 1.609 : v.kmh;
    $('spd').firstChild.nodeValue = Math.round(sp); if (lastU !== ST.units) { lastU = ST.units; $('spd').lastChild.textContent = mph ? 'mph' : 'km/h'; }
    $('gearTxt').textContent = v.mode === 'D' ? (v.manual ? 'M' : 'D') + v.gear : v.mode;
    $('rpmFill').style.width = U.clamp((v.rpm / v.spec.redline) * 100, 0, 100) + '%';
    $('aABS').className = v.absOn ? 'on' : ''; $('aTCS').className = v.tcsOn ? 'on' : ''; $('aESC').className = v.escOn ? 'on' : ''; $('a4L').className = v.lowRange ? 'on' : '';
    const lim = v.g.edge ? v.g.edge.limitKmh : st.lastLimit || 50; st.lastLimit = lim;
    $('limV').textContent = mph ? Math.round(lim / 1.609) : lim; $('limit').className = v.kmh > lim + 10 ? 'over' : '';
    document.querySelectorAll('#gearSel [data-g]').forEach((el) => el.classList.toggle('on', el.dataset.g === v.mode));
    document.querySelector('[data-a=manual]').classList.toggle('on', !!v.manual);
    $('shiftB').classList.toggle('hidden', !v.manual);
    document.querySelector('[data-a=lights]').classList.toggle('on', !!st.lights);
    document.querySelector('[data-a=indL]').classList.toggle('on', !!(st.indL && st.blink)); document.querySelector('[data-a=indR]').classList.toggle('on', !!(st.indR && st.blink));
    document.querySelector('[data-a=hazard]').classList.toggle('on', !!(st.indL && st.indR && st.blink));
    document.querySelector('[data-a=slowmo]').classList.toggle('on', !!st.slowmo);
    $('speedo').classList.toggle('hidden', st.cam === 1 && !st.keepHud);
    if (ST.showMeters) {
      if (!gx) gx = $('gmeter').getContext('2d');
      const g = gx; g.clearRect(0, 0, 168, 168); g.fillStyle = 'rgba(10,14,18,.88)'; g.beginPath(); g.arc(84, 84, 80, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (const r of [26, 53, 80]) { g.beginPath(); g.arc(84, 84, r, 0, 7); g.stroke(); }
      g.beginPath(); g.moveTo(4, 84); g.lineTo(164, 84); g.moveTo(84, 4); g.lineTo(84, 164); g.stroke();
      const px = 84 + U.clamp(v.ayF / 9.81, -1.5, 1.5) * 53, py = 84 + U.clamp(v.axF / 9.81, -1.5, 1.5) * 53;
      g.fillStyle = '#58c9f5'; g.beginPath(); g.arc(px, py, 9, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '600 18px sans-serif'; g.textAlign = 'center'; g.fillText((Math.hypot(v.axF, v.ayF) / 9.81).toFixed(2) + 'g', 84, 160);
    }
  };
  UI.fps = (t) => { if (ST.fpsShow && $('fps')) $('fps').textContent = t; };
  UI.mission = (t) => { const e = $('msn'); if (!e) return; e.style.display = t ? 'block' : 'none'; if (t) e.textContent = t; };

  // ---------- mini harita ----------
  let mapC = null, mctx = null; const MS = 0.4, MX0 = -1900, MZ0 = -2450;
  UI.buildMap = function (W) {
    mapC = document.createElement('canvas'); mapC.width = mapC.height = 1920; const g = mapC.getContext('2d');
    const img = g.createImageData(480, 480);
    for (let j = 0; j < 480; j++) for (let i = 0; i < 480; i++) { const h = W.HG.h[j * 481 + i], o = (j * 480 + i) * 4, sea = h < 0.3; const s = U.clamp(h / 120, 0, 1); img.data[o] = sea ? 18 : 38 + s * 40; img.data[o + 1] = sea ? 52 : 50 + s * 30; img.data[o + 2] = sea ? 70 : 40 + s * 20; img.data[o + 3] = 255; }
    const tc = document.createElement('canvas'); tc.width = tc.height = 480; tc.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(tc, 0, 0, 1920, 1920);
    g.fillStyle = '#2b3138'; for (const b of W.buildings) g.fillRect((b.x - b.w / 2 - MX0) * MS, (b.z - b.d / 2 - MZ0) * MS, b.w * MS, b.d * MS);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const pass of [0, 1]) for (const e of W.edges) {
      g.strokeStyle = pass ? (e.type === 'highway' || e.type === 'bridge' ? '#ffcf5a' : '#e9edf0') : '#0b0e11'; g.lineWidth = Math.max(3, e.halfW * 2 * MS * 1.5) + (pass ? 0 : 3);
      g.beginPath(); const A = W.nodes[e.a], B = W.nodes[e.b]; g.moveTo((A.x - MX0) * MS, (A.z - MZ0) * MS); for (const p of e.pts) g.lineTo((p.x - MX0) * MS, (p.z - MZ0) * MS); g.lineTo((B.x - MX0) * MS, (B.z - MZ0) * MS); g.stroke();
    }
    mctx = $('mini').getContext('2d');
    UI.mapCanvas = $('mini');
  };
  UI.drawMap = function (v, cars) {
    if (!mctx) return; const g = mctx, zoom = 1.5, cx = 128, cy = 150, phi = -Math.PI / 2 - v.heading;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#12343f'; g.fillRect(0, 0, 256, 256);
    g.translate(cx, cy); g.rotate(phi); g.scale(zoom, zoom); g.translate(-(v.x - MX0) * MS, -(v.z - MZ0) * MS); g.drawImage(mapC, 0, 0);
    g.fillStyle = '#ff5a50'; for (const c of cars) { g.beginPath(); g.arc((c.x - MX0) * MS, (c.z - MZ0) * MS, 3.2, 0, 7); g.fill(); }
    if (UI.target) { // görev hedefi: haritada nokta, harita dışındaysa kenarda yön işareti
      const dx = (UI.target.x - v.x) * MS * zoom, dz = (UI.target.z - v.z) * MS * zoom, co = Math.cos(phi), si = Math.sin(phi); let tx = dx * co - dz * si, ty = dx * si + dz * co; const l = Math.hypot(tx, ty), lim = 104;
      if (l > lim) { tx = (tx / l) * lim; ty = (ty / l) * lim; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#3fe0ff'; g.strokeStyle = '#04222b'; g.lineWidth = 3; g.beginPath(); g.arc(U.clamp(cx + tx, 12, 244), U.clamp(cy + ty, 12, 244), l > lim ? 7 : 9, 0, 7); g.fill(); g.stroke();
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#58c9f5'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy - 13); g.lineTo(cx + 9, cy + 10); g.lineTo(cx, cy + 5); g.lineTo(cx - 9, cy + 10); g.closePath(); g.fill(); g.stroke();
  };

  // menü kapı işlevleri (menu.js doldurur); geliştirme araçları ve eski çağrılar için takma adlar
  UI.openMenu = function () { if (PC.Menu) PC.Menu.pause(); };
  UI.closeMenu = function () { if (PC.Menu) PC.Menu.resume(); };
  UI.refreshMenu = function () { if (PC.Menu && PC.Menu.refresh) PC.Menu.refresh(); };
})();
