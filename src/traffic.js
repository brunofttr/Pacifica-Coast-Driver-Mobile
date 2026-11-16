// Pacifica Coast — trafik: sinyaller, IDM takip, şerit değiştirme, kavşak önceliği, park hâlindeki araçlar
(function () {
  'use strict';
  const PC = window.PC, U = PC.U;

  // ---------- sinyaller ----------
  const SG = { G: 13, Y: 3, AR: 1.5 };
  SG.half = SG.G + SG.Y + SG.AR; SG.T = SG.half * 2;
  const Signals = (PC.Signals = {
    t: 0,
    // 0 yeşil, 1 sarı, 2 kırmızı
    state(node, axis) {
      let ph = (Signals.t + (node.x + node.z) * 0.045 + 1000 * SG.T) % SG.T;
      if (axis === 1) ph = (ph + SG.half) % SG.T;
      return ph < SG.G ? 0 : ph < SG.G + SG.Y ? 1 : 2;
    },
  });

  // ---------- yol parçası üstünde konum ----------
  function posOn(piece, s, o) {
    const P = piece.pts, C = piece.cum, n = P.length;
    let i = Math.floor((s / piece.len) * (n - 1));
    if (i < 0) i = 0; if (i > n - 2) i = n - 2;
    while (i > 0 && C[i] > s) i--;
    while (i < n - 2 && C[i + 1] < s) i++;
    const a = P[i], b = P[i + 1], l = C[i + 1] - C[i] || 1, t = (s - C[i]) / l;
    o.x = a.x + (b.x - a.x) * t; o.y = a.y + (b.y - a.y) * t; o.z = a.z + (b.z - a.z) * t;
    o.tx = (b.x - a.x) / l; o.tz = (b.z - a.z) / l; o.slope = (b.y - a.y) / l;
    return o;
  }
  function kappaOf(piece) {
    if (piece.kap) return piece.kap;
    const P = piece.pts, n = P.length, k = new Float32Array(n);
    for (let i = 1; i < n - 1; i++) {
      const a = P[i - 1], b = P[i], c = P[i + 1];
      const h1 = Math.atan2(b.z - a.z, b.x - a.x), h2 = Math.atan2(c.z - b.z, c.x - b.x);
      k[i] = Math.abs(U.angDiff(h2, h1)) / (0.5 * (Math.hypot(b.x - a.x, b.z - a.z) + Math.hypot(c.x - b.x, c.z - b.z)) || 1);
    }
    k[0] = k[1]; k[n - 1] = k[n - 2];
    return (piece.kap = k);
  }
  PC.posOn = posOn;

  const COLORS = [0xd8d8d8, 0x1b1b1f, 0x8a8f96, 0x7a1a1a, 0x1c3a6b, 0xe8e4d8, 0x2f4a3a, 0xb8862b, 0x44464c, 0xf2f2f2, 0x5a1f1f, 0x23425f];
  const _p = {}, _q = {};

  const Traffic = (PC.Traffic = {
    cars: [], parked: [], max: 5, maxParked: 15, models: [], horns: [], aggression: 0.6, spawnT: 0, parkT: 0, time: 0, idc: 1,

    init(world, models) { this.world = world; this.models = models; this.cars.length = 0; this.parked.length = 0; for (const n of world.nodes) n.occ = []; },

    spawnAt(lane, s, rnd) {
      const r = rnd || Math.random;
      const mi = (r() * this.models.length) | 0, md = this.models[mi];
      const aggr = U.clamp(this.aggression + (r() - 0.5) * 0.6, 0, 1);
      const c = {
        id: this.idc++, model: mi, color: COLORS[(r() * COLORS.length) | 0], len: md.len, width: md.width,
        piece: lane, lane, s, v: lane.speed * 0.7, acc: 0, lat: 0, latT: 0, aggr,
        v0f: 0.92 + aggr * 0.3, exit: null, conn: null, hold: null,
        x: 0, y: 0, z: 0, heading: 0, slope: 0, vxw: 0, vzw: 0, brake: false, ind: 0, blink: 0,
        waitT: 0, stuckT: 0, hornCd: 2 + r() * 3, lcCd: 2, lcPending: null, redStopT: 0, isTraffic: true, steerVis: 0,
      };
      this.pickExit(c, r);
      this.place(c);
      this.cars.push(c);
      return c;
    },
    pickExit(c, r) {
      const ex = this.world.exitsOf(c.lane);
      let tot = 0;
      for (const e of ex) tot += e.turn === 0 ? 2.2 : 1;
      let x = (r || Math.random)() * tot;
      for (const e of ex) { x -= e.turn === 0 ? 2.2 : 1; if (x <= 0) { c.exit = e; return; } }
      c.exit = ex[0];
    },
    place(c) {
      posOn(c.piece, U.clamp(c.s, 0, c.piece.len), _p);
      c.x = _p.x - _p.tz * c.lat; c.z = _p.z + _p.tx * c.lat; c.y = _p.y; c.slope = _p.slope;
      const latRate = c.latT > 0 ? c.lat / Math.max(0.3, c.latT) : 0;
      c.heading = Math.atan2(_p.tz, _p.tx) - Math.atan2(latRate, Math.max(3, c.v));
      c.vxw = _p.tx * c.v; c.vzw = _p.tz * c.v;
    },
    // Aracın yolu üzerinde ileri mesafe d'deki nokta (şerit -> bağlantı -> sonraki şerit)
    ahead(c, d, o) {
      let s = c.s + d, piece = c.piece;
      if (s > piece.len) {
        s -= piece.len;
        if (!piece.conn) { piece = c.conn || this.world.connector(c.lane, c.exit.lane); if (s > piece.len) { s -= piece.len; piece = c.exit.lane; } }
        else piece = c.exit.lane;
      }
      return posOn(piece, Math.min(s, piece.len), o);
    },
    conflict(c, o) {
      if (o === c) return false;
      const a = c.conn || this.world.connector(c.lane, c.exit.lane), b = o.conn;
      if (!b) return false;
      if (a.from.edge === b.from.edge && a.from.dir === b.from.dir) return false; // aynı koldan gelenler
      if (a.turn === 0 && b.turn === 0 && a.from.endAxis === b.from.endAxis) return false; // karşılıklı düz
      if (a.turn === 1 && b.turn === 1) return false;
      return true;
    },

    update(dt, player) {
      const W = this.world;
      this.time += dt; Signals.t += dt; this.horns.length = 0;
      const cars = this.cars;
      // ---- doğurma / kaldırma ----
      this.spawnT -= dt;
      for (let i = cars.length - 1; i >= 0; i--) {
        const c = cars[i], d = Math.hypot(c.x - player.x, c.z - player.z);
        if (d > 340 || (c.stuckT > 20 && d > 90) || cars.length > this.max) this.remove(c);
      }
      if (this.spawnT <= 0) { this.spawnT = 0.35; if (cars.length < this.max) this.trySpawn(player); }
      this.parkT -= dt;
      if (this.parkT <= 0) { this.parkT = 0.3; this.updateParked(player); }

      // ---- sürüş ----
      for (const c of cars) {
        const lane = c.lane, inConn = !!c.piece.conn;
        const race = c.raceT > 0; if (race) c.raceT -= dt;
        let v0 = c.piece.speed * (race ? 2.1 : c.v0f);
        const a = race ? 5.2 : 1.7 + 1.8 * c.aggr, b = 2.4 + 1.8 * c.aggr, T = race ? 0.6 : 1.35 - 0.75 * c.aggr, s0 = 2.2;
        // viraj hızı
        const aLat = 2.4 + 2.2 * c.aggr;
        for (let d = 0; d <= 70; d += 7) {
          let s = c.s + d, piece = c.piece;
          if (s > piece.len) { if (inConn) { s -= piece.len; piece = c.exit.lane; } else { s -= piece.len; piece = W.connector(lane, c.exit.lane); if (s > piece.len) { s -= piece.len; piece = c.exit.lane; } } }
          const kap = kappaOf(piece), i = Math.min(kap.length - 1, Math.round((s / piece.len) * (kap.length - 1)));
          if (kap[i] > 0.004) { const vc = Math.sqrt(aLat / kap[i]); const va = Math.sqrt(vc * vc + 2 * b * 0.6 * d); if (va < v0) v0 = va; }
        }
        // ---- önündeki engel ----
        let gap = 1e9, vl = 0, leadPlayer = false;
        const look = Math.max(28, c.v * 4.5 + 16);
        // kavşak / sinyal
        let stopLine = false;
        if (!inConn) {
          const node = lane.to, dEnd = lane.len - 4.5 - c.s - c.len / 2;
          const hasChoice = node.inLanes.length > node.edges.length * 0 && node.edges.length >= 3;
          if (hasChoice && dEnd < look + 20) {
            let mustStop = false;
            if (node.signal) {
              const st = Signals.state(node, lane.endAxis);
              if (st === 2) {
                mustStop = true;
                if (c.exit.turn === 1 && c.redStopT > 1.2) mustStop = false; // kırmızıda sağa dönüş
              } else if (st === 1) mustStop = dEnd > (c.v * c.v) / (2 * (3 + 3.5 * c.aggr)) && dEnd > 1;
            }
            // öncelik: kavşaktaki çakışan araçlar
            if (!mustStop && c.hold !== node) {
              let blocked = false;
              for (const o of node.occ) if (this.conflict(c, o)) { blocked = true; break; }
              if (blocked) mustStop = true;
              else if (dEnd < 6 + c.v * 0.8) { node.occ.push(c); c.hold = node; c.conn = W.connector(lane, c.exit.lane); }
            }
            if (mustStop && c.hold !== node && dEnd > -3) { gap = Math.max(0.01, dEnd); vl = 0; stopLine = true; }
          }
          if (stopLine && c.v < 0.3 && gap < 3) c.redStopT += dt; else if (!stopLine || c.v > 2) c.redStopT = stopLine ? c.redStopT : 0;
        }
        // diğer araçlar + oyuncu
        const hw = c.width / 2;
        for (let k = -1; k < cars.length; k++) {
          const o = k < 0 ? player : cars[k];
          if (o === c) continue;
          const dx = o.x - c.x, dz = o.z - c.z, dd = dx * dx + dz * dz;
          if (dd > (look + 8) * (look + 8)) continue;
          if (k >= 0) { // karşıdan gelenleri yok say
            const dh = Math.abs(U.angDiff(o.heading, c.heading));
            if (dh > 2.0) continue;
          }
          const rad = hw + (o.width || 1.9) / 2 + (k < 0 ? 0.35 : 0.15);
          const oh = (o.len || 4.6) * 0.33, ohx = Math.cos(o.heading) * oh, ohz = Math.sin(o.heading) * oh;
          for (let d = c.len / 2; d <= look; d += 2.5) {
            this.ahead(c, d, _q);
            _q.x -= _q.tz * c.lat; _q.z += _q.tx * c.lat;
            let hit = false;
            for (let m = -1; m <= 1; m++) { const ex = o.x + ohx * m - _q.x, ez = o.z + ohz * m - _q.z; if (ex * ex + ez * ez < rad * rad) { hit = true; break; } }
            if (hit) {
              const g = d - c.len / 2 - 1.2;
              if (g < gap) {
                gap = Math.max(0.05, g);
                const ovx = k < 0 ? player.vxw : o.vxw, ovz = k < 0 ? player.vzw : o.vzw;
                vl = Math.max(0, ovx * _q.tx + ovz * _q.tz); leadPlayer = k < 0; stopLine = false;
              }
              break;
            }
          }
        }
        // ---- IDM ----
        const dv = c.v - vl;
        const sStar = s0 + Math.max(0, c.v * T + (c.v * dv) / (2 * Math.sqrt(a * b)));
        let acc = a * (1 - Math.pow(c.v / Math.max(1, v0), 4) - (gap < 1e8 ? (sStar / gap) * (sStar / gap) : 0));
        acc = U.clamp(acc, -9.5, a);
        c.acc = acc; c.v = Math.max(0, c.v + acc * dt);
        if (gap < 0.4 && vl < 0.5) c.v = 0;
        c.brake = acc < -0.7 || c.v < 0.25;
        // korna / sabırsızlık
        if (c.v < 0.5) { c.stuckT += dt; c.waitT += dt; } else { c.stuckT = 0; c.waitT = 0; }
        c.hornCd -= dt;
        if (leadPlayer && c.hornCd <= 0 && ((c.waitT > 2.5 - c.aggr * 1.5 && player.speed < 1.5) || (gap < 6 && c.acc < -5))) {
          this.horns.push(c); c.hornCd = 2.5 + (1 - c.aggr) * 5 + Math.random() * 2;
        }
        // ---- duran oyuncunun etrafından dolaş (tek şeritli yol, karşı şerit boşsa) ----
        if (c.byT > 0) { c.byT -= dt; if (leadPlayer) c.v = Math.max(c.v, 1.2); }
        else if (leadPlayer && c.waitT > 5 && player.speed < 0.5 && !inConn && lane.edge.n === 1 && lane.len - c.s > 30 && c.latT <= 0) {
          let clear = true;
          for (const o of cars) if (o !== c && Math.abs(U.angDiff(o.heading, c.heading)) > 2 && Math.hypot(o.x - c.x, o.z - c.z) < 70) clear = false;
          if (clear) { c.byT = 7; c.waitT = 0; c.stuckT = 0; }
        }
        if (c.latT <= 0 && (c.byT > 0 || c.lat !== 0)) { c.lat = U.damp(c.lat, c.byT > 1.8 ? -3.3 : 0, 1.6, dt); if (Math.abs(c.lat) < 0.01 && !(c.byT > 1.8)) c.lat = 0; }
        // ---- şerit değiştirme ----
        c.lcCd -= dt;
        if (!inConn && lane.edge.n > 1 && c.latT <= 0 && !(c.byT > 0) && c.s > 8 && c.s < lane.len - Math.min(70, lane.len * 0.3)) {
          if (c.lcPending) {
            c.lcPending.t -= dt;
            if (c.lcPending.t <= 0) {
              const tl = c.lcPending.lane;
              if (this.laneFree(c, tl, player)) {
                const off = (tl.k - lane.k) * lane.edge.laneW; // + = sağa
                c.lat = -off; c.latT = 2.6 - c.aggr; c.lat0 = c.lat; c.latDur = c.latT;
                c.s = (c.s / lane.len) * tl.len; c.lane = c.piece = tl; c.exit = null; this.pickExit(c);
                c.lcCd = 4;
              } else c.lcCd = 1.5;
              c.lcPending = null;
            }
          } else if (c.lcCd <= 0) {
            c.lcCd = 0.6;
            const slow = gap < c.v * 2.4 + 10 && vl < v0 - 2.5 && !stopLine;
            let tk = -1;
            if (slow) tk = lane.k === 0 ? 1 : 0;
            else if (lane.k === 0 && gap > 60 && c.aggr < 0.85) tk = 1; // sağa dön
            if (tk >= 0 && tk < lane.edge.n) {
              const tl = lane.edge.lanes.find((l) => l.dir === lane.dir && l.k === tk);
              if (this.laneFree(c, tl, player)) c.lcPending = { lane: tl, t: 1.3 - 0.8 * c.aggr, dir: tk > lane.k ? 1 : -1 };
            }
          }
        }
        if (c.latT > 0) { c.latT -= dt; const t = U.clamp(1 - c.latT / c.latDur, 0, 1); c.lat = c.lat0 * (1 - t * t * (3 - 2 * t)); if (c.latT <= 0) c.lat = 0; }
        // ---- ilerle ----
        c.s += c.v * dt;
        if (c.s >= c.piece.len) {
          if (!c.piece.conn) {
            c.s -= c.piece.len;
            if (c.hold !== lane.to) { lane.to.occ.push(c); c.hold = lane.to; }
            c.conn = c.conn || W.connector(lane, c.exit.lane);
            c.piece = c.conn; if (c.raceT > 0 && lane.to.signal && lane.to.edges.length >= 3) c.raceT = 0; // ışığa vardı: yarış biter
          } else {
            c.s -= c.piece.len;
            this.release(c);
            c.lane = c.piece = c.exit.lane; c.conn = null; c.redStopT = 0;
            this.pickExit(c);
          }
        }
        // sinyal lambası
        let ind = 0;
        if (c.lcPending) ind = c.lcPending.dir; else if (c.latT > 0.4) ind = c.lat0 < 0 ? 1 : -1;
        else if (c.exit && c.exit.turn !== 0 && (c.piece.conn || lane.len - c.s < 55) && c.lane.to.edges.length >= 3) ind = c.exit.turn;
        c.ind = ind; c.blink = ind !== 0 ? (this.time * 1.6) % 1 < 0.5 : false;
        const h0 = c.heading;
        this.place(c);
        c.steerVis = U.clamp(U.angDiff(c.heading, h0) / Math.max(0.2, c.v * dt) * 2.7, -0.6, 0.6);
      }
    },
    release(c) { if (c.hold) { const a = c.hold.occ, i = a.indexOf(c); if (i >= 0) a.splice(i, 1); c.hold = null; } },
    remove(c) { this.release(c); const i = this.cars.indexOf(c); if (i >= 0) this.cars.splice(i, 1); },
    laneFree(c, tl, player) {
      posOn(tl, U.clamp((c.s / c.lane.len) * tl.len, 0, tl.len), _q);
      const back = 7 + c.v * (0.9 - 0.4 * c.aggr), front = 6 + c.v * 0.5;
      for (let k = -1; k < this.cars.length; k++) {
        const o = k < 0 ? player : this.cars[k]; if (o === c) continue;
        const dx = o.x - _q.x, dz = o.z - _q.z, al = dx * _q.tx + dz * _q.tz, la = -dx * _q.tz + dz * _q.tx;
        if (Math.abs(la) < 2.1 && al > -back && al < front) return false;
      }
      return true;
    },
    trySpawn(player) {
      const W = this.world, o = {};
      const ph = Math.atan2(player.vzw, player.vxw), moving = player.speed > 4;
      for (let t = 0; t < 10; t++) {
        const ang = moving && Math.random() < 0.75 ? ph + (Math.random() - 0.5) * 1.6 : Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 130;
        const px = player.x + Math.cos(ang) * dist, pz = player.z + Math.sin(ang) * dist;
        W.groundAt(px, pz, o);
        if (!o.edge || o.surf !== 0) continue;
        const e = o.edge, dir = Math.random() < 0.5 ? 1 : -1, k = Math.random() < 0.7 ? e.n - 1 : 0;
        const lane = e.lanes.find((l) => l.dir === dir && l.k === k);
        const s = U.clamp(dir > 0 ? o.s : e.len - o.s, 12, lane.len - 30);
        if (lane.len < 60) continue;
        posOn(lane, s, _q);
        let ok = Math.hypot(_q.x - player.x, _q.z - player.z) > 130;
        for (const c of this.cars) if (Math.hypot(c.x - _q.x, c.z - _q.z) < 45) ok = false;
        if (!ok) continue;
        this.spawnAt(lane, s);
        return;
      }
    },
    updateParked(player) {
      const slots = this.world.parkSlots, near = [];
      for (const s of slots) { const dx = s.x - player.x, dz = s.z - player.z; let d = dx * dx + dz * dz; if (d > 340 * 340) continue; if (dx * player.vxw + dz * player.vzw > 0) d *= 0.3; near.push([d, s]); } // gidiş yönündekiler öncelikli
      near.sort((a, b) => a[0] - b[0]);
      this.parked.length = 0;
      for (let i = 0; i < Math.min(this.maxParked, near.length); i++) {
        const s = near[i][1];
        if (s.model === undefined) { s.model = s.seed % this.models.length; s.color = COLORS[(s.seed >> 3) % COLORS.length]; s.len = this.models[s.model].len; s.width = this.models[s.model].width; }
        this.parked.push(s);
      }
    },
  });
})();
