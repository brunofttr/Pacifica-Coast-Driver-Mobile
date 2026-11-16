// Pacifica Coast — hazır (glTF) araç modeli: Khronos "Car Concept" (CC-BY 4.0; kaynağı Unity Fan'ın CC0 modeli)
(function () {
  'use strict';
  const PC = window.PC, T = THREE;
  const spec = {
    id: 'aurora', name: 'Aurora GT Concept', cls: 'Konsept süper otomobil · RWD · 720 hp', colors: [null, 0xe9e6df, 0x2b2d31, 0x123a7a, 0x0f5a3c, 0xd9a400],
    glb: 'models/CarConcept.glb',
    mass: 1480, L: 2.8, cg: 0.43, track: 1.96, cgH: 0.44, R: 0.384, width: 2.02, len: 4.56, drive: 'rwd', awdFront: 0,
    torque: [[1000, 380], [2500, 620], [3500, 720], [6500, 730], [7800, 650], [8500, 560]], idle: 900, redline: 8500, stall: 3000, powerKw: 530,
    gears: [3.4, 2.2, 1.6, 1.25, 1.02, 0.86, 0.72], rev: 3.2, final: 3.9, shiftT: 0.09,
    mu: 1.3, tireB: 12.5, brakeG: 1.32, bias: 0.6, cdA: 0.4, cl: 0.9, rollF: 0.5, lock: 0.6, rollGain: 0.0038, pitchGain: 0.0022, suspHz: 2.3, tank: 70, cyl: 8, vmaxDial: 360, dash: 'sport', seat: { y: 0.3 },
  };
  PC.CarSpecs.unshift(spec);
  PC.Credits = [
    'Araç modeli: "Car Concept" — Khronos Group (CC-BY 4.0), Unity Fan\'ın kamu malı (CC0) modelinden',
    'Motor sesleri: "Racing car engine sound loops" — OpenGameArt (CC0)',
    'Lastik sesi: "Car tire squeal skid loop" — OpenGameArt (CC-BY 3.0)',
    'three.js r160 (MIT)',
  ];

  PC.loadModels = function () {
    return PC.Assets.get(spec.glb).then((buf) => new Promise((res, rej) => new T.GLTFLoader().parse(buf, '', res, rej))).then((g) => { spec._gltf = g; })
      .catch((e) => { console.warn('model yüklenemedi', e); const i = PC.CarSpecs.indexOf(spec); if (i >= 0) PC.CarSpecs.splice(i, 1); });
  };

  const YAX = new T.Vector3(0, 1, 0), _q = new T.Quaternion();
  PC.buildGlbCar = function (sp, color) {
    let car = sp._car;
    if (!car) {
      const scene = sp._gltf.scene;
      car = sp._car = { spec: sp, group: new T.Group(), body: new T.Group(), wheels: [], envMats: [], paints: [] };
      const shiftX = 1.3141 - sp.L * sp.cg;
      const fix = new T.Group(); fix.rotation.y = Math.PI / 2; fix.position.x = shiftX; fix.add(scene);
      car.body.add(fix); car.group.add(car.body); car.shiftX = shiftX;
      scene.updateMatrixWorld(true);
      car.group.add(PC.blobShadow(sp.len, sp.width));
      const M = new T.Matrix4().set(0, -1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 0, 0, 1);
      for (const [name, front] of [['WheelFrontL', true], ['WheelFrontR', true], ['WheelRearL', false], ['WheelRearR', false]]) {
        const node = scene.getObjectByName(name); if (!node) continue;
        const t = node.position, hub = new T.Group(), spin = new T.Group(), a1 = new T.Group(), a2 = new T.Group();
        a1.setRotationFromMatrix(M); a2.setRotationFromMatrix(M);
        hub.position.set(-t.y + shiftX, t.z, -t.x);
        for (const c of node.children.slice()) (/BrakePad/.test(c.name) ? a2 : a1).add(c);
        spin.add(a1); hub.add(spin); hub.add(a2); car.group.add(hub); node.parent.remove(node);
        car.wheels.push({ hub, spin, left: false, front });
      }
      // ön tekerlekler önce L sonra R geldi; fizik sırası FL, FR, RL, RR ile aynı
      const seen = new Set();
      car.group.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        if (/Emblem|License/i.test(o.name)) { o.visible = false; return; }
        const m = o.material; if (seen.has(m)) return; seen.add(m);
        car.envMats.push(m);
        if (m.transmission > 0) { m.transmission = 0; PC.glassify(m, 0.3); car.glass = m; }
        if (/^Paint 1/.test(m.name)) { car.paints.push(m); m.userData.c0 = m.color.getHex(); }
        if (m.name === 'Headlight') car.mHead = m; else if (m.name === 'Brakelight') car.mBrake = m; else if (m.name === 'Signallight') car.mSig = m;
        if ('envMapIntensity' in m) m.envMapIntensity = 1.15;
      });
      for (const m of [car.mHead, car.mBrake, car.mSig]) if (m && m.emissive.getHex() === 0) m.emissive.copy(m.color);
      if (car.mHead) car.mHead.emissive.setHex(0xfff2dc); if (car.mBrake) car.mBrake.emissive.setHex(0xff1208); if (car.mSig) car.mSig.emissive.setHex(0xff8a00);
      car.paint = car.paints[0] || car.envMats[0]; car.glass = car.glass || car.paint;
      if (PC.carLamps) { const bbA = new T.Box3().setFromObject(car.body); car.spr = PC.carLamps(car, { bb: bbA, roof: bbA.max.y, head: false }); }
      car.setLights = function (head, brake, il, ir, rev) {
        if (car.spr) car.spr(head, brake, il, ir, rev);
        if (car.mHead) car.mHead.emissiveIntensity = head ? 5 : 0.25;
        if (car.mBrake) car.mBrake.emissiveIntensity = brake ? 6 : head ? 1.4 : 0.25;
        if (car.mSig) car.mSig.emissiveIntensity = 0;
      };
      const sn = scene.getObjectByName('InteriorSteeringCylinder');
      if (sn) { car.steerNode = sn; const base = sn.quaternion.clone(); car.setSteer = (a) => { sn.quaternion.copy(base).multiply(_q.setFromAxisAngle(YAX, a)); }; }
      // kokpit yerleşimi (araç gövde koordinatları: x ileri, y yukarı, z sağ)
      const X = (ly) => -ly + shiftX;
      car.ck = { cluster: [X(-1.36), 0.862, 0], clusterScale: 0.8, clusterTilt: -0.3, mirror: [X(-1.0), 1.085, 0], mirrorScale: 0.72, mirrorCam: [X(1.6), 1.0, 0], eye: new T.Vector3(X(-0.6), 0.985, 0) };
      car.hoodCam = new T.Vector3(X(-1.75), 0.98, 0);
    }
    for (const m of car.paints) m.color.setHex(color === null || color === undefined ? m.userData.c0 : color);
    return car;
  };
})();
