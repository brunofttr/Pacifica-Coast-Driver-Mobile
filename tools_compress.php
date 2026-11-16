<?php
// Araç modeli dokularını sıkıştırır: alfa kanalı kullanmayan PNG'leri JPEG'e çevirir, scene.gltf içindeki adresleri günceller.
// kullanım: php tools_compress.php <araç klasörü> [kalite=88]
ini_set('memory_limit', '3G');
$dir = $argv[1]; $q = (int)($argv[2] ?? 88); $gf = "$dir/scene.gltf";
if (!file_exists($gf)) { echo "scene.gltf yok: $dir\n"; exit(1); }
$j = json_decode(file_get_contents($gf), true); $before = 0; $after = 0; $conv = 0; $keep = 0;
foreach ($j['images'] ?? [] as $i => $im) {
  if (empty($im['uri']) || !preg_match('/\.png$/i', $im['uri'])) continue;
  $path = "$dir/" . rawurldecode($im['uri']); if (!file_exists($path)) continue; $before += filesize($path);
  $g = @imagecreatefrompng($path); if (!$g) { $after += filesize($path); $keep++; continue; }
  $w = imagesx($g); $h = imagesy($g); $alpha = false; $stepX = max(1, (int)($w / 96)); $stepY = max(1, (int)($h / 96));
  for ($y = 0; $y < $h && !$alpha; $y += $stepY) for ($x = 0; $x < $w; $x += $stepX) { if ((imagecolorat($g, $x, $y) >> 24) & 0x7F) { $alpha = true; break; } }
  if ($alpha) { $after += filesize($path); $keep++; continue; }
  $bg = imagecreatetruecolor($w, $h); imagecopy($bg, $g, 0, 0, 0, 0, $w, $h);
  $np = preg_replace('/\.png$/i', '.jpg', $path); imagejpeg($bg, $np, $q); $after += filesize($np);
  unlink($path); $j['images'][$i]['uri'] = preg_replace('/\.png$/i', '.jpg', $im['uri']); if (isset($j['images'][$i]['mimeType'])) $j['images'][$i]['mimeType'] = 'image/jpeg'; $conv++;
}
file_put_contents($gf, json_encode($j, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
echo basename($dir) . ": $conv JPEG'e çevrildi, $keep PNG kaldı; dokular " . round($before / 1048576, 1) . " → " . round($after / 1048576, 1) . " MB\n";
