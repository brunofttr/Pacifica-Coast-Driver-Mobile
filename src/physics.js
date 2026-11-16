// Pacifica Coast — araç dinamiği (three.js'siz). 4 tekerlek yük transferi, Pacejka benzeri lastik,
// sürtünme elipsi, motor + tork konvertörü + şanzıman, ABS/TCS/ESC. Hasar yok.
(function () {
  'use strict';
  const PC = window.PC, U = PC.U, G = 9.81;

  function torqueAt(curve, rpm) {
    if (rpm <= curve[0][0]) return curve[0][1];
    for (let i = 1; i < curve.length; i++) {
      if (rpm <= curve[i][0]) { const a = curve[i - 1], b = curve[i]; return a[1] + ((b[1] - a[1]) * (rpm - a[0])) / (b[0] - a[0]); }
    }
    return curve[curve.length - 1][1];
  }
  function tire(alpha, B) { return Math.sin(1.5 * Math.atan(B * alpha)); }

  class Vehicle {
    constructor(spec) {
      this.spec = spec;
      this.a = spec.L * (1 - spec.cg); this.b = spec.L * spec.cg;
      this.Iz = spec.mass * this.a * this.b * 1.15;
      this.tmax = 0; for (const p of spec.torque) this.tmax = Math.max(this.tmax, p[1]);
      this.tune = { grip: 1, susp: 1, bias: spec.bias, final: 1 };
      this.escMode = 2; // 2 açık, 1 spor, 0 kapalı
      this.tcs = true; this.abs = true;
      this.lowRange = false; this.diffLock = false; this.steerAssist = true;
      this.manual = false; this.engineOn = true; this.fuel = spec.tank * 0.8; this.temp = 60; this.odo = 0;
      this.g = { y: 0, surf: 0 }; this.gw = [{}, {}, {}, {}]; this.wy = [0, 0, 0, 0];
      this.col = {};
      this.reset(0, 0, 0, 0);
    }
    reset(x, y, z, heading) {
      this.x = x; this.y = y; this.z = z; this.heading = heading;
      this.vx = 0; this.vy = 0; this.r = 0;
      this.axF = 0; this.ayF = 0; this.ax = 0; this.ay = 0;
      this.rpm = this.spec.idle; this.gear = 1; this.mode = 'D'; this.shiftT = 0; this.shiftCd = 0;
      this.spinF = 0; this.spinR = 0; this.steer = 0; this.delta = 0;
      this.pitch = 0; this.pitchV = 0; this.roll = 0; this.rollV = 0; this.heave = 0; this.heaveV = 0;
      this.gPitch = 0; this.gRoll = 0; this.wheelRot = [0, 0, 0, 0];
      this.slipF = 0; this.slipR = 0; this.absOn = false; this.tcsOn = false; this.escOn = false;
      this.throttleOut = 0; this.inWater = false; this.starter = 0; this.hitT = 0; this.surf = 0;
      for (let i = 0; i < 4; i++) this.wy[i] = y;
    }
    get speed() { return Math.hypot(this.vx, this.vy); }
    get kmh() { return Math.abs(this.vx) * 3.6; }
    ratio() {
      const s = this.spec;
      const g = this.mode === 'R' ? -s.rev : this.mode === 'D' ? s.gears[this.gear - 1] : 0;
      return g * s.final * this.tune.final * (this.lowRange && s.lowRange ? s.lowRange : 1);
    }
    shift(d) {
      if (this.mode !== 'D') return;
      const ng = U.clamp(this.gear + d, 1, this.spec.gears.length);
      if (ng !== this.gear) { this.gear = ng; this.shiftT = this.spec.shiftT; this.shiftCd = 0.7; }
    }
    setMode(m) { this.mode = m; if (m === 'D' && Math.abs(this.vx) < 2) this.gear = 1; }
    startEngine() { if (!this.engineOn && this.fuel > 0) this.starter = 0.9; }

    step(dt, inp, world) {
      const s = this.spec, m = s.mass, a = this.a, b = this.b, L = s.L;
      const cosH = Math.cos(this.heading), sinH = Math.sin(this.heading);
      // --- zemin ---
      const ht = s.track / 2, wy = this.wy, gw = this.gw;
      const wx = [a, a, -b, -b], wz = [-ht, ht, -ht, ht];
      let muSurf = 0, rough = 0;
      for (let i = 0; i < 4; i++) {
        const px = this.x + cosH * wx[i] - sinH * wz[i], pz = this.z + sinH * wx[i] + cosH * wz[i];
        world.groundAt(px, pz, gw[i]);
        wy[i] = gw[i].y;
        const sf = gw[i].surf;
        muSurf += sf === 0 || sf === 4 ? 1 : sf === 1 ? 0.75 : sf === 2 ? 0.62 : 0.3;
        rough += sf === 2 ? 1 : sf === 1 ? 0.5 : sf === 3 ? 3 : gw[i].edge && gw[i].edge.city ? 0.07 : 0;
      }
      muSurf /= 4; rough /= 4;
      if (this.diffLock && rough > 0.2) muSurf *= 1.2;
      world.groundAt(this.x, this.z, this.g);
      this.surf = this.g.surf;
      const yF = (wy[0] + wy[1]) / 2, yR = (wy[2] + wy[3]) / 2, yLft = (wy[0] + wy[2]) / 2, yRgt = (wy[1] + wy[3]) / 2;
      const gp = U.clamp((yF - yR) / L, -0.6, 0.6), gr = U.clamp((yRgt - yLft) / s.track, -0.6, 0.6);
      this.inWater = (yF + yR) / 2 < world.SEA - 0.6;

      // --- direksiyon ---
      let lock = s.lock;
      if (this.steerAssist) {
        const v = Math.abs(this.vx);
        const lim = Math.atan((L * s.mu * G * 1.1) / Math.max(1, v * v)) + 0.1;
        lock = Math.min(lock, lim);
      }
      this.steer = inp.steer;
      const delta = (this.delta = inp.steer * lock);

      // --- yükler ---
      const h = s.cgH, W = m * G, down = (s.cl || 0) * this.vx * this.vx;
      const dFx = (m * this.axF * h) / L;
      const kf = s.rollF, dFyF = ((m * this.ayF * h) / s.track) * kf, dFyR = ((m * this.ayF * h) / s.track) * (1 - kf);
      const FzF0 = (W * b) / L / 2, FzR0 = (W * a) / L / 2;
      const Fz = [
        Math.max(0, FzF0 - dFx / 2 + dFyF + down * 0.2), Math.max(0, FzF0 - dFx / 2 - dFyF + down * 0.2),
        Math.max(0, FzR0 + dFx / 2 + dFyR + down * 0.3), Math.max(0, FzR0 + dFx / 2 - dFyR + down * 0.3),
      ];
      const mu0 = s.mu * this.tune.grip * muSurf;
      const muW = (i, ref) => mu0 * U.clamp(1 - 0.13 * (Fz[i] / ref - 1), 0.6, 1.15);
      const capF = muW(0, FzF0) * Fz[0] + muW(1, FzF0) * Fz[1], capR = muW(2, FzR0) * Fz[2] + muW(3, FzR0) * Fz[3];

      // --- motor / aktarma ---
      let thr = this.engineOn ? U.clamp(inp.throttle, 0, 1) : 0;
      if (this.starter > 0) { this.starter -= dt; if (this.starter <= 0) this.engineOn = true; }
      if (this.fuel <= 0) this.engineOn = false;
      const ratio = this.ratio(), R = s.R;
      const fShare = s.drive === 'fwd' ? 1 : s.drive === 'rwd' ? 0 : s.awdFront;
      const spinD = this.spinF * fShare + this.spinR * (1 - fShare);
      const vw = Math.abs(this.vx) + spinD;
      const rpmC = (vw / R) * Math.abs(ratio) * 9.5493;
      const stall = s.idle + thr * (s.stall - s.idle);
      const coupled = ratio !== 0 && rpmC >= stall;
      let rpmT = ratio === 0 ? s.idle + thr * (s.redline - s.idle) : Math.max(rpmC, stall);
      if (!this.engineOn) rpmT = this.starter > 0 ? 300 : 0;
      this.rpm = U.damp(this.rpm, Math.min(rpmT, s.redline + 150), ratio === 0 ? 6 : 14, dt);
      // TCS
      this.tcsOn = false;
      if (this.tcs && this.escMode > 0 && spinD > 1.2 && thr > 0) { thr *= U.clamp(1 - (spinD - 1.2) * 0.16, 0.3, 1); this.tcsOn = true; }
      let T = 0;
      if (this.engineOn && ratio !== 0 && this.shiftT <= 0) {
        if (this.rpm < s.redline) T = torqueAt(s.torque, this.rpm) * thr;
        if (!coupled) T = T * (1 + 0.6 * (1 - rpmC / Math.max(1, stall))) + (rpmC < s.idle ? this.tmax * 0.13 * (1 - rpmC / s.idle) : 0);
        else if (thr < 0.05) T -= this.tmax * (0.06 + 0.12 * (this.rpm / s.redline));
      }
      if (this.shiftT > 0) this.shiftT -= dt;
      if (this.shiftCd > 0) this.shiftCd -= dt;
      this.throttleOut = thr;
      let Fd = (T * ratio * 0.9) / R; // + ileri
      // otomatik vites
      if (this.mode === 'D' && !this.manual && this.shiftCd <= 0 && this.engineOn) {
        const up = U.lerp(s.redline * 0.36, s.redline * 0.97, Math.pow(inp.throttle, 1.3));
        const gNow = s.gears[this.gear - 1];
        if (this.rpm > up && this.gear < s.gears.length && spinD < 2) this.shift(1);
        else if (this.gear > 1) {
          const rpmLow = (rpmC * s.gears[this.gear - 2]) / gNow;
          if (rpmLow < up * 0.82 && (this.rpm < U.lerp(s.idle * 1.35, s.redline * 0.5, inp.throttle) || rpmLow < up * 0.55)) this.shift(-1);
        }
      }

      // --- boyuna kuvvetler (aks başına) ---
      const mEq = 260 + 0.25 * ratio * ratio; // dönen kütle eşdeğeri
      let FxF = 0, FxR = 0;
      const drv = [Fd * fShare, Fd * (1 - fShare)], caps = [capF, capR], spins = [this.spinF, this.spinR];
      for (let k = 0; k < 2; k++) {
        const dem = Math.abs(drv[k]), cap = caps[k] * 0.98;
        if (dem > cap || spins[k] > 0.05) {
          spins[k] += ((dem - cap * 0.9) / mEq) * dt * 1.6 - (dem < cap ? spins[k] * 10 * dt : 0);
          if (spins[k] < 0) spins[k] = 0;
          if (spins[k] > 40) spins[k] = 40;
        }
        const f = spins[k] > 0.05 ? Math.min(dem, cap * 0.92) : dem;
        if (k === 0) FxF = f * U.sign(drv[k]); else FxR = f * U.sign(drv[k]);
      }
      this.spinF = spins[0]; this.spinR = spins[1];
      // fren
      const brk = U.clamp(inp.brake, 0, 1), bMax = s.brakeG * W;
      let bF = brk * bMax * this.tune.bias, bR = brk * bMax * (1 - this.tune.bias);
      let lockF = false, lockR = false; this.absOn = false;
      if (bF > capF * 0.97) { if (this.abs) { bF = capF * 0.97; this.absOn = Math.abs(this.vx) > 2; } else { bF = capF * 0.8; lockF = Math.abs(this.vx) > 1; } }
      if (bR > capR * 0.97) { if (this.abs) { bR = capR * 0.97; this.absOn = this.absOn || Math.abs(this.vx) > 2; } else { bR = capR * 0.8; lockR = Math.abs(this.vx) > 1; } }
      const hb = U.clamp(inp.handbrake || 0, 0, 1);
      if (hb > 0.1) { bR = Math.max(bR, hb * capR * 0.75); lockR = lockR || Math.abs(this.vx) > 1; }
      if (this.mode === 'P') { bR = capR; bF = capF; }
      // sürtünme elipsi
      const usedF = U.clamp((Math.abs(FxF) + bF) / Math.max(1, capF), 0, 1), usedR = U.clamp((Math.abs(FxR) + bR) / Math.max(1, capR), 0, 1);
      let latF = Math.sqrt(Math.max(0.05, 1 - usedF * usedF * 0.9)), latR = Math.sqrt(Math.max(0.05, 1 - usedR * usedR * 0.9));
      if (this.spinF > 1) latF *= Math.max(0.4, 1 / (1 + 0.2 * this.spinF));
      if (this.spinR > 1) latR *= Math.max(0.4, 1 / (1 + 0.2 * this.spinR));
      if (lockF) latF *= 0.3; if (lockR) latR *= hb > 0.1 ? 0.42 : 0.3;
      if (this.diffLock && rough < 0.2) latF *= 0.9;

      // --- yanal kuvvetler ---
      const cd = Math.cos(delta), sd = Math.sin(delta);
      const vfy = this.vy + a * this.r, vry = this.vy - b * this.r;
      const vlF = this.vx * cd + vfy * sd, vtF = -this.vx * sd + vfy * cd;
      const alF = Math.atan2(vtF, Math.max(Math.abs(vlF), 3)), alR = Math.atan2(vry, Math.max(Math.abs(this.vx), 3));
      const B = s.tireB;
      const cF = tire(alF, B), cR = tire(alR, B * 1.05);
      const FyFw = -cF * (muW(0, FzF0) * Fz[0] + muW(1, FzF0) * Fz[1]) * latF;
      const FyR = -cR * (muW(2, FzR0) * Fz[2] + muW(3, FzR0) * Fz[3]) * latR;
      this.slipF = Math.max(U.clamp((Math.abs(alF) - 0.14) * 5, 0, 1), U.clamp(this.spinF / 6, 0, 1), lockF ? 1 : 0) * (this.speed > 2 || this.spinF > 1 ? 1 : 0);
      this.slipR = Math.max(U.clamp((Math.abs(alR) - 0.14) * 5, 0, 1), U.clamp(this.spinR / 6, 0, 1), lockR ? 1 : 0) * (this.speed > 2 || this.spinR > 1 ? 1 : 0);

      // --- ESC ---
      let Mz = 0, escBrake = 0; this.escOn = false;
      if (this.escMode > 0 && Math.abs(this.vx) > 7 && hb < 0.1) {
        let rRef = (this.vx * delta) / (L * (1 + (this.vx * this.vx) / 900));
        const rLim = (0.95 * mu0 * G) / Math.abs(this.vx);
        rRef = U.clamp(rRef, -rLim, rLim);
        const err = this.r - rRef, th = this.escMode === 2 ? 0.07 : 0.28;
        if (Math.abs(err) > th) {
          const gain = this.escMode === 2 ? 7 : 3.5;
          Mz = U.clamp(-(err - U.sign(err) * th) * this.Iz * gain, -W * 0.5, W * 0.5);
          escBrake = Math.abs(Mz) * 0.25; this.escOn = true;
        }
      }

      // --- toplam ---
      const sgp = gp / Math.sqrt(1 + gp * gp), sgr = gr / Math.sqrt(1 + gr * gr);
      const Fdrive = FxF * cd + FxR - FyFw * sd - m * G * sgp;
      const Fy = FyFw * cd + FxF * sd + FyR - m * G * sgr;
      const crr = 0.012 + rough * 0.06;
      const Fres = bF + bR + escBrake + crr * W + s.cdA * this.vx * this.vx + (this.inWater ? 3 * W : 0);
      const vx0 = this.vx;
      this.vx += (Fdrive / m + this.r * this.vy) * dt;
      const dv = (Fres / m) * dt;
      if (Math.abs(this.vx) <= dv) this.vx = 0; else this.vx -= U.sign(this.vx) * dv;
      this.vy += (Fy / m - this.r * vx0) * dt;
      this.r += ((a * (FyFw * cd + FxF * sd) - b * FyR + Mz) / this.Iz) * dt;
      // düşük hız sönümü
      if (Math.abs(this.vx) < 1.2) { const k = Math.exp(-(1.2 - Math.abs(this.vx)) * 14 * dt); this.vy *= k; this.r *= k; }
      this.ax = (this.vx - vx0) / dt - this.r * this.vy; this.ay = Fy / m;
      this.axF = U.damp(this.axF, U.clamp(this.ax, -14, 14), 9, dt); this.ayF = U.damp(this.ayF, U.clamp(this.ay, -14, 14), 9, dt);

      // --- konum ---
      this.heading += this.r * dt;
      const c2 = Math.cos(this.heading), s2 = Math.sin(this.heading);
      let wvx = c2 * this.vx - s2 * this.vy, wvz = s2 * this.vx + c2 * this.vy;
      this.x += wvx * dt; this.z += wvz * dt;
      this.odo += Math.abs(this.vx) * dt;
      // köprü korkuluğu
      let hit = false, nx = 0, nz = 0;
      const g = this.g;
      if (g.bridge && g.edge) {
        const lim = g.edge.halfW - 0.2 - s.width / 2;
        if (Math.abs(g.lat) > lim) {
          const p = g.edge.pts[g.i], ex = (Math.abs(g.lat) - lim) * U.sign(g.lat);
          this.x -= p.nx * ex; this.z -= p.nz * ex; nx = -p.nx * U.sign(g.lat); nz = -p.nz * U.sign(g.lat); hit = true;
        }
      }
      // orta bariyer
      if (g.edge && g.edge.barrier && !g.node && g.i > 1 && g.i < g.edge.pts.length - 3) {
        const lim = 0.36 + s.width / 2;
        if (Math.abs(g.lat) < lim) {
          const p = g.edge.pts[g.i], sg = g.lat >= 0 ? 1 : -1, ex = (lim - Math.abs(g.lat)) * sg;
          this.x += p.nx * ex; this.z += p.nz * ex; nx = p.nx * sg; nz = p.nz * sg; hit = true;
        }
      }
      // binalar (ön ve arka daire)
      for (let k = 0; k < 2 && world.collide; k++) {
        const o = (k === 0 ? a : -b) * 0.8, px = this.x + c2 * o, pz = this.z + s2 * o, col = this.col;
        if (world.collide(px, pz, s.width / 2 + 0.1, col)) { this.x += col.x - px; this.z += col.z - pz; nx = col.nx; nz = col.nz; hit = true; }
      }
      if (hit) this.bounce(nx, nz, 0.15);
      // --- düşey / gövde ---
      const yT = (yF + yR) / 2;
      this.y = U.damp(this.y, yT, 30, dt);
      this.gPitch = U.damp(this.gPitch, Math.atan(gp), 14, dt); this.gRoll = U.damp(this.gRoll, -Math.atan(gr), 14, dt);
      const om = 2 * Math.PI * s.suspHz * Math.sqrt(this.tune.susp), ze = 0.42;
      const pT = (s.pitchGain * this.ax) / this.tune.susp, rT = (-s.rollGain * this.ay) / this.tune.susp;
      this.pitchV += ((pT - this.pitch) * om * om - 2 * ze * om * this.pitchV) * dt; this.pitch += this.pitchV * dt;
      this.rollV += ((rT - this.roll) * om * om - 2 * ze * om * this.rollV) * dt; this.roll += this.rollV * dt;
      const bump = rough * Math.min(1, this.speed / 8) * (U.noise2(this.x * 0.9, this.z * 0.9) - 0.5) * 0.09;
      this.heaveV += ((bump - this.heave) * om * om - 2 * ze * om * this.heaveV) * dt; this.heave += this.heaveV * dt;
      for (let i = 0; i < 4; i++) {
        const drvn = i < 2 ? fShare > 0 : fShare < 1;
        this.wheelRot[i] += ((this.vx + (drvn ? (i < 2 ? this.spinF : this.spinR) * U.sign(ratio || 1) : 0)) / R) * dt * ((i < 2 ? lockF : lockR) ? 0 : 1);
      }
      // --- yakıt / hararet ---
      if (this.engineOn) {
        const pw = Math.max(0, T) * this.rpm * 0.1047;
        this.fuel -= (0.00022 + pw * 7.5e-8) * dt;
        const tT = 88 + (pw / 1000 / Math.max(60, s.powerKw || 150)) * 22 - Math.min(10, Math.abs(this.vx) * 0.25);
        this.temp = U.damp(this.temp, tT, 0.03, dt);
      } else this.temp = U.damp(this.temp, 25, 0.004, dt);
      if (this.hitT > 0) this.hitT -= dt;
    }
    // Dünya normaline (nx,nz) göre hızı kes — hasarsız temas
    bounce(nx, nz, rest) {
      const c = Math.cos(this.heading), s = Math.sin(this.heading);
      let wvx = c * this.vx - s * this.vy, wvz = s * this.vx + c * this.vy;
      const vn = wvx * nx + wvz * nz;
      if (vn < 0) {
        wvx -= (1 + rest) * vn * nx; wvz -= (1 + rest) * vn * nz;
        wvx *= 0.985; wvz *= 0.985;
        this.vx = c * wvx + s * wvz; this.vy = -s * wvx + c * wvz;
        this.r *= 0.9;
        if (vn < -1.5 && this.hitT <= 0) { this.hitT = 0.4; this.lastHit = -vn; }
      }
    }
  }
  PC.Vehicle = Vehicle;
  PC.torqueAt = torqueAt;
})();
