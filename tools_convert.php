<?php
// three.js ESM yükleyicilerini klasik script'e çevirir:  php tools_convert.php
$b = file_get_contents(__DIR__ . '/lib/BGU.src.js');
$b = preg_replace('#import\s*\{([^}]*)\}\s*from\s*\'three\';#s', 'const {$1} = THREE;', $b, 1);
$b = preg_replace('#^export function#m', 'function', $b);
$b = preg_replace('#export\s*\{([^}]*)\};#s', 'THREE.BufferGeometryUtils = {$1};', $b);
$g = file_get_contents(__DIR__ . '/lib/GLTFLoader.src.js');
$g = preg_replace('#import\s*\{([^}]*)\}\s*from\s*\'three\';#s', 'const {$1} = THREE;', $g, 1);
$g = str_replace("import { toTrianglesDrawMode } from '../utils/BufferGeometryUtils.js';", 'const { toTrianglesDrawMode } = THREE.BufferGeometryUtils;', $g);
$g = str_replace('export { GLTFLoader };', 'THREE.GLTFLoader = GLTFLoader;', $g);
file_put_contents(__DIR__ . '/lib/gltf-loader.js', "(function(){\n$b\n})();\n(function(){\n$g\n})();\n");
echo "ok " . strlen($b) . " " . strlen($g) . " leftover import/export: " . preg_match_all('#^(import|export) #m', $b . $g) . "\n";
