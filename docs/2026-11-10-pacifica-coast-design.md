# Pacifica Coast — Tasarım (Spec)

Tarih: 2026-11-10 · Hedef cihaz: Samsung S25+ (Android, One UI), yatay tam ekran, Chrome / Samsung Internet.

## Amaç
Tek kişinin kendi telefonunda oynayacağı, kaza/hasar fiziği olmayan ama sürüş hissi gerçekçi bir açık dünya sürüş simülasyonu. Özgün oyun: BeamNG'nin adı, araçları, haritası kopyalanmaz; araçlar gerçek markalardan *esinlenir*, logo ve marka adı yoktur.

## Teslim
- Tek dosya: `dist/pacifica-coast.html` (three.js r160 gömülü, çevrimdışı çalışır, harici asset yok).
- APK yapılmaz: WebView aynı motoru kullandığı için performans kazancı yoktur.

## Gereksinimler
1. **Sürüş fiziği** — 120 Hz sabit adım; 4 tekerlekli yük transferi, Pacejka benzeri lastik + sürtünme elipsi, motor tork eğrisi, 6–8 ileri otomatik/manuel şanzıman, tork konvertörü, FWD/RWD/AWD/4x4, ABS, TCS, ESC, el freni, eğim ve zemin (asfalt/çim) etkisi, süspansiyon yatma/dalma. Çarpışma: hasar yok, yalnızca itme/durma.
2. **Araçlar (6, sürülebilir)** — spor sedan (Bavyera tarzı, RWD), arazi 4x4 (kutu gövde, 4L + diferansiyel kilidi), tam boy pickup, arkadan motorlu spor coupe, kompakt SUV (FWD), hot hatch (FWD). Prosedürel loft gövde + detaylar (ızgara, far, stop, ayna, kapı kolu, jant, egzoz, plaka, spoiler…), clearcoat boya, dinamik küp yansıma.
3. **Kokpit (FP)** — 3B direksiyon, geometri ibreli net göstergeler (hız, devir, yakıt, hararet), dijital vites/hız ekranı, orta ekranda harita, çalışan dikiz aynası. Cam şeffaf: iç mekân dışarıdan da görünür.
4. **Kameralar** — takip (TP), kokpit (FP), kaput, serbest yörünge; sürükleyerek etrafa bakma.
5. **Harita** — ~5×5 km: ızgara şehir (49 ışıklı kavşak, park şeritli sokaklar), körfez üstünde asma köprü, 4 şeritli otoyol, sahil yolu, tepe/kanyon yolu, okyanus.
6. **Trafik** — aynı anda en çok 5 hareketli + 15 park hâlinde araç; içleri siyah. IDM takip modeli, yol tipine göre hız (şehir 50, köprü 100, otoyol 120), kırmızıda durma, sinyal verip şerit değiştirme/dönme, kavşak önceliği; agresif: yakın takip, sarıda geçme, korna.
7. **BeamNG'den esinlenen özellikler** — UI "app"leri (G-metre, pedal göstergesi, takometre), ağır çekim, geri sarma ile kurtarma, gün saati kaydırıcısı, sürüş modları (ESC/TCS açık-spor-kapalı), 4x4 düşük vites/dif kilidi, ayar (tuning) paneli (lastik tutuşu, süspansiyon, fren dengesi, son dişli), kontak/marş, yakıt tüketimi, motor harareti, serbest kamera.
8. **Kontroller** — dokunmatik: direksiyon simidi / ok tuşları / eğme (seçilebilir), analog gaz-fren, el freni, vites, korna, far, sinyal, kamera. Ayrıca klavye ve gamepad.
9. **Performans** — hedef 60+ FPS; dinamik çözünürlük, kalite ön ayarları, tek draw-call'lu trafik gövdeleri, birleştirilmiş statik geometri.
10. **Ses** — sentezlenmiş motor, lastik, rüzgâr, korna, sinyal.

## Mimari
Klasik script'ler, tek `PC` ad alanı; saf mantık (three'siz) ile görsel katman ayrı:
`util → world → physics → traffic` (saf) · `cars → cockpit → scenery` (three) · `audio → input → hud → main`.
`build.php` hepsini tek HTML'e gömer.

## Doğrulama
- `tests.html`: yol ağı bağlılığı, zemin sorgusu, fizik (0-100, fren mesafesi, sabit viraj), trafik (kırmızıda durma, çarpışmama) için tarayıcı içi testler.
- Yerleşik tarayıcıda mobil görünümde oynanış, konsol hatası yok.
- Gerçek S25+ FPS'i burada ölçülemez; kullanıcı ilk açışta doğrular.
