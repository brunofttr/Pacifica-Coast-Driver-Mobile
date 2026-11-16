# Üçüncü taraf içerik ve lisanslar

| Ne | Kaynak / yazar | Lisans | Depoda |
|---|---|---|---|
| three.js r160 | mrdoob ve katkıcılar | MIT | `lib/` |
| "FREE Concept Car" serisi (c003, c005, c006, c007, c011, c033, c037, c038, c039, c040) | unityfan777, Sketchfab | CC0 | `assets/cars/` |
| "Car Concept" (Aurora GT) | Khronos Group, Unity Fan'ın CC0 modelinden | CC-BY 4.0 | `assets/models/` |
| Jeep Grand Wagoneer 1991, Pontiac G8 GXP 2009, Hyundai Veloster Turbo 2019, Škoda Elroq 2025 | geyges, Sketchfab | Sketchfab Ücretsiz Standart | **Yok** (aşağıya bak) |
| Motor sesi döngüleri "Racing car engine sound loops" | OpenGameArt | CC0 | `assets/audio/` |
| Lastik sesi "Car tire squeal skid loop" | OpenGameArt | CC-BY 3.0 | `assets/audio/` |
| Cephe, asfalt, kaplama, zemin, çim, yaprak, kabuk dokuları | ambientCG | CC0 | `assets/tex/` |
| Menü ve yükleme videoları, simge | proje sahibi (yapay zekâ ile üretilmiş) | — | `assets/video/`, `apk/` |

## Depoda olmayan modeller
Sketchfab Ücretsiz Standart lisansı modelin tek başına yeniden dağıtılmasına izin vermez; bu yüzden aşağıdaki dört model depoya konmadı ve `.gitignore` ile dışlandı. Yerel kopyada bulunmazlarsa oyun onları araç menüsünde otomatik gizler. Eklemek için (Sketchfab hesabıyla) glTF olarak indir:

- https://sketchfab.com/3d-models/jeep-grand-wagoneer-1991-8efea05e4eec410c97ee17a02786af92
- https://sketchfab.com/3d-models/pontiac-g8-gxp-2009-8ef8ede6081b4bb08a2adc78c8a3ffcb
- https://sketchfab.com/3d-models/hyundai-veloster-turbo-2019-85b72cf9ee17422f82b854ce44e028dc
- https://sketchfab.com/3d-models/skoda-elroq-2025-be5305189e874b1d9104435712e76de9

Sonra `php tools_prep.php <inen-klasör> assets/cars/<id> 1024` (id: `wagoneer`, `g8`, `veloster`, `elroq`) ve `php tools_compress.php assets/cars/<id>` komutlarıyla hazırla, `php build.php` ile derle.
