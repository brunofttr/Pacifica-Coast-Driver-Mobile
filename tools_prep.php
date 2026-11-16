<?php
// Sketchfab'den inen ham modeli oyuna hazırlar: dokuları en çok N pikselle sınırlar (telefon belleği), gltf + bin'i kopyalar.
// kullanım: php tools_prep.php <kaynak klasör> <hedef klasör> [en büyük kenar=1024]
ini_set('memory_limit', '3G');
[$me, $src, $dst] = $argv; $max = (int)($argv[3] ?? 1024);
@mkdir("$dst/textures", 0777, true);
copy("$src/scene.gltf", "$dst/scene.gltf"); copy("$src/scene.bin", "$dst/scene.bin");
$n = 0; $small = 0;
foreach (glob("$src/textures/*") as $f) {
  $o = "$dst/textures/" . basename($f); $s = @getimagesize($f);
  if (!$s || max($s[0], $s[1]) <= $max) { copy($f, $o); continue; }
  $k = $max / max($s[0], $s[1]); $w = max(1, (int)round($s[0] * $k)); $h = max(1, (int)round($s[1] * $k));
  $im = $s[2] === IMAGETYPE_PNG ? @imagecreatefrompng($f) : @imagecreatefromjpeg($f);
  if (!$im) { copy($f, $o); echo "okunamadi: $f\n"; continue; }
  $t = imagecreatetruecolor($w, $h); imagealphablending($t, false); imagesavealpha($t, true);
  imagecopyresampled($t, $im, 0, 0, 0, 0, $w, $h, $s[0], $s[1]);
  if ($s[2] === IMAGETYPE_PNG) imagepng($t, $o, 6); else imagejpeg($t, $o, 90);
  $n++;
}
$sz = 0; foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dst, FilesystemIterator::SKIP_DOTS)) as $x) $sz += $x->getSize();
echo basename($dst), ": $n doku kucultuldu, toplam ", round($sz / 1048576, 1), " MB\n";
