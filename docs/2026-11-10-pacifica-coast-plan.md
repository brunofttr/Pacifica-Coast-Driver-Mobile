# Pacifica Coast Implementation Plan

> Yürütme: bu oturumda satır içi (kullanıcı "durma, devam et" dedi).

**Goal:** S25+ için tek HTML'lik gerçekçi sürüş simülasyonu.
**Architecture:** three.js r160 (global build) + `PC` ad alanında klasik script'ler; saf mantık modülleri tarayıcı içi testlerle doğrulanır; `build.php` tek dosyaya gömer.
**Tech Stack:** JavaScript (ES2020), three.js r160, WebAudio, PHP (yalnızca derleme + yerel sunucu).
**Spec:** `docs/2026-11-10-pacifica-coast-design.md`

## Global Constraints
- Harici asset/ağ isteği yok; her şey prosedürel.
- En çok 5 hareketli + 15 park hâlinde trafik aracı; trafik camları opak siyah.
- Marka adı/logo yok.
- Fizik adımı 1/120 s sabit.

## Review Focus
1. Çok düşük hızda lastik modeli titremesi → dururken araç tamamen durmalı.
2. Köprü kenarından / suya düşme → araç yola geri konur.
3. Trafik kilitlenmesi (kavşakta karşılıklı bekleme) → zaman aşımıyla çözülür.
4. Sekme arka plana geçince dt sıçraması → adım sayısı sınırlanır.
5. Dokunmatik çoklu parmak: gaz + direksiyon + kamera aynı anda.

## Tasks
| # | Dosya | Üretir | Test |
|---|-------|--------|------|
| 1 | `src/util.js` | `PC.U`: clamp, lerp, rng, noise2, smoothstep | — |
| 2 | `src/world.js` | `PC.World.build()` → nodes, edges, lanes, `groundAt(x,z)`, `nearestRoad(x,z)`, bina kutuları | bağlılık, zemin yüksekliği |
| 3 | `src/physics.js` | `PC.Vehicle(spec)`, `.step(dt, input, world)` | 0-100, fren, sabit viraj, duruş |
| 4 | `src/traffic.js` | `PC.Signals`, `PC.Traffic.update(dt, player)` | kırmızıda durma, takip |
| 5 | `src/cars.js` | `PC.CarSpecs`, `PC.buildCar(spec, opts)` | görsel |
| 6 | `src/cockpit.js` | `PC.buildCockpit(spec)` + gösterge güncelleme | görsel |
| 7 | `src/scenery.js` | arazi, yol, şehir, köprü, gökyüzü, su | görsel |
| 8 | `src/audio.js`, `src/input.js`, `src/hud.js` | ses, kontroller, HUD/menü/app'ler | elle |
| 9 | `src/main.js`, `index.html` | oyun döngüsü, kameralar, yansıma, kalite | elle |
| 10 | `build.php`, `tests.html` | `dist/pacifica-coast.html` | tarayıcıda doğrulama |
