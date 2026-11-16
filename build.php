<?php
// Pacifica Coast Driver — tek dosyalık HTML derleyici:  php build.php
// Çıktı: dist/pacifica-coast.html + dist/data/<araç>.js (araç paketleri) + dist/video/ (menü ve yükleme videoları)
$root = __DIR__;
$html = file_get_contents("$root/index.html");
$html = preg_replace_callback('#<link rel="stylesheet" href="([^"]+)">#', function ($m) use ($root) {
    return "<style>\n" . file_get_contents("$root/{$m[1]}") . "\n</style>";
}, $html);
$html = preg_replace_callback('#<script src="([^"]+)"></script>#', function ($m) use ($root) {
    $js = file_get_contents("$root/{$m[1]}");
    $js = str_replace('</script', '<\/script', $js);
    return "<script>\n" . $js . "\n</script>";
}, $html);
$assets = '';
$list = ['models/CarConcept.glb']; foreach (['audio', 'tex'] as $d) foreach (glob("$root/assets/$d/*") as $p) $list[] = $d . '/' . basename($p);
foreach ($list as $a) {
    $assets .= '<script type="application/octet-stream" id="asset-' . $a . '">' . base64_encode(file_get_contents("$root/assets/$a")) . "</script>\n";
}
$packs = array_map('basename', glob("$root/assets/cars/*", GLOB_ONLYDIR)); // yalnız kaynağı bulunan araçlar menüde görünür
$html = str_replace('<!--ASSETS-->', "<script>window.PC_DIST = 1; window.PC_CARS = " . json_encode($packs) . ";</script>\n" . $assets, $html);
@mkdir("$root/dist"); @mkdir("$root/dist/data");
// araç paketleri: dist/data/<id>.js (kaynakta olmayan eski paketler temizlenir)
foreach (glob("$root/dist/data/*.js") as $old) if (!is_dir("$root/assets/cars/" . basename($old, '.js'))) unlink($old);
$tot = 0;
foreach (glob("$root/assets/cars/*", GLOB_ONLYDIR) as $cd) {
    $id = basename($cd); $files = [];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($cd, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $p) $files[str_replace('\\', '/', substr($p->getPathname(), strlen($cd) + 1))] = base64_encode(file_get_contents($p->getPathname()));
    $js = 'PC.Assets.pack(' . json_encode("cars/$id") . ',' . json_encode($files, JSON_UNESCAPED_SLASHES) . ');';
    file_put_contents("$root/dist/data/$id.js", $js); $tot += strlen($js);
}
@mkdir("$root/dist/video"); foreach (glob("$root/assets/video/*.mp4") as $v) copy($v, "$root/dist/video/" . basename($v));
echo "dist/video: " . count(glob("$root/dist/video/*.mp4")) . " dosya
";
echo "dist/data: " . round($tot / 1048576) . " MB\n";
file_put_contents("$root/dist/pacifica-coast.html", $html);
echo "dist/pacifica-coast.html: " . round(strlen($html) / 1048576, 1) . " MB\n";
