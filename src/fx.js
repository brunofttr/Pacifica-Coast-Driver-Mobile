// Pacifica Coast — efektler ve oyun içi görev: fiziksel cam, lastik izi, lastik dumanı / toz, varış görevi
(function () {
  'use strict';
  const PC = window.PC, T = THREE, U = PC.U;
  const FX = (PC.FX = {});

  // ---------- cam: bakış açısına göre saydamlık (karşıdan şeffaf, yandan aynalı) + parlak yansımalar opaklaşır ----------
  PC.glassify = function (m, base, keep) {
    if (!m || m.userData.glassy) return m;
    m.userData.glassy = true; m.transparent = true; m.depthWrite = false; if (!keep) m.opacity = base === undefined ? 0.3 : base; m.userData.op0 = m.opacity;
    if (!keep) { m.roughness = 0.03; m.metalness = 0.2; if (m.color) m.color.setHex(0x141b1f); } if ('envMapIntensity' in m) m.envMapIntensity = 1.7;
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
        float gF = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 3.0);
        float gR = dot(reflectedLight.indirectSpecular + reflectedLight.directSpecular, vec3(0.3333));
        diffuseColor.a = clamp(max(mix(diffuseColor.a, 0.92, gF), gR * 0.6), 0.0, 1.0);
        #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'pcglass';
    m.needsUpdate = true; return m;
  };

  // ---------- lastik izi: halka tampon şerit ----------
  const SK = { N: 900, i: 0, last: [null, null, null, null] };
  function initSkid(scene) {
    const g = new T.BufferGeometry(), pos = new Float32Array(SK.N * 12), col = new Float32Array(SK.N * 16), idx = new Uint16Array(SK.N * 6);
    for (let i = 0; i < SK.N; i++) { const b = i * 4; idx.set([b, b + 1, b + 2, b + 2, b + 1, b + 3], i * 6); }
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 4)); g.setIndex(new T.BufferAttribute(idx, 1));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 1e6);
    const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0x050505, vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.frustumCulled = false; m.renderOrder = 2; scene.add(m); SK.mesh = m; SK.pos = pos; SK.col = col;
  }
  function skidSeg(a, b, w, alpha) {
    const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz); if (l < 0.02) return;
    const nx = (-dz / l) * w, nz = (dx / l) * w, o = SK.i * 12, c = SK.i * 16, p = SK.pos;
    p[o] = a.x + nx; p[o + 1] = a.y; p[o + 2] = a.z + nz; p[o + 3] = a.x - nx; p[o + 4] = a.y; p[o + 5] = a.z - nz;
    p[o + 6] = b.x + nx; p[o + 7] = b.y; p[o + 8] = b.z + nz; p[o + 9] = b.x - nx; p[o + 10] = b.y; p[o + 11] = b.z - nz;
    for (let k = 0; k < 4; k++) { SK.col[c + k * 4] = SK.col[c + k * 4 + 1] = SK.col[c + k * 4 + 2] = 1; SK.col[c + k * 4 + 3] = (k < 2 ? a.a : alpha); }
    SK.i = (SK.i + 1) % SK.N; SK.dirty = true;
  }

  // ---------- duman / toz: tek çizim çağrılı nokta bulutu ----------
  const SM = { N: 220, i: 0, p: [] };
  function initSmoke(scene) {
    const g = new T.BufferGeometry(), pos = new Float32Array(SM.N * 3), dat = new Float32Array(SM.N * 4);
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aD', new T.BufferAttribute(dat, 4)); g.boundingSphere = new T.Sphere(new T.Vector3(), 1e6);
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { sc: { value: 600 } },
      vertexShader: 'attribute vec4 aD; varying vec4 vD; uniform float sc; void main(){ vD = aD; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(420.0, aD.x * sc / max(0.5, -mv.z)); }',
      fragmentShader: 'varying vec4 vD; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0; if (r > 1.0 || vD.y <= 0.003) discard; float a = (1.0 - r); a *= a * vD.y; vec3 c = mix(vec3(0.42, 0.43, 0.45), vec3(0.36, 0.3, 0.22), vD.z) * vD.w; gl_FragColor = vec4(c, a); }',
    });
    const m = new T.Points(g, mat); m.frustumCulled = false; m.renderOrder = 5; scene.add(m); SM.mesh = m; SM.pos = pos; SM.dat = dat;
    for (let i = 0; i < SM.N; i++) SM.p.push({ life: 0, max: 1, vx: 0, vy: 0, vz: 0, s0: 0.3, a0: 0.3 });
  }
  function puff(x, y, z, vx, vz, dust, amt, light) {
    const i = SM.i, q = SM.p[i]; SM.i = (i + 1) % SM.N;
    q.life = q.max = dust ? 1.1 + Math.random() * 0.6 : 1.4 + Math.random() * 0.9; q.vx = vx + (Math.random() - 0.5) * 1.2; q.vz = vz + (Math.random() - 0.5) * 1.2; q.vy = 0.5 + Math.random() * 0.7;
    q.s0 = 0.45 + Math.random() * 0.3; q.a0 = (dust ? 0.2 : 0.26) * amt;
    SM.pos[i * 3] = x; SM.pos[i * 3 + 1] = y; SM.pos[i * 3 + 2] = z; SM.dat[i * 4 + 2] = dust ? 1 : 0; SM.dat[i * 4 + 3] = light;
  }

  // ---------- varış görevi ----------
  const MS = (FX.mission = { on: false, t: 0, x: 0, z: 0, y: 0, d0: 0, done: 0 });
  function initMission(scene) {
    const g = new T.CylinderGeometry(3.2, 3.2, 60, 20, 1, true); g.translate(0, 30, 0);
    const m = new T.Mesh(g, new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, uniforms: { t: { value: 0 } },
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 vU; uniform float t; void main(){ float a = pow(1.0 - vU.y, 2.2) * (0.55 + 0.25 * sin(vU.y * 40.0 - t * 5.0)); gl_FragColor = vec4(vec3(0.25, 0.85, 1.0) * 2.2 * a, a); }' }));
    m.visible = false; m.frustumCulled = false; m.renderOrder = 6; scene.add(m); MS.beam = m;
    MS.el = { style: {}, set textContent(t) { PC.UI.mission(t); } };
  }
  MS.start = function (W, veh) {
    let best = null;
    for (let k = 0; k < 60; k++) {
      const e = W.edges[(Math.random() * W.edges.length) | 0]; if (!e || !e.pts || e.pts.length < 4) continue;
      const p = e.pts[e.pts.length >> 1], d = Math.hypot(p.x - veh.x, p.z - veh.z);
      if (d > 500 && d < 1900) { best = { p, d, e }; break; } if (!best || Math.abs(d - 900) < Math.abs(best.d - 900)) best = { p, d, e };
    }
    if (!best) return false;
    MS.on = true; MS.t = 0; MS.x = best.p.x; MS.z = best.p.z; MS.y = best.p.y; MS.d0 = best.d; MS.beam.position.set(MS.x, MS.y, MS.z); MS.beam.visible = true; PC.UI.mission('🏁 …');
    PC.UI.target = { x: MS.x, z: MS.z }; PC.UI.toast('Görev: işaretli noktaya git (' + Math.round(best.d) + ' m)'); return true;
  };
  MS.stop = function (msg) { MS.on = false; if (MS.beam) MS.beam.visible = false; PC.UI.mission(null); PC.UI.target = null; if (msg) PC.UI.toast(msg); };
  MS.toggle = function (W, veh) { if (MS.on) MS.stop('Görev iptal edildi'); else MS.start(W, veh); };
  const mmss = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(Math.floor(t % 60)).padStart(2, '0');

  FX._dbg = () => ({ skid: SK.i, smoke: SM.p.filter((q) => q.life > 0).length });
  FX.init = function (scene, W) { FX.W = W; initSkid(scene); initSmoke(scene); initMission(scene); };

  const _p = new T.Vector3(), _o = {};
  let acc = 0;
  FX.update = function (dt, veh, car, cam, night) {
    // --- lastik izi + duman ---
    const sp = veh.spec, hard = veh.surf === 0 || veh.surf === 4, dust = veh.surf === 1 || veh.surf === 2;
    const c = Math.cos(veh.heading), s = Math.sin(veh.heading), vxw = c * veh.vx - s * veh.vy, vzw = s * veh.vx + c * veh.vy, light = 1 - 0.75 * (night || 0);
    acc += dt; const emit = acc > 0.03; if (emit) acc = 0;
    for (let i = 0; i < 4; i++) {
      const w = car.wheels[i]; if (!w) continue;
      const slip = i < 2 ? veh.slipF : veh.slipR;
      w.hub.getWorldPosition(_p); const gy = _p.y - sp.R + 0.035, last = SK.last[i];
      if (FX.enabled !== false && hard && slip > 0.35 && veh.speed > 1.5) {
        const a = Math.min(0.7, (slip - 0.25) * 0.9), cur = { x: _p.x, y: gy, z: _p.z, a };
        if (last && Math.hypot(cur.x - last.x, cur.z - last.z) < 4) { if (Math.hypot(cur.x - last.x, cur.z - last.z) > 0.12) { skidSeg(last, cur, Math.min(0.14, sp.R * 0.32), a); SK.last[i] = cur; } } else SK.last[i] = cur;
        if (emit && slip > 0.6 && Math.random() < slip) puff(_p.x, gy + 0.12, _p.z, vxw * 0.25, vzw * 0.25, false, U.clamp(slip, 0.4, 1), light);
      } else {
        SK.last[i] = null;
        if (FX.enabled !== false && emit && dust && i >= 2 && veh.speed > 6 && Math.random() < Math.min(1, veh.speed / 30 + slip)) puff(_p.x, gy + 0.1, _p.z, vxw * 0.3, vzw * 0.3, true, U.clamp(veh.speed / 25 + slip * 0.5, 0.3, 1), light);
      }
    }
    if (SK.dirty) { SK.mesh.geometry.attributes.position.needsUpdate = true; SK.mesh.geometry.attributes.color.needsUpdate = true; SK.dirty = false; }
    let live = false;
    for (let i = 0; i < SM.N; i++) {
      const q = SM.p[i]; if (q.life <= 0) continue; live = true; q.life -= dt;
      const k = Math.max(0, q.life / q.max), o = i * 3; q.vx *= 1 - dt * 1.6; q.vz *= 1 - dt * 1.6;
      SM.pos[o] += q.vx * dt; SM.pos[o + 1] += q.vy * dt; SM.pos[o + 2] += q.vz * dt;
      SM.dat[i * 4] = q.s0 + (1 - k) * 1.9; SM.dat[i * 4 + 1] = q.a0 * k * Math.min(1, (1 - k) * 8);
    }
    if (live || SM.wasLive) { SM.mesh.geometry.attributes.position.needsUpdate = true; SM.mesh.geometry.attributes.aD.needsUpdate = true; }
    SM.wasLive = live; SM.mesh.material.uniforms.sc.value = (PC.Game.renderer.domElement.height || 800) / (2 * Math.tan((cam.fov * Math.PI) / 360));
    // --- görev ---
    if (MS.on) {
      MS.t += dt; MS.beam.material.uniforms.t.value += dt;
      const d = Math.hypot(MS.x - veh.x, MS.z - veh.z);
      MS.el.textContent = '🏁 ' + (d > 950 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m') + ' · ' + mmss(MS.t);
      if (d < 9 && Math.abs(veh.y - MS.y) < 6) {
        const par = MS.d0 * 1.35 / 15, t = MS.t; MS.done++;
        MS.stop('Vardın! ' + mmss(t) + (t < par ? ' · hızlı teslimat ★★★' : t < par * 1.5 ? ' · iyi ★★' : ' · ★'));
      }
    }
  };
})();

// ---------- araç lambaları: far / stop / sinyal / geri vites parlamaları (gövde yüzeyine oturtulmuş) ----------
(function () {
  'use strict';
  const PC = window.PC, T = THREE, U = PC.U;
  let tex = null;
  const glow = () => { if (!tex) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); tex = new T.CanvasTexture(c); } return tex; };
  // o: { bb: gövde kutusu (gövde koordinatları), roof, head: far parlaması da çizilsin mi, sig: sinyal parlaması }
  PC.carLamps = function (car, o) {
    const bb = o.bb, hw = (bb.max.z - bb.min.z) / 2, cz = (bb.max.z + bb.min.z) / 2, roof = o.roof || 1.3;
    const rc = new T.Raycaster(), objs = [];
    car.group.updateMatrixWorld(true);
    car.body.traverse((m) => { if (m.isMesh && m.visible && !m.userData.wheel && !m.userData.keep) objs.push(m); });
    const inv = new T.Matrix4().copy(car.body.matrixWorld).invert(), org = new T.Vector3(), dir = new T.Vector3();
    const surf = (front, y, z) => { // gövdenin ön / arka yüzeyinin x konumu
      org.set(front ? bb.max.x + 2 : bb.min.x - 2, y, z).applyMatrix4(car.body.matrixWorld); dir.set(front ? -1 : 1, 0, 0).transformDirection(car.body.matrixWorld); rc.set(org, dir);
      const h = rc.intersectObjects(objs, false)[0]; if (!h) return front ? bb.max.x - 0.1 : bb.min.x + 0.1;
      return h.point.clone().applyMatrix4(inv).x + (front ? 0.025 : -0.025);
    };
    const yH = U.clamp(roof * 0.42, 0.5, 0.85), yT = U.clamp(roof * 0.52, 0.58, 1.0);
    const mk = (col, front, y, z, s) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: glow(), color: col, blending: T.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); sp.scale.setScalar(s); sp.position.set(surf(front, y, cz + z), y, cz + z); sp.visible = false; sp.userData.base = s; car.body.add(sp); return sp; };
    const s = { hl: [], br: [], tl: [], sf: { L: [], R: [] }, sr: { L: [], R: [] }, rv: [] };
    for (const sd of [-1, 1]) {
      const zh = sd * hw * 0.62, zt = sd * hw * 0.64;
      if (o.head) s.hl.push(mk(0xfff2d8, true, yH, zh, 0.34));
      s.br.push(mk(0xff1208, false, yT, zt, 0.34)); s.tl.push(mk(0xff2a10, false, yT, zt, 0.2));
      (sd < 0 ? s.sf.L : s.sf.R).push(mk(0xff8a10, true, yH + 0.09, sd * hw * 0.8, 0.22));
      (sd < 0 ? s.sr.L : s.sr.R).push(mk(0xff8a10, false, yT + 0.1, sd * hw * 0.8, 0.22));
      s.rv.push(mk(0xffffff, false, yT - 0.09, sd * hw * 0.38, 0.2));
    }
    const all = [].concat(s.hl, s.br, s.tl, s.sf.L, s.sf.R, s.sr.L, s.sr.R, s.rv);
    const fn = function (head, brake, il, ir, rev) {
      for (const p of s.hl) p.visible = !!head;
      for (let i = 0; i < s.br.length; i++) { s.br[i].visible = !!brake; s.tl[i].visible = !brake && !!head; }
      const L = !!il, R = !!ir; for (const p of [].concat(s.sf.L, s.sr.L)) p.visible = L; for (const p of [].concat(s.sf.R, s.sr.R)) p.visible = R;
      for (const p of s.rv) p.visible = !!rev;
    };
    fn.sprites = all; fn.groups = s;
    return fn;
  };
})();
