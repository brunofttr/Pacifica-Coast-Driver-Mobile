# Test raporu — Pacifica Coast Driver Mobile v1.1.0

Sayfa içi otomatik test paketi (`tools/gametest.js`) + `tests.html` mantık testleri.

**Toplam: 406 test · geçen: 406 · kalan: 0**

## Menü (41)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 1 | Açılış ekranı kapandı | GEÇTİ |  |
| 2 | Ana menü görünür | GEÇTİ |  |
| 3 | Ana menüde oyun durumu "menu" | GEÇTİ | menu |
| 4 | Ana menüde 3B sahne RENDERLENMİYOR (1,5 sn) | GEÇTİ | 0 çizim |
| 5 | Menü videosu oynuyor / sessiz | GEÇTİ |  |
| 6 | Oyuna Başla düğmesi var | GEÇTİ |  |
| 7 | Garaj / Ayarlar / Hakkında düğmeleri var | GEÇTİ |  |
| 8 | İlk açılışta Başla yanında ünlem (!) görünür | GEÇTİ |  |
| 9 | Ünleme tıklayınca uyarı mesajı çıkar | GEÇTİ | Uyarı: Ayarlar sekmesine önce göz atmanız oyun deneyimini geliştirir.Ayarlara gi |
| 10 | Ayarlar paneli açılır | GEÇTİ |  |
| 11 | Ayarlara girince ünlem kalkar | GEÇTİ |  |
| 12 | Ayar sekmesi "Grafik" dolu | GEÇTİ | 27 öğe |
| 13 | Ayar sekmesi "Oynanış" dolu | GEÇTİ | 20 öğe |
| 14 | Ayar sekmesi "Arayüz" dolu | GEÇTİ | 6 öğe |
| 15 | Ayar sekmesi "Ses" dolu | GEÇTİ | 3 öğe |
| 16 | Ayar sekmesi "Araç ayarı" dolu | GEÇTİ | 4 öğe |
| 17 | Garaj paneli açılır, araç kartları var | GEÇTİ | 11 kart |
| 18 | Garajda kategoriler: Araçlar + Bilim kurgu | GEÇTİ |  |
| 19 | Hakkında paneli açılır | GEÇTİ |  |
| 20 | Güncelleme denetimi hata fırlatmaz | GEÇTİ |  |
| 21 | Oyuna Başla → oyun "play" | GEÇTİ | play |
| 22 | HUD göründü, ana menü gizli | GEÇTİ |  |
| 23 | Oyunda sahne çiziliyor | GEÇTİ | 639 çizim |
| 24 | HUD düğmesi var: indL | GEÇTİ |  |
| 25 | HUD düğmesi var: indR | GEÇTİ |  |
| 26 | HUD düğmesi var: lights | GEÇTİ |  |
| 27 | HUD düğmesi var: hazard | GEÇTİ |  |
| 28 | HUD düğmesi var: camera | GEÇTİ |  |
| 29 | Far düğmesi durumu değiştirir | GEÇTİ |  |
| 30 | Z tuşu sol sinyali açar | GEÇTİ |  |
| 31 | HUD buton boyutları ≥ 40 px (dokunma hedefi) | GEÇTİ | 58/58/58/58 |
| 32 | HUD düğmeleri şeffaf değil (opak arka plan) | GEÇTİ | rgba(16, 22, 30, 0.92) |
| 33 | Duraklat → mod "pause" | GEÇTİ |  |
| 34 | Duraklatmada sahne çizilmiyor | GEÇTİ | 0 çizim |
| 35 | Duraklatma menüsü görünür | GEÇTİ |  |
| 36 | Devam → oyun "play" | GEÇTİ |  |
| 37 | Ana menüye dönünce oyun durur ve ana menü açılır | GEÇTİ | menu |
| 38 | Ana menüye dönünce render yok | GEÇTİ | 0 |
| 39 | Tekrar başlat çalışır | GEÇTİ |  |
| 40 | Sol el düzeni sınıfı uygulanır | GEÇTİ |  |
| 41 | Arayüz boyutu --k değişkenine yansır | GEÇTİ |  |

## Ayarlar (13)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 42 | Tüm ayar öğeleri değiştirilip geri alınabiliyor (60 adet) | GEÇTİ |  |
| 43 | Ön ayar "low" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 44 | Ön ayar "med" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 45 | Ön ayar "high" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 46 | Ön ayar "ultra" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 47 | Elle değişiklik ön ayarı "Özel" yapar | GEÇTİ |  |
| 48 | Zorluk "Simülasyon" yardımları kapatır | GEÇTİ |  |
| 49 | Zorluk "Arcade" tutuşu artırır | GEÇTİ |  |
| 50 | Ayarlar localStorage'a yazılır | GEÇTİ |  |
| 51 | mph birimi HUD'a yansır | GEÇTİ |  |
| 52 | Gün saati değişince gece (S.night) artar | GEÇTİ | 1.00 |
| 53 | Gün saati öğlen gece yok | GEÇTİ | 0.00 |
| 54 | Trafik 0 yapılınca hareketli araç kalmaz | GEÇTİ | 0 |

## Grafik (35)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 55 | Ön ayar low çiziyor, GL hatası yok | GEÇTİ | 26 çizim, GL 0 |
| 56 | Ön ayar med çiziyor, GL hatası yok | GEÇTİ | 260 çizim, GL 0 |
| 57 | Ön ayar high çiziyor, GL hatası yok | GEÇTİ | 282 çizim, GL 0 |
| 58 | Ön ayar ultra çiziyor, GL hatası yok | GEÇTİ | 314 çizim, GL 0 |
| 59 | Gölge kapalıyken güneş gölge atmaz | GEÇTİ |  |
| 60 | Gölge orta: 2048 harita | GEÇTİ | 2048 |
| 61 | Gölge yüksek: 4096 harita | GEÇTİ |  |
| 62 | Gölge mesafesi gölge kamerasını büyütür | GEÇTİ |  |
| 63 | Görüş mesafesi sis ve kamera uzaklığını ayarlar | GEÇTİ | 800/1000 |
| 64 | Görüş mesafesi 2500 m | GEÇTİ |  |
| 65 | Ağaç yoğunluğu %25 < %100 | GEÇTİ | 299 < 1132 |
| 66 | Ağaç yoğunluğu 0 → hiç ağaç çizilmez | GEÇTİ |  |
| 67 | Ağaç mesafesi büyüyünce çizilen ağaç artar | GEÇTİ | 444 → 1408 |
| 68 | Çim kapatılabilir | GEÇTİ |  |
| 69 | Çim yüksek açılır | GEÇTİ |  |
| 70 | Yansıma seviyesi 0 uygulanır | GEÇTİ |  |
| 71 | Yansıma seviyesi 1 uygulanır | GEÇTİ |  |
| 72 | Yansıma seviyesi 2 uygulanır | GEÇTİ |  |
| 73 | Yansıma seviyesi 3 uygulanır | GEÇTİ |  |
| 74 | Dikiz aynası seviyeleri uygulanır | GEÇTİ |  |
| 75 | MSAA 0x: çizim sürüyor | GEÇTİ |  |
| 76 | MSAA 2x: çizim sürüyor | GEÇTİ |  |
| 77 | MSAA 4x: çizim sürüyor | GEÇTİ |  |
| 78 | MSAA 0x: çizim sürüyor | GEÇTİ |  |
| 79 | gBloom aç-kapa hatasız | GEÇTİ |  |
| 80 | gSsao aç-kapa hatasız | GEÇTİ |  |
| 81 | gParticles aç-kapa hatasız | GEÇTİ |  |
| 82 | gSpot aç-kapa hatasız | GEÇTİ |  |
| 83 | FPS sınırı 30 çizim sayısını sınırlar | GEÇTİ | 30sn: 612 / sınırsız: 4811 |
| 84 | Çözünürlük ölçeği piksel oranını değiştirir | GEÇTİ | 0.50 → 0.90 |
| 85 | Su kalitesi anahtarı (shader uniform) | GEÇTİ |  |
| 86 | Doku filtreleme uygulanır | GEÇTİ |  |
| 87 | Post-işleme etkin | GEÇTİ |  |
| 88 | Çalışma sırasında GL hatası yok | GEÇTİ |  |
| 89 | Orta ayarda çizim çağrısı bütçesi ≤ 800 | GEÇTİ | 587 çağrı, 1573k üçgen |

## Araç aurora (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 90 | Aurora GT Concept yüklendi | GEÇTİ |  |
| 91 | 4 teker ve her birinde mesh | GEÇTİ | 5/5/5/5 |
| 92 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 93 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.43/0.43/0.40/0.40 |
| 94 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 95 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.211 |
| 96 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.3 |
| 97 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 98 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 99 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 100 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 101 | Farlar yanar | GEÇTİ | 0 |
| 102 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 103 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.71,0.98,0.00 |
| 104 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 1.11,1.08,0.00 |
| 105 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 155 km/s, dur 0.0, geri -60 |
| 106 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c011 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 107 | Nova GT-E yüklendi | GEÇTİ |  |
| 108 | 4 teker ve her birinde mesh | GEÇTİ | 11/11/11/11 |
| 109 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 110 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.41/0.42/0.41/0.41 |
| 111 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 112 | Direksiyon simidi dönüyor | GEÇTİ | 31 parça, kayma 0.352 |
| 113 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 114 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 115 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 116 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 117 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 118 | Farlar yanar | GEÇTİ | 0 |
| 119 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 120 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.12,1.05,-0.32 |
| 121 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.38,1.17,0.00 |
| 122 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 145 km/s, dur 0.0, geri -77 |
| 123 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c003 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 124 | Meridian Lux yüklendi | GEÇTİ |  |
| 125 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 126 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 127 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.47/0.47/0.46/0.46 |
| 128 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 129 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.209 |
| 130 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 131 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 132 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 133 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 134 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 135 | Farlar yanar | GEÇTİ | 2 |
| 136 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 137 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.20,1.03,-0.27 |
| 138 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.70,1.15,0.00 |
| 139 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -71 |
| 140 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c005 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 141 | Azure S yüklendi | GEÇTİ |  |
| 142 | 4 teker ve her birinde mesh | GEÇTİ | 20/20/20/20 |
| 143 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 144 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.46/0.46/0.44/0.44 |
| 145 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 146 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.243 |
| 147 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 148 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 149 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 150 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 151 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 152 | Farlar yanar | GEÇTİ | 2 |
| 153 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 154 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.21,1.15,-0.32 |
| 155 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.71,1.27,0.00 |
| 156 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 145 km/s, dur 0.0, geri -80 |
| 157 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c007 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 158 | Regent Grand yüklendi | GEÇTİ |  |
| 159 | 4 teker ve her birinde mesh | GEÇTİ | 50/49/50/50 |
| 160 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 161 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.47/0.45/0.46/0.46 |
| 162 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 163 | Direksiyon simidi dönüyor | GEÇTİ | 9 parça, kayma 0.234 |
| 164 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 165 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 166 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 167 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 168 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 169 | Farlar yanar | GEÇTİ | 2 |
| 170 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 171 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.16,1.01,-0.42 |
| 172 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.66,1.11,0.00 |
| 173 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -72 |
| 174 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c006 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 175 | Titan GT yüklendi | GEÇTİ |  |
| 176 | 4 teker ve her birinde mesh | GEÇTİ | 10/10/10/10 |
| 177 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 178 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.52/0.53/0.49/0.49 |
| 179 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 180 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.249 |
| 181 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 182 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 183 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 184 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 185 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 186 | Farlar yanar | GEÇTİ | 0 |
| 187 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 188 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.12,1.39,-0.39 |
| 189 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.62,1.51,0.00 |
| 190 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -69 |
| 191 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c033 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 192 | Arrow LM yüklendi | GEÇTİ |  |
| 193 | 4 teker ve her birinde mesh | GEÇTİ | 2/2/2/2 |
| 194 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 195 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 4.10/4.16/4.16/4.16 |
| 196 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 197 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 198 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 199 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 200 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 201 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 202 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 203 | Farlar yanar | GEÇTİ | 2 |
| 204 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 205 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.86,0.82,-0.36 |
| 206 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 1.48,0.89,0.00 |
| 207 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 147 km/s, dur 0.0, geri -59 |
| 208 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c037 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 209 | Noir Coupe yüklendi | GEÇTİ |  |
| 210 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 211 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 212 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.36/0.36/0.36/0.36 |
| 213 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 214 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 215 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 216 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 217 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 218 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 219 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 220 | Farlar yanar | GEÇTİ | 2 |
| 221 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 222 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.69,0.85,-0.36 |
| 223 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | -0.07,0.92,0.00 |
| 224 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 153 km/s, dur 0.0, geri -57 |
| 225 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c038 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 226 | Glacier One yüklendi | GEÇTİ |  |
| 227 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 228 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 229 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.36/0.37/0.36/0.36 |
| 230 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 231 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 232 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 233 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 234 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 235 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 236 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 237 | Farlar yanar | GEÇTİ | 2 |
| 238 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 239 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.15,0.86,-0.36 |
| 240 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.77,0.93,0.00 |
| 241 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 151 km/s, dur 0.0, geri -76 |
| 242 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c039 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 243 | Crimson RS yüklendi | GEÇTİ |  |
| 244 | 4 teker ve her birinde mesh | GEÇTİ | 7/7/7/7 |
| 245 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 246 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.14/3.42/3.30/3.30 |
| 247 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 248 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 249 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 250 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 251 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 252 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 253 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 254 | Farlar yanar | GEÇTİ | 2 |
| 255 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 256 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.24,0.88,-0.36 |
| 257 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.86,0.95,0.00 |
| 258 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 159 km/s, dur 0.0, geri -56 |
| 259 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c040 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 260 | Onyx 4 yüklendi | GEÇTİ |  |
| 261 | 4 teker ve her birinde mesh | GEÇTİ | 8/8/8/7 |
| 262 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 263 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.03/3.29/2.94/2.94 |
| 264 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 265 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 266 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 267 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 268 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 269 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 270 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 271 | Farlar yanar | GEÇTİ | 2 |
| 272 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 273 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.19,1.01,-0.36 |
| 274 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.43,1.08,0.00 |
| 275 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 144 km/s, dur 0.0, geri -76 |
| 276 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç wagoneer (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 277 | Jeep Grand Wagoneer 1991 yüklendi | GEÇTİ |  |
| 278 | 4 teker ve her birinde mesh | GEÇTİ | 17/17/15/15 |
| 279 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 280 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.39/0.38/0.38/0.38 |
| 281 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 282 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.224 |
| 283 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 284 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 285 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 286 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 287 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 288 | Farlar yanar | GEÇTİ | 2 |
| 289 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 290 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.22,1.46,-0.42 |
| 291 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.28,1.56,0.01 |
| 292 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 73 km/s, dur 0.0, geri -46 |
| 293 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç g8 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 294 | Pontiac G8 GXP 2009 yüklendi | GEÇTİ |  |
| 295 | 4 teker ve her birinde mesh | GEÇTİ | 14/14/14/14 |
| 296 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 297 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.35/0.37/0.36/0.36 |
| 298 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 299 | Direksiyon simidi dönüyor | GEÇTİ | 12 parça, kayma 0.271 |
| 300 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 301 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 302 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 303 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 304 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 305 | Farlar yanar | GEÇTİ | 2 |
| 306 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 307 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.04,1.18,-0.38 |
| 308 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.31,1.27,0.00 |
| 309 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 112 km/s, dur 0.0, geri -48 |
| 310 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç veloster (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 311 | Hyundai Veloster Turbo 2019 yüklendi | GEÇTİ |  |
| 312 | 4 teker ve her birinde mesh | GEÇTİ | 17/17/17/17 |
| 313 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 314 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.33/0.34/0.34/0.34 |
| 315 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 316 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.251 |
| 317 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 318 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 319 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 320 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 321 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 322 | Farlar yanar | GEÇTİ | 2 |
| 323 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 324 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.16,1.21,-0.36 |
| 325 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.64,1.27,0.00 |
| 326 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 66 km/s, dur 0.0, geri -47 |
| 327 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç elroq (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 328 | Škoda Elroq 2025 yüklendi | GEÇTİ |  |
| 329 | 4 teker ve her birinde mesh | GEÇTİ | 9/9/8/8 |
| 330 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 331 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.67/3.97/3.29/3.29 |
| 332 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 333 | Direksiyon simidi dönüyor | GEÇTİ | 5 parça, kayma 0.243 |
| 334 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 335 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 336 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 337 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 338 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 339 | Farlar yanar | GEÇTİ | 2 |
| 340 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 341 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.03,1.27,-0.36 |
| 342 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.47,1.39,0.00 |
| 343 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 107 km/s, dur 0.0, geri -43 |
| 344 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Trafik bavaro (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 345 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.56 R 0.57 |
| 346 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 347 | Gövde ağı var | GEÇTİ |  |

## Trafik canyon (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 348 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.77 R 0.77 |
| 349 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 350 | Gövde ağı var | GEÇTİ |  |

## Trafik ironhorse (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 351 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.85 R 0.85 |
| 352 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 353 | Gövde ağı var | GEÇTİ |  |

## Trafik veloce (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 354 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.54 R 0.54 |
| 355 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 356 | Gövde ağı var | GEÇTİ |  |

## Trafik tera (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 357 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.57 R 0.57 |
| 358 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 359 | Gövde ağı var | GEÇTİ |  |

## Trafik kaido (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 360 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.57 R 0.57 |
| 361 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 362 | Gövde ağı var | GEÇTİ |  |

## Trafik kartal (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 363 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.69 R 0.69 |
| 364 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 365 | Gövde ağı var | GEÇTİ |  |

## Trafik lumiere (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 366 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.54 R 0.55 |
| 367 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 368 | Gövde ağı var | GEÇTİ |  |

## Trafik imini (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 369 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.52 R 0.52 |
| 370 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 371 | Gövde ağı var | GEÇTİ |  |

## Trafik metro (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 372 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.49 R 0.50 |
| 373 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 374 | Gövde ağı var | GEÇTİ |  |

## Dünya/YZ (30)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 375 | Yol ağı tek parça | GEÇTİ | 84/84 kavşak, 129 yol, 280 şerit |
| 376 | Her şeridin çıkışı var | GEÇTİ | 0 sorunlu |
| 377 | Zemin sorgusu yol yüzeyini verir | GEÇTİ | en büyük sapma 0.000 m |
| 378 | Yol eğimi ≤ %9.5 | GEÇTİ | en dik %9.0 |
| 379 | rwd 0-100 | GEÇTİ | 5.2 s |
| 380 | rwd 100-0 fren mesafesi | GEÇTİ | 34.1 m |
| 381 | rwd frende tam duruş (titreme yok) | GEÇTİ | 0 0.0e+0 0.0e+0 |
| 382 | rwd viraj tutuşu | GEÇTİ | 1.07 g |
| 383 | fwd 0-100 | GEÇTİ | 8.4 s |
| 384 | fwd 100-0 fren mesafesi | GEÇTİ | 42.2 m |
| 385 | fwd frende tam duruş (titreme yok) | GEÇTİ | 0 0.0e+0 0.0e+0 |
| 386 | fwd viraj tutuşu | GEÇTİ | 0.90 g |
| 387 | Trafik kırmızıda durur | GEÇTİ | 0 ihlal |
| 388 | Trafik araçları çarpışmaz | GEÇTİ | 0 temas |
| 389 | Trafik kilitlenmez (duran oyuncunun etrafından dolaşır) | GEÇTİ | en yüksek hız 57 km/h |
| 390 | En çok 5 hareketli araç | GEÇTİ | 5 araç |
| 391 | Işınlanma: Ev / Garaj | GEÇTİ | Δy 0.00 |
| 392 | Işınlanma: Şehir merkezi | GEÇTİ | Δy 0.00 |
| 393 | Işınlanma: Asma köprü | GEÇTİ | Δy 0.00 |
| 394 | Işınlanma: Tepe yolu manzarası | GEÇTİ | Δy 0.00 |
| 395 | Villa / garaj ışınlanma noktası zeminde | GEÇTİ |  |
| 396 | Varış görevi başlar, hedef haritada | GEÇTİ | 644 m |
| 397 | Hedefe varınca görev tamamlanır | GEÇTİ |  |
| 398 | Patinajda lastik izi bırakır | GEÇTİ |  |
| 399 | Patinajda lastik dumanı çıkar | GEÇTİ |  |
| 400 | 3 kez kornaya trafik aracı yarışa girer | GEÇTİ | 25 |
| 401 | Su durumu bayrağı okunabilir | GEÇTİ |  |
| 402 | Yola koy sonrası araç sonlu konumda | GEÇTİ |  |
| 403 | Ses motoru başlar | GEÇTİ |  |
| 404 | Ana ses ayarlanır | GEÇTİ |  |

## Genel (2)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 405 | Test boyunca yakalanmamış hata yok | GEÇTİ |  |
| 406 | GL hata kodu 0 | GEÇTİ |  |

