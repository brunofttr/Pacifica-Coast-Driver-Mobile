# Test raporu — Pacifica Coast Driver Mobile v1.1.1

Sayfa içi otomatik test paketi (`tools/gametest.js`) + `tests.html` mantık testleri.

**Toplam: 424 test · geçen: 424 · kalan: 0**

## Menü (43)

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
| 17 | Garaj paneli açılır, araç kartları var | GEÇTİ | 4 kart |
| 18 | Garajda birincil kategori Araçlar, sonra diğerleri | GEÇTİ | Araçlar (4) / Spor ve süper (5) / Bilim kurgu (6) |
| 19 | Garajda "Aracı kullan" düğmesi var | GEÇTİ |  |
| 20 | Varsayılan trafik 3, park edilmiş 10 | GEÇTİ |  |
| 21 | Hakkında paneli açılır | GEÇTİ |  |
| 22 | Güncelleme denetimi hata fırlatmaz | GEÇTİ |  |
| 23 | Oyuna Başla → oyun "play" | GEÇTİ | play |
| 24 | HUD göründü, ana menü gizli | GEÇTİ |  |
| 25 | Oyunda sahne çiziliyor | GEÇTİ | 972 çizim |
| 26 | HUD düğmesi var: indL | GEÇTİ |  |
| 27 | HUD düğmesi var: indR | GEÇTİ |  |
| 28 | HUD düğmesi var: lights | GEÇTİ |  |
| 29 | HUD düğmesi var: hazard | GEÇTİ |  |
| 30 | HUD düğmesi var: camera | GEÇTİ |  |
| 31 | Far düğmesi durumu değiştirir | GEÇTİ |  |
| 32 | Z tuşu sol sinyali açar | GEÇTİ |  |
| 33 | HUD buton boyutları ≥ 40 px (dokunma hedefi) | GEÇTİ | 58/58/58/58 |
| 34 | HUD düğmeleri şeffaf değil (opak arka plan) | GEÇTİ | rgba(16, 22, 30, 0.92) |
| 35 | Duraklat → mod "pause" | GEÇTİ |  |
| 36 | Duraklatmada sahne çizilmiyor | GEÇTİ | 0 çizim |
| 37 | Duraklatma menüsü görünür | GEÇTİ |  |
| 38 | Devam → oyun "play" | GEÇTİ |  |
| 39 | Ana menüye dönünce oyun durur ve ana menü açılır | GEÇTİ | menu |
| 40 | Ana menüye dönünce render yok | GEÇTİ | 0 |
| 41 | Tekrar başlat çalışır | GEÇTİ |  |
| 42 | Sol el düzeni sınıfı uygulanır | GEÇTİ |  |
| 43 | Arayüz boyutu --k değişkenine yansır | GEÇTİ |  |

## Ayarlar (19)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 44 | Tüm ayar öğeleri değiştirilip geri alınabiliyor (60 adet) | GEÇTİ |  |
| 45 | Ön ayar "low" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 46 | Ön ayar "med" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 47 | Ön ayar "high" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 48 | Ön ayar "ultra" tüm grafik anahtarlarını uygular | GEÇTİ |  |
| 49 | Elle değişiklik ön ayarı "Özel" yapar | GEÇTİ |  |
| 50 | Sekme sıfırlama: Grafik (gRes) | GEÇTİ | 0.58 |
| 51 | Sekme sıfırlama: Oynanış (assist) | GEÇTİ | 1 |
| 52 | Sekme sıfırlama: Arayüz (hudScale) | GEÇTİ | 1 |
| 53 | Sekme sıfırlama: Ses (volume) | GEÇTİ | 0.7 |
| 54 | Sekme sıfırlama: Araç ayarı (grip) | GEÇTİ | 1 |
| 55 | Her ayar sekmesinde sıfırla düğmesi var | GEÇTİ |  |
| 56 | Zorluk "Simülasyon" yardımları kapatır | GEÇTİ |  |
| 57 | Zorluk "Arcade" tutuşu artırır | GEÇTİ |  |
| 58 | Ayarlar localStorage'a yazılır | GEÇTİ |  |
| 59 | mph birimi HUD'a yansır | GEÇTİ |  |
| 60 | Gün saati değişince gece (S.night) artar | GEÇTİ | 1.00 |
| 61 | Gün saati öğlen gece yok | GEÇTİ | 0.00 |
| 62 | Trafik 0 yapılınca hareketli araç kalmaz | GEÇTİ | 0 |

## Grafik (35)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 63 | Ön ayar low çiziyor, GL hatası yok | GEÇTİ | 28 çizim, GL 0 |
| 64 | Ön ayar med çiziyor, GL hatası yok | GEÇTİ | 251 çizim, GL 0 |
| 65 | Ön ayar high çiziyor, GL hatası yok | GEÇTİ | 300 çizim, GL 0 |
| 66 | Ön ayar ultra çiziyor, GL hatası yok | GEÇTİ | 304 çizim, GL 0 |
| 67 | Gölge kapalıyken güneş gölge atmaz | GEÇTİ |  |
| 68 | Gölge orta: 2048 harita | GEÇTİ | 2048 |
| 69 | Gölge yüksek: 4096 harita | GEÇTİ |  |
| 70 | Gölge mesafesi gölge kamerasını büyütür | GEÇTİ |  |
| 71 | Görüş mesafesi sis ve kamera uzaklığını ayarlar | GEÇTİ | 800/1000 |
| 72 | Görüş mesafesi 2500 m | GEÇTİ |  |
| 73 | Ağaç yoğunluğu %25 < %100 | GEÇTİ | 299 < 1132 |
| 74 | Ağaç yoğunluğu 0 → hiç ağaç çizilmez | GEÇTİ |  |
| 75 | Ağaç mesafesi büyüyünce çizilen ağaç artar | GEÇTİ | 444 → 1389 |
| 76 | Çim kapatılabilir | GEÇTİ |  |
| 77 | Çim yüksek açılır | GEÇTİ |  |
| 78 | Yansıma seviyesi 0 uygulanır | GEÇTİ |  |
| 79 | Yansıma seviyesi 1 uygulanır | GEÇTİ |  |
| 80 | Yansıma seviyesi 2 uygulanır | GEÇTİ |  |
| 81 | Yansıma seviyesi 3 uygulanır | GEÇTİ |  |
| 82 | Dikiz aynası seviyeleri uygulanır | GEÇTİ |  |
| 83 | MSAA 0x: çizim sürüyor | GEÇTİ |  |
| 84 | MSAA 2x: çizim sürüyor | GEÇTİ |  |
| 85 | MSAA 4x: çizim sürüyor | GEÇTİ |  |
| 86 | MSAA 0x: çizim sürüyor | GEÇTİ |  |
| 87 | gBloom aç-kapa hatasız | GEÇTİ |  |
| 88 | gSsao aç-kapa hatasız | GEÇTİ |  |
| 89 | gParticles aç-kapa hatasız | GEÇTİ |  |
| 90 | gSpot aç-kapa hatasız | GEÇTİ |  |
| 91 | FPS sınırı 30 çizim sayısını sınırlar | GEÇTİ | 30sn: 612 / sınırsız: 4811 |
| 92 | Çözünürlük ölçeği piksel oranını değiştirir | GEÇTİ | 0.50 → 0.90 |
| 93 | Su kalitesi anahtarı (shader uniform) | GEÇTİ |  |
| 94 | Doku filtreleme uygulanır | GEÇTİ |  |
| 95 | Post-işleme etkin | GEÇTİ |  |
| 96 | Çalışma sırasında GL hatası yok | GEÇTİ |  |
| 97 | Orta ayarda çizim çağrısı bütçesi ≤ 1000 | GEÇTİ | 848 çağrı, 3196k üçgen |

## Araç aurora (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 98 | Aurora GT Concept yüklendi | GEÇTİ |  |
| 99 | 4 teker ve her birinde mesh | GEÇTİ | 5/5/5/5 |
| 100 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 101 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.43/0.43/0.40/0.40 |
| 102 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 103 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.214 |
| 104 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.04 → 0.04 |
| 105 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.3 |
| 106 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 107 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 108 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 109 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 110 | Farlar yanar | GEÇTİ | 0 |
| 111 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 112 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.71,0.98,0.00 |
| 113 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.95,0.97,0.17 |
| 114 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 155 km/s, dur 0.0, geri -60 |
| 115 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c011 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 116 | Nova GT-E yüklendi | GEÇTİ |  |
| 117 | 4 teker ve her birinde mesh | GEÇTİ | 11/11/11/11 |
| 118 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 119 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.41/0.42/0.41/0.41 |
| 120 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 121 | Direksiyon simidi dönüyor | GEÇTİ | 31 parça, kayma 0.403 |
| 122 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.20 → -0.08 |
| 123 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 124 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 125 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 126 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 127 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 128 | Farlar yanar | GEÇTİ | 0 |
| 129 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 130 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.12,1.05,-0.32 |
| 131 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.38,1.17,0.00 |
| 132 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 145 km/s, dur 0.0, geri -77 |
| 133 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c003 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 134 | Meridian Lux yüklendi | GEÇTİ |  |
| 135 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 136 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 137 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.47/0.47/0.46/0.46 |
| 138 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 139 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.229 |
| 140 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.29 → -0.20 |
| 141 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 142 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 143 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 144 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 145 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 146 | Farlar yanar | GEÇTİ | 2 |
| 147 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 148 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.20,1.03,-0.27 |
| 149 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.70,1.15,0.00 |
| 150 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -71 |
| 151 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c005 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 152 | Azure S yüklendi | GEÇTİ |  |
| 153 | 4 teker ve her birinde mesh | GEÇTİ | 20/20/20/20 |
| 154 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 155 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.46/0.46/0.44/0.44 |
| 156 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 157 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.213 |
| 158 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.37 → -0.28 |
| 159 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 160 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 161 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 162 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 163 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 164 | Farlar yanar | GEÇTİ | 2 |
| 165 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 166 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.21,1.15,-0.32 |
| 167 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.71,1.27,0.00 |
| 168 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 145 km/s, dur 0.0, geri -80 |
| 169 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c007 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 170 | Regent Grand yüklendi | GEÇTİ |  |
| 171 | 4 teker ve her birinde mesh | GEÇTİ | 50/49/50/50 |
| 172 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 173 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.47/0.45/0.46/0.46 |
| 174 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 175 | Direksiyon simidi dönüyor | GEÇTİ | 9 parça, kayma 0.234 |
| 176 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.46 → -0.38 |
| 177 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 178 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 179 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 180 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 181 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 182 | Farlar yanar | GEÇTİ | 2 |
| 183 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 184 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.16,1.01,-0.42 |
| 185 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.66,1.11,0.00 |
| 186 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -72 |
| 187 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c006 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 188 | Titan GT yüklendi | GEÇTİ |  |
| 189 | 4 teker ve her birinde mesh | GEÇTİ | 10/10/10/10 |
| 190 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 191 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.52/0.53/0.49/0.49 |
| 192 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 193 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.234 |
| 194 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.43 → -0.34 |
| 195 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.26 |
| 196 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 197 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 198 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 199 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 200 | Farlar yanar | GEÇTİ | 0 |
| 201 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 202 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.12,1.39,-0.39 |
| 203 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.62,1.51,0.00 |
| 204 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 131 km/s, dur 0.0, geri -69 |
| 205 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c033 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 206 | Arrow LM yüklendi | GEÇTİ |  |
| 207 | 4 teker ve her birinde mesh | GEÇTİ | 2/2/2/2 |
| 208 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 209 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 4.10/4.16/4.16/4.16 |
| 210 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 211 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 212 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 213 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 214 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 215 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 216 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 217 | Farlar yanar | GEÇTİ | 2 |
| 218 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 219 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.86,0.82,-0.36 |
| 220 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 1.48,0.89,0.00 |
| 221 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 147 km/s, dur 0.0, geri -59 |
| 222 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c037 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 223 | Noir Coupe yüklendi | GEÇTİ |  |
| 224 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 225 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 226 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.36/0.36/0.36/0.36 |
| 227 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 228 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 229 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 230 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 231 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 232 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 233 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 234 | Farlar yanar | GEÇTİ | 2 |
| 235 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 236 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.69,0.85,-0.36 |
| 237 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | -0.07,0.92,0.00 |
| 238 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 153 km/s, dur 0.0, geri -57 |
| 239 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c038 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 240 | Glacier One yüklendi | GEÇTİ |  |
| 241 | 4 teker ve her birinde mesh | GEÇTİ | 4/4/4/4 |
| 242 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 243 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.36/0.37/0.36/0.36 |
| 244 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 245 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 246 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 247 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 248 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 249 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 250 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 251 | Farlar yanar | GEÇTİ | 2 |
| 252 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 253 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.15,0.86,-0.36 |
| 254 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.77,0.93,0.00 |
| 255 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 151 km/s, dur 0.0, geri -76 |
| 256 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c039 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 257 | Crimson RS yüklendi | GEÇTİ |  |
| 258 | 4 teker ve her birinde mesh | GEÇTİ | 7/7/7/7 |
| 259 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 260 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.14/3.42/3.30/3.30 |
| 261 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 262 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 263 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 264 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 265 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 266 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 267 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 268 | Farlar yanar | GEÇTİ | 2 |
| 269 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 270 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.24,0.88,-0.36 |
| 271 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.86,0.95,0.00 |
| 272 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 159 km/s, dur 0.0, geri -56 |
| 273 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç c040 (17)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 274 | Onyx 4 yüklendi | GEÇTİ |  |
| 275 | 4 teker ve her birinde mesh | GEÇTİ | 8/8/8/7 |
| 276 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 277 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.03/3.29/2.94/2.94 |
| 278 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 279 | Direksiyon (kokpit kiti) mevcut | GEÇTİ | kit |
| 280 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.42 |
| 281 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 282 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 283 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 284 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 285 | Farlar yanar | GEÇTİ | 2 |
| 286 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 287 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.19,1.01,-0.36 |
| 288 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.43,1.08,0.00 |
| 289 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 144 km/s, dur 0.0, geri -76 |
| 290 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç wagoneer (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 291 | Jeep Grand Wagoneer 1991 yüklendi | GEÇTİ |  |
| 292 | 4 teker ve her birinde mesh | GEÇTİ | 17/17/15/15 |
| 293 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 294 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.39/0.38/0.38/0.38 |
| 295 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 296 | Direksiyon simidi dönüyor | GEÇTİ | 6 parça, kayma 0.241 |
| 297 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.40 → -0.29 |
| 298 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 299 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 300 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 301 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 302 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 303 | Farlar yanar | GEÇTİ | 2 |
| 304 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 305 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.22,1.46,-0.42 |
| 306 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.28,1.56,0.01 |
| 307 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 73 km/s, dur 0.0, geri -46 |
| 308 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç g8 (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 309 | Pontiac G8 GXP 2009 yüklendi | GEÇTİ |  |
| 310 | 4 teker ve her birinde mesh | GEÇTİ | 14/14/14/14 |
| 311 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 312 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.35/0.37/0.36/0.36 |
| 313 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 314 | Direksiyon simidi dönüyor | GEÇTİ | 12 parça, kayma 0.272 |
| 315 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.40 → -0.29 |
| 316 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 317 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 318 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 319 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 320 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 321 | Farlar yanar | GEÇTİ | 2 |
| 322 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 323 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.04,1.18,-0.38 |
| 324 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.31,1.27,0.00 |
| 325 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 112 km/s, dur 0.0, geri -48 |
| 326 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç veloster (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 327 | Hyundai Veloster Turbo 2019 yüklendi | GEÇTİ |  |
| 328 | 4 teker ve her birinde mesh | GEÇTİ | 17/17/17/17 |
| 329 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 330 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 0.33/0.34/0.34/0.34 |
| 331 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 332 | Direksiyon simidi dönüyor | GEÇTİ | 10 parça, kayma 0.251 |
| 333 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.38 → -0.27 |
| 334 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 335 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 336 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 337 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 338 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 339 | Farlar yanar | GEÇTİ | 2 |
| 340 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 341 | Sürücü gözü gövdenin içinde | GEÇTİ | 0.16,1.21,-0.36 |
| 342 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.64,1.27,0.00 |
| 343 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 66 km/s, dur 0.0, geri -47 |
| 344 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Araç elroq (18)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 345 | Škoda Elroq 2025 yüklendi | GEÇTİ |  |
| 346 | 4 teker ve her birinde mesh | GEÇTİ | 9/9/8/8 |
| 347 | İskeletli (dönmeyen) mesh yok | GEÇTİ | 0 |
| 348 | Tekerlekler görsel olarak dönüyor | GEÇTİ | 3.67/3.97/3.29/3.29 |
| 349 | Ön tekerlekler kırılıyor, arkalar sabit | GEÇTİ |  |
| 350 | Direksiyon simidi dönüyor | GEÇTİ | 17 parça, kayma 0.282 |
| 351 | Direksiyon doğru yöne dönüyor (sağa → simidin üstü sağa) | GEÇTİ | -0.37 → -0.24 |
| 352 | Cam malzemesi şeffaf ayarlı | GEÇTİ | 0.24 |
| 353 | Sol sinyal yalnız SOL tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 354 | Sağ sinyal yalnız SAĞ tarafta yanar (ön+arka) | GEÇTİ | 2 lamba |
| 355 | Stop lambaları yanar (arkada, iki yan) | GEÇTİ | 2 |
| 356 | Geri vites lambaları yanar | GEÇTİ | 2 |
| 357 | Farlar yanar | GEÇTİ | 2 |
| 358 | Hepsi kapalıyken lamba görünmez | GEÇTİ |  |
| 359 | Sürücü gözü gövdenin içinde | GEÇTİ | -0.07,1.25,-0.36 |
| 360 | Dikiz aynası gövdenin içinde ve gözün önünde | GEÇTİ | 0.43,1.37,0.00 |
| 361 | Sürüş fiziği: hızlanır, durur, geri gider | GEÇTİ | 107 km/s, dur 0.0, geri -43 |
| 362 | Araç yüklenirken konsol hatası yok | GEÇTİ |  |

## Trafik bavaro (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 363 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.56 R 0.57 |
| 364 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 365 | Gövde ağı var | GEÇTİ |  |

## Trafik canyon (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 366 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.77 R 0.77 |
| 367 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 368 | Gövde ağı var | GEÇTİ |  |

## Trafik ironhorse (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 369 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.85 R 0.85 |
| 370 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 371 | Gövde ağı var | GEÇTİ |  |

## Trafik veloce (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 372 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.54 R 0.54 |
| 373 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 374 | Gövde ağı var | GEÇTİ |  |

## Trafik tera (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 375 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.57 R 0.57 |
| 376 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 377 | Gövde ağı var | GEÇTİ |  |

## Trafik kaido (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 378 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.57 R 0.57 |
| 379 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 380 | Gövde ağı var | GEÇTİ |  |

## Trafik kartal (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 381 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.69 R 0.69 |
| 382 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 383 | Gövde ağı var | GEÇTİ |  |

## Trafik lumiere (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 384 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.54 R 0.55 |
| 385 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 386 | Gövde ağı var | GEÇTİ |  |

## Trafik imini (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 387 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.52 R 0.52 |
| 388 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 389 | Gövde ağı var | GEÇTİ |  |

## Trafik metro (3)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 390 | Sinyal parçaları doğru yanda (sol z<0, sağ z>0) | GEÇTİ | L -0.49 R 0.50 |
| 391 | Far, stop ve sinyal malzeme dizinleri var | GEÇTİ |  |
| 392 | Gövde ağı var | GEÇTİ |  |

## Dünya/YZ (30)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 393 | Yol ağı tek parça | GEÇTİ | 84/84 kavşak, 129 yol, 280 şerit |
| 394 | Her şeridin çıkışı var | GEÇTİ | 0 sorunlu |
| 395 | Zemin sorgusu yol yüzeyini verir | GEÇTİ | en büyük sapma 0.000 m |
| 396 | Yol eğimi ≤ %9.5 | GEÇTİ | en dik %9.0 |
| 397 | rwd 0-100 | GEÇTİ | 5.2 s |
| 398 | rwd 100-0 fren mesafesi | GEÇTİ | 34.1 m |
| 399 | rwd frende tam duruş (titreme yok) | GEÇTİ | 0 0.0e+0 0.0e+0 |
| 400 | rwd viraj tutuşu | GEÇTİ | 1.07 g |
| 401 | fwd 0-100 | GEÇTİ | 8.4 s |
| 402 | fwd 100-0 fren mesafesi | GEÇTİ | 42.2 m |
| 403 | fwd frende tam duruş (titreme yok) | GEÇTİ | 0 0.0e+0 0.0e+0 |
| 404 | fwd viraj tutuşu | GEÇTİ | 0.90 g |
| 405 | Trafik kırmızıda durur | GEÇTİ | 0 ihlal |
| 406 | Trafik araçları çarpışmaz | GEÇTİ | 0 temas |
| 407 | Trafik kilitlenmez (duran oyuncunun etrafından dolaşır) | GEÇTİ | en yüksek hız 59 km/h |
| 408 | En çok 5 hareketli araç | GEÇTİ | 5 araç |
| 409 | Işınlanma: Ev / Garaj | GEÇTİ | Δy 0.00 |
| 410 | Işınlanma: Şehir merkezi | GEÇTİ | Δy 0.00 |
| 411 | Işınlanma: Asma köprü | GEÇTİ | Δy 0.00 |
| 412 | Işınlanma: Tepe yolu manzarası | GEÇTİ | Δy 0.00 |
| 413 | Villa / garaj ışınlanma noktası zeminde | GEÇTİ |  |
| 414 | Varış görevi başlar, hedef haritada | GEÇTİ | 649 m |
| 415 | Hedefe varınca görev tamamlanır | GEÇTİ |  |
| 416 | Patinajda lastik izi bırakır | GEÇTİ |  |
| 417 | Patinajda lastik dumanı çıkar | GEÇTİ |  |
| 418 | 3 kez kornaya trafik aracı yarışa girer | GEÇTİ | 25 |
| 419 | Su durumu bayrağı okunabilir | GEÇTİ |  |
| 420 | Yola koy sonrası araç sonlu konumda | GEÇTİ |  |
| 421 | Ses motoru başlar | GEÇTİ |  |
| 422 | Ana ses ayarlanır | GEÇTİ |  |

## Genel (2)

| # | Test | Sonuç | Not |
|---|---|---|---|
| 423 | Test boyunca yakalanmamış hata yok | GEÇTİ |  |
| 424 | GL hata kodu 0 | GEÇTİ |  |

