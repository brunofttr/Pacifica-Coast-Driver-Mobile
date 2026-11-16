# Pacifica Coast Driver Mobile — geliştirici rehberi (Claude Code / telefondan devam için)

Türkçe konuş. Oyun: three.js r160 (global build, paketleyicisiz), klasik `<script>` dosyaları, `PC` ad alanı.

## Çalıştırma
- Geliştirme: `php -S 127.0.0.1:8123` → tarayıcıda aç (kaynak dosyalar doğrudan okunur).
- Derleme: `php build.php` → `dist/pacifica-coast.html` (CSS+JS+dokular+sesler gömülü) + `dist/data/<id>.js` (araç paketleri, seçilince yüklenir) + `dist/video/`.
- APK: `apk/build-apk.ps1` (Windows, Android SDK build-tools 36, JDK; imza anahtarı `apk/test.jks` depoda YOK, parola `PCD_KS_PASS`). Paket adı `com.pacifica.coast`; sürüm `apk/AndroidManifest.xml`.
- Test: `tests.html` (mantık) ve `tools/gametest.js` (konsolda `await runAll()`; 400+ kontrol). Her değişiklikten sonra çalıştır.

## Dosya haritası
`src/world.js` yol ağı/şehir · `physics.js` araç fiziği (120 Hz) · `traffic.js` YZ trafiği · `cars.js`,`cars2.js` kodla çizilen trafik araçları · `extcars.js` glTF araç bağlayıcı (teker/direksiyon/ibre/cam/kabin yerleşimi) · `glbcar.js` Aurora · `cockpit.js` kokpit/gösterge · `scenery.js` arazi/bina/ağaç/su/gökyüzü · `post.js` HDR+bloom+SSAO · `fx.js` cam, lastik izi, duman, lambalar (`PC.carLamps`), görev · `ui.js` HUD/girdi/ayar varsayılanları · `menu.js` açılış, ana menü, ayarlar şeması, garaj, duraklat, güncelleme denetimi · `main.js` oyun döngüsü, durum makinesi (`G.mode`: boot/menu/play/pause), grafik ayarları (`applyGfx`).

## Kurallar
- Ana menüde ve duraklatmada 3B sahne ÇİZİLMEZ (`G.mode !== 'play'` → rAF durur). Bunu bozma.
- Yeni ayar: `src/ui.js` DEF + `src/menu.js` SCHEMA (+ gerekirse `main.js` `applySetting`/`applyGfx`). Grafik anahtarları `g` ile başlar, `PRESETS` içinde değeri olmalı.
- Araç eklemek: `tools_prep.php` (doku boyutu sınırla) → `tools_compress.php` → `src/extcars.js` EXT listesine `D(...)` → `tools/gametest.js` ile doğrula. İç mekânsız model ekleme; direksiyon ayrı parça/düğüm olmalı. Gerçek (`rig`/`real`) modellerde gösterge ibreleri modelin animasyon izlerinden sürülür.
- Lisans: Sketchfab "Ücretsiz Standart" modeller depoya konmaz (`THIRD-PARTY.md`). Sır / anahtar / parola commit'leme.
- Güncelleme bildirimi: `version.json` (`build` sayısı oyundaki `PC.VERSION.build`'den büyükse ana menüde duyurulur). Yeni sürümde ikisini birlikte artır, APK'yı Releases'e yükle.
- Çıktıları ve notları kullanıcının arşivine kaydet: `E:\Agency\claude dosyalar\<tarih_başlık>\` (README + INDEX.md satırı).

## Açık işler
Eğri/çapraz sokaklar · Tofaş Şahin (indirilemiyor) · Maextro S800 / Toyota Alphard (direksiyon ayrı parça değil, çok ağır) · telefonda gerçek FPS ölçümü · model geometri sıkıştırma (Draco/meshopt, çözücü gerekir).
