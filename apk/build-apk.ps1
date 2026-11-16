# Pacifica Coast Driver Mobile — APK derleme betiği (Gradle'sız: aapt2 → javac → d8 → zipalign → apksigner)
# Önkoşul: E:\Agency\buildtools\env.ps1 (JDK + Android SDK build-tools 36 + platform android-36). Anahtar: apk\test.jks (repoda YOK)
# Parola ortam değişkeninden okunur: $env:PCD_KS_PASS
param([string]$Root = (Split-Path -Parent $PSScriptRoot), [string]$Env = 'E:\Agency\buildtools\env.ps1')
. $Env
$bt = "$env:ANDROID_HOME\build-tools\36.0.0"; $jar = "$env:ANDROID_HOME\platforms\android-36\android.jar"
$a = Join-Path $Root 'apk'; $o = "$a\out"; $d = "$Root\dist"
Remove-Item "$o","$a\assets","$a\assets-lite" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$o\classes","$a\assets","$a\assets-lite" | Out-Null
# varlıklar: HTML (video / paket klasörü düz) + araç paketleri + videolar
(Get-Content "$d\pacifica-coast.html" -Raw -Encoding UTF8).Replace('window.PC_DIST = 1;', 'window.PC_DIST = 1; window.PC_PACK_DIR = ""; window.PC_VIDEO_DIR = "";') | Set-Content "$a\assets\pacifica-coast.html" -Encoding UTF8 -NoNewline
(Get-Content "$a\assets\pacifica-coast.html" -Raw -Encoding UTF8) -replace 'window.PC_CARS = \[[^\]]*\];', 'window.PC_CARS = ["c037","c011","veloster"];' | Set-Content "$a\assets-lite\pacifica-coast.html" -Encoding UTF8 -NoNewline
Copy-Item "$d\data\*.js", "$d\video\*.mp4" "$a\assets\"
Copy-Item "$d\video\*.mp4" "$a\assets-lite\"
foreach ($id in 'c037','c011','veloster') { Copy-Item "$d\data\$id.js" "$a\assets-lite\" }   # küçük sürüm: 3 araç
cmd /c "javac --release 11 -nowarn -cp `"$jar`" -d `"$o\classes`" `"$a\src\com\pacifica\coast\MainActivity.java`" 2>nul"; "javac: $LASTEXITCODE"
cmd /c "`"$bt\d8.bat`" --lib `"$jar`" --min-api 28 --output `"$o`" `"$o\classes\com\pacifica\coast\MainActivity.class`" `"$o\classes\com\pacifica\coast\MainActivity`$Bridge.class`" 2>&1"; "d8: $LASTEXITCODE"
& "$bt\aapt2.exe" compile --dir "$a\res" -o "$o\res.zip"
foreach ($v in @(@('assets', 'pacifica-coast-driver-mobile.apk'), @('assets-lite', 'pacifica-coast-driver-mobile-lite.apk'))) {
  & "$bt\aapt2.exe" link -o "$o\b.apk" --manifest "$a\AndroidManifest.xml" -I $jar -A "$a\$($v[0])" -R "$o\res.zip" --min-sdk-version 28 --target-sdk-version 36
  Push-Location $o; & "$bt\aapt.exe" add b.apk classes.dex | Out-Null; Pop-Location
  & "$bt\zipalign.exe" -f -p 4 "$o\b.apk" "$o\al.apk"
  cmd /c "`"$bt\apksigner.bat`" sign --ks `"$a\test.jks`" --ks-pass env:PCD_KS_PASS --key-pass env:PCD_KS_PASS --out `"$o\$($v[1])`" `"$o\al.apk`" 2>&1"
  cmd /c "`"$bt\apksigner.bat`" verify `"$o\$($v[1])`" 2>&1" | Select-Object -First 1
  "$($v[1]) verify: $LASTEXITCODE  {0:N1} MB" -f ((Get-Item "$o\$($v[1])").Length / 1MB)
}
cmd /c "`"$bt\aapt2.exe`" dump badging `"$o\pacifica-coast-driver-mobile.apk`" 2>&1" | Select-Object -First 3
