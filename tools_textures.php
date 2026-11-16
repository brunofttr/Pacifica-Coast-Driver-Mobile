<?php
// ambientCG (CC0) 2K dokularını oyun boyutuna indirger:  php tools_textures.php   (kaynaklar assets/_dl altında)
ini_set('memory_limit', '1024M');
$src = __DIR__ . '/assets/_dl'; $dst = __DIR__ . '/assets/tex'; @mkdir($dst);
function conv($in, $out, $size, $q, $fn = null) {
    $s = imagecreatefromjpeg($in); $d = imagecreatetruecolor($size, $size);
    imagecopyresampled($d, $s, 0, 0, 0, 0, $size, $size, imagesx($s), imagesy($s));
    if ($fn) $fn($d);
    imagejpeg($d, $out, $q); echo basename($out) . ' ' . round(filesize($out) / 1024) . "KB\n";
}
$fac = ['Facade006', 'Facade019A', 'Facade018A', 'Facade020A'];
foreach ($fac as $i => $f) { if (!file_exists("$src/$f")) continue;
    $p = "$src/$f/{$f}_2K-JPG_";
    conv($p . 'Color.jpg', "$dst/fac{$i}.jpg", 2048, 84);
    conv($p . 'NormalGL.jpg', "$dst/fac{$i}_n.jpg", 1024, 80);
    conv($p . 'Roughness.jpg', "$dst/fac{$i}_r.jpg", 1024, 74);
}
$g = fn($a) => "$src/g_$a/{$a}_2K-JPG_";
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('Asphalt026A') . 'Color.jpg', "$dst/asphalt.jpg", 1024, 84, function ($d) { imagefilter($d, IMG_FILTER_BRIGHTNESS, -18); });
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('Asphalt026A') . 'NormalGL.jpg', "$dst/asphalt_n.jpg", 1024, 80);
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('PavingStones128') . 'Color.jpg', "$dst/paving.jpg", 1024, 82);
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('PavingStones128') . 'NormalGL.jpg', "$dst/paving_n.jpg", 1024, 80);
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('Ground037') . 'Color.jpg', "$dst/ground.jpg", 1024, 82, function ($d) { imagefilter($d, IMG_FILTER_GRAYSCALE); imagefilter($d, IMG_FILTER_BRIGHTNESS, 28); });
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('Ground037') . 'NormalGL.jpg', "$dst/ground_n.jpg", 1024, 78);
if (file_exists($g("Grass004") . "Color.jpg")) conv($g('Grass004') . 'Color.jpg', "$dst/grass.jpg", 1024, 82);
// yaprak / ot / kabuk (1K kaynak)
$l = fn($a, $t) => "$src/$a/{$a}_1K-JPG_$t.jpg";
if (file_exists($l('LeafSet010', 'Color'))) {
    conv($l('LeafSet010', 'Color'), "$dst/leaf.jpg", 512, 84); conv($l('LeafSet010', 'Opacity'), "$dst/leaf_a.jpg", 512, 84);
    conv($l('Foliage001', 'Color'), "$dst/blade.jpg", 512, 84); conv($l('Foliage001', 'Opacity'), "$dst/blade_a.jpg", 512, 84);
    conv($l('Bark012', 'Color'), "$dst/bark.jpg", 512, 82); conv($l('Bark012', 'NormalGL'), "$dst/bark_n.jpg", 512, 78);
}
