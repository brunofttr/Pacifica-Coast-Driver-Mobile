// Pacifica Coast — görüntü sonrası shader hattı: HDR sahne -> bloom -> ACES ton eşleme, renk düzeltme, vinyet, gren
(function () {
  'use strict';
  const PC = window.PC, T = THREE;
  const P = (PC.Post = { ok: false, enabled: false, strength: 0.5, exposure: 1.0, bloom: true, ao: 0, sharp: 0.16, contrast: 1.06, sat: 1.12, vig: 0.26, grain: 0.014, samples: 4 });
  const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  let renderer, quad, cam, sceneQ, rtScene, rtA, rtB, rtC, rtD, mBright, mBlur, mFinal, W = 0, H = 0;

  P.init = function (r) {
    renderer = r;
    const gl = r.getContext();
    P.ok = r.capabilities.isWebGL2 && !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    if (!P.ok) return;
    cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); sceneQ = new T.Scene();
    quad = new T.Mesh(new T.PlaneGeometry(2, 2), null); quad.frustumCulled = false; sceneQ.add(quad);
    const base = { vertexShader: VS, depthTest: false, depthWrite: false, toneMapped: false };
    mBright = new T.ShaderMaterial(Object.assign({
      uniforms: { t: { value: null }, px: { value: new T.Vector2() } },
      fragmentShader: `varying vec2 vUv; uniform sampler2D t; uniform vec2 px;
        void main(){ vec3 c = (texture2D(t, vUv + px * vec2(-1.,-1.)).rgb + texture2D(t, vUv + px * vec2(1.,-1.)).rgb + texture2D(t, vUv + px * vec2(-1.,1.)).rgb + texture2D(t, vUv + px * vec2(1.,1.)).rgb) * 0.25;
          c = min(c, vec3(24.0)); float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(1.0, 2.1, l), 1.0); }`,
    }, base));
    mBlur = new T.ShaderMaterial(Object.assign({
      uniforms: { t: { value: null }, dir: { value: new T.Vector2() } },
      fragmentShader: `varying vec2 vUv; uniform sampler2D t; uniform vec2 dir;
        void main(){ vec3 c = texture2D(t, vUv).rgb * 0.227027;
          c += (texture2D(t, vUv + dir * 1.3846).rgb + texture2D(t, vUv - dir * 1.3846).rgb) * 0.316216;
          c += (texture2D(t, vUv + dir * 3.2308).rgb + texture2D(t, vUv - dir * 3.2308).rgb) * 0.070270;
          gl_FragColor = vec4(c, 1.0); }`,
    }, base));
    mFinal = new T.ShaderMaterial(Object.assign({
      uniforms: { t: { value: null }, b1: { value: null }, b2: { value: null }, strength: { value: 0.55 }, exposure: { value: 1 }, time: { value: 0 }, night: { value: 0 }, d: { value: null }, nf: { value: new T.Vector2(0.3, 6000) }, px: { value: new T.Vector2() }, ao: { value: 0 }, ps: { value: 800 }, sharp: { value: 0.16 }, contrast: { value: 1.06 }, sat: { value: 1.12 }, vig: { value: 0.26 }, grain: { value: 0.014 } },
      fragmentShader: `varying vec2 vUv; uniform sampler2D t; uniform sampler2D b1; uniform sampler2D b2; uniform float strength; uniform float exposure; uniform float time; uniform float night; uniform sampler2D d; uniform vec2 nf; uniform vec2 px; uniform float ao; uniform float ps; uniform float sharp; uniform float contrast; uniform float sat; uniform float vig; uniform float grain;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }
        float lz(vec2 uv){ float z = texture2D(d, uv).x; return nf.x * nf.y / (nf.y - z * (nf.y - nf.x)); }
        void main(){ vec3 c = texture2D(t, vUv).rgb;
          // keskinleştirme (4 komşu)
          if (sharp > 0.0) { vec3 nb = texture2D(t, vUv + vec2(px.x, 0.)).rgb + texture2D(t, vUv - vec2(px.x, 0.)).rgb + texture2D(t, vUv + vec2(0., px.y)).rgb + texture2D(t, vUv - vec2(0., px.y)).rgb;
            c = max(c + (c * 4.0 - nb) * sharp, 0.0); }
          // ortam gölgesi (SSAO): karşılıklı örnek çiftleri -> yalnız iç köşeler / temas yerleri kararır, düz yüzeyler etkilenmez
          if (ao > 0.0) { float zc = lz(vUv); if (zc < 110.0) {
            float r = clamp(0.6 * ps / zc, 2.0, 46.0), a0 = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.283, o = 0.0;
            for (int i = 0; i < 4; i++) { float an = a0 + float(i) * 0.7854; vec2 dv = vec2(cos(an), sin(an)) * px * r * (0.4 + 0.2 * float(i));
              float z1 = lz(vUv + dv), z2 = lz(vUv - dv), dz = zc - (z1 + z2) * 0.5, lim = 0.5 + zc * 0.02;
              o += smoothstep(0.012 + zc * 0.0025, 0.16 + zc * 0.01, dz) * step(abs(z1 - zc), lim) * step(abs(z2 - zc), lim); }
            c *= 1.0 - ao * 0.15 * o * (1.0 - smoothstep(55.0, 110.0, zc)) * smoothstep(0.9, 2.2, zc); } }
          c += (texture2D(b1, vUv).rgb * 0.55 + texture2D(b2, vUv).rgb * 0.85) * strength;
          c *= exposure;
          c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);            // ACES (Narkowicz)
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          c = mix(vec3(l), c, sat);                                                // doygunluk
          c = (c - 0.5) * contrast + 0.5;                                              // kontrast
          c *= mix(vec3(1.02, 1.0, 0.97), vec3(0.94, 0.98, 1.06), night);          // gündüz sıcak / gece soğuk ton
          vec2 d = vUv - 0.5; c *= 1.0 - vig * pow(dot(d, d) * 2.0, 1.3);         // vinyet
          c = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
          c += (h(gl_FragCoord.xy) - 0.5) * grain;                                 // gren (bantlanmayı da kırar)
          gl_FragColor = vec4(c, 1.0); }`,
    }, base));
  };
  function mk(w, h, samples, depth) {
    const rt = new T.WebGLRenderTarget(Math.max(2, w), Math.max(2, h), { type: T.HalfFloatType, samples: samples || 0, depthBuffer: !!depth, minFilter: T.LinearFilter, magFilter: T.LinearFilter });
    rt.texture.generateMipmaps = false;
    if (depth) { rt.depthTexture = new T.DepthTexture(Math.max(2, w), Math.max(2, h)); rt.depthTexture.type = T.UnsignedIntType; } // 24 bit derinlik: uzaktaki ince yüzeyler titremesin
    return rt;
  }
  P.setSize = function (w, h) {
    if (!P.ok || (w === W && h === H)) return;
    W = w; H = h;
    for (const r of [rtScene, rtA, rtB, rtC, rtD]) if (r) { if (r.depthTexture) r.depthTexture.dispose(); r.dispose(); }
    rtScene = mk(w, h, P.samples, true); rtA = mk(w >> 2, h >> 2); rtB = mk(w >> 2, h >> 2); rtC = mk(w >> 3, h >> 3); rtD = mk(w >> 3, h >> 3);
  };
  P.resetTargets = function () { const w = W, h = H; W = H = 0; P.setSize(w, h); };
  function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(sceneQ, cam); }
  P.render = function (scene, camera, night, dt) {
    if (!rtScene) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; } // boyut henüz belli değil (gizli pencere)
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    const sh = renderer.shadowMap.needsUpdate; renderer.shadowMap.needsUpdate = false;
    if (P.bloom) {
      mBright.uniforms.t.value = rtScene.texture; mBright.uniforms.px.value.set(1 / W, 1 / H); pass(mBright, rtA);
      mBlur.uniforms.t.value = rtA.texture; mBlur.uniforms.dir.value.set(4 / W, 0); pass(mBlur, rtB);
      mBlur.uniforms.t.value = rtB.texture; mBlur.uniforms.dir.value.set(0, 4 / H); pass(mBlur, rtA);
      mBlur.uniforms.t.value = rtA.texture; mBlur.uniforms.dir.value.set(8 / W, 0); pass(mBlur, rtD);
      mBlur.uniforms.t.value = rtD.texture; mBlur.uniforms.dir.value.set(0, 8 / H); pass(mBlur, rtC);
      mBlur.uniforms.t.value = rtC.texture; mBlur.uniforms.dir.value.set(16 / W, 0); pass(mBlur, rtD);
      mBlur.uniforms.t.value = rtD.texture; mBlur.uniforms.dir.value.set(0, 16 / H); pass(mBlur, rtC);
    }
    const u = mFinal.uniforms; u.t.value = rtScene.texture; u.b1.value = rtA.texture; u.b2.value = rtC.texture; u.strength.value = P.bloom ? P.strength * (1 + night * 0.6) : 0; u.sharp.value = P.sharp; u.contrast.value = P.contrast; u.sat.value = P.sat; u.vig.value = P.vig; u.grain.value = P.grain; u.exposure.value = P.exposure * (1.6 + night * 0.7); u.night.value = night; u.time.value = (u.time.value + dt) % 10;
    u.d.value = rtScene.depthTexture; u.nf.value.set(camera.near, camera.far); u.px.value.set(1 / W, 1 / H); u.ao.value = P.ao || 0; u.ps.value = H / (2 * Math.tan((camera.fov * Math.PI) / 360));
    pass(mFinal, null);
    renderer.shadowMap.needsUpdate = sh;
  };
})();
