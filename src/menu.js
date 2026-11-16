// Pacifica Coast Driver — açılış (yükleme) ekranı, ana menü, ayarlar, garaj, duraklatma menüsü, güncelleme denetimi
(function () {
  'use strict';
  const PC = window.PC, ST = PC.Settings, UI = PC.UI, U = PC.U;
  const M = (PC.Menu = { ctx: 'main', open: null });
  PC.VERSION = { name: '1.1.1', build: 12, repo: 'brunofttr/Pacifica-Coast-Driver-Mobile' };
  const RAW = 'https://raw.githubusercontent.com/' + PC.VERSION.repo + '/main/version.json';
  const VD = window.PC_VIDEO_DIR !== undefined ? window.PC_VIDEO_DIR : window.PC_DIST ? 'video/' : 'assets/video/';
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const fire = (n, a, b) => (UI.on[n] ? UI.on[n](a, b) : undefined);
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* */ } } };

  // ================= açılış / yükleme ekranı =================
  const TIPS = [
    'İpucu: Sağ üstteki ⋯ düğmesinden Yola koy, Ağır çekim, Geri sar ve Varış görevine ulaşabilirsin.',
    'İpucu: Trafikteki bir araca arka arkaya 3 kez korna basarsan seninle yarışır.',
    'İpucu: Kokpit kamerasında göstergeler modelin kendi kadranlarından canlı okunur.',
    'İpucu: Ayarlar > Grafik bölümünden görüş mesafesi ve çözünürlük ölçeğiyle FPS\'i artırabilirsin.',
    'İpucu: Ev / Garaj ışınlanma noktasında kapılar araca yaklaşınca kendiliğinden açılır.',
    'İpucu: Gece sürüşü için Gün saati ayarını kaydır; farlar ve sinyaller gerçek zamanlı yanar.',
  ];
  let bootVid = null, tipT = 0;
  M.bootStart = function (first) {
    const b = $('boot'); if (!b) return;
    bootVid = b.querySelector('video');
    if (bootVid) {
      if (!bootVid.getAttribute('src')) { bootVid.src = VD + 'load.mp4'; bootVid.muted = true; bootVid.loop = true; bootVid.playsInline = true; } // yükleme videosu (index.html erken başlatır): sessiz, döngüde
      bootVid.addEventListener('error', () => { bootVid.style.display = 'none'; });
      const p = bootVid.play(); if (p && p.catch) p.catch(() => {});
    }
    $('bootTip').textContent = first ? 'İlk açılış: gölgelendiriciler ve önbellek hazırlanıyor, bu yalnızca bir kez uzun sürer.' : TIPS[0];
    tipT = setInterval(() => { if (!first) $('bootTip').textContent = TIPS[(Math.random() * TIPS.length) | 0]; }, 3500);
  };
  M.bootProgress = function (p, text) { const i = $('bootBar') && $('bootBar').firstChild; if (i) i.style.width = Math.round(U.clamp(p, 0, 1) * 100) + '%'; if (text && $('bootStat')) $('bootStat').textContent = text; };
  M.bootEnd = function () { clearInterval(tipT); const b = $('boot'); if (!b) return; if (bootVid) { bootVid.pause(); bootVid.removeAttribute('src'); bootVid.load(); } b.classList.add('hidden'); };

  // ================= ana menü =================
  M.buildMain = function () {
    const m = el('div'); m.id = 'main'; m.className = 'hidden';
    if (!window.PC_DIST) m.style.backgroundImage = 'url(assets/tex/poster.jpg)'; else PC.Assets.get('tex/poster.jpg').then((buf) => { m.style.backgroundImage = 'url(' + URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' })) + ')'; }).catch(() => {});
    m.innerHTML = `<video id="menuVid" muted loop playsinline preload="auto"></video><div class="shade"></div>
      <div id="mainIn">
        <div class="logo"><b>PACIFICA</b><em>COAST DRIVER</em><small>MOBILE</small></div>
        <div id="upd"><span id="updTxt"></span><button class="btn pri" id="updBtn">İndir</button></div>
        <button class="mbtn pri" id="mStart">OYUNA BAŞLA<span class="bang hidden" id="mBang">!</span></button>
        <div class="mrow"><button class="mbtn" id="mGarage">GARAJ</button><button class="mbtn" id="mSet">AYARLAR</button></div>
        <button class="mbtn" id="mAbout">HAKKINDA</button>
      </div>
      <div id="ver"></div>`;
    document.body.appendChild(m);
    $('ver').textContent = 'v' + PC.VERSION.name + ' · derleme ' + PC.VERSION.build;
    const v = $('menuVid'); v.addEventListener('error', () => { v.style.display = 'none'; });
    $('mStart').addEventListener('click', (e) => { if (e.target.id === 'mBang') { e.stopPropagation(); M.warn(); return; } M.start(); });
    $('mGarage').addEventListener('click', () => M.panel('garage'));
    $('mSet').addEventListener('click', () => M.panel('settings'));
    $('mAbout').addEventListener('click', () => M.panel('about'));
    $('updBtn').addEventListener('click', () => M.openUrl((M.upd && M.upd.url) || 'https://github.com/' + PC.VERSION.repo + '/releases/latest'));
    M.updateBang();
  };
  M.updateBang = function () { const b = $('mBang'); if (b) b.classList.toggle('hidden', LS.get('pcd-seen-settings') === '1'); };
  M.showMain = function () {
    M.ctx = 'main'; const m = $('main'); m.classList.remove('hidden'); $('hud').classList.add('hidden'); if ($('pauseM')) $('pauseM').classList.add('hidden');
    const v = $('menuVid'); if (v && !v.getAttribute('src')) { v.src = VD + 'menu.mp4'; v.muted = true; } if (v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    M.updateBang();
  };
  M.hideMain = function () { $('main').classList.add('hidden'); const v = $('menuVid'); if (v) v.pause(); };
  M.warn = function () {
    dialog('<b>Uyarı:</b> Ayarlar sekmesine önce göz atmanız oyun deneyimini geliştirir.', [['Ayarlara git', () => M.panel('settings'), 'pri'], ['Tamam', null]]);
  };
  function dialog(html, btns) {
    const d = el('div', 'dlg'); const box = el('div'); box.innerHTML = '<div>' + html + '</div>'; const row = el('div', 'row');
    for (const [t, fn, cls] of btns) { const b = el('button', 'btn ' + (cls || ''), t); b.addEventListener('click', () => { d.remove(); if (fn) fn(); }); row.appendChild(b); }
    box.appendChild(row); d.appendChild(box); document.body.appendChild(d); return d;
  }
  M.dialog = dialog;
  M.busy = function (on, text) {
    let b = $('busy'); if (!on) { if (b) b.remove(); return; }
    if (!b) { b = el('div', 'dlg'); b.id = 'busy'; b.innerHTML = '<div><span id="busyT"></span><div id="bootBar" style="width:60vw;max-width:320px"><i style="width:60%;animation:ld 1s infinite"></i></div></div>'; document.body.appendChild(b); }
    $('busyT').textContent = text || 'Yükleniyor…';
  };
  M.start = async function () {
    if (M.starting) return; M.starting = true;
    try { M.busy(true, 'Oyun başlatılıyor…'); await PC.Game.start(); M.hideMain(); } finally { M.busy(false); M.starting = false; }
  };
  M.openUrl = function (u) { try { if (window.AndroidApp && window.AndroidApp.openUrl) window.AndroidApp.openUrl(u); else window.open(u, '_blank'); } catch (e) { /* */ } };

  // ================= güncelleme denetimi =================
  M.checkUpdate = async function (manual) {
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null; const to = setTimeout(() => ctl && ctl.abort(), 7000);
      const r = await fetch(RAW + '?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined }); clearTimeout(to);
      const j = await r.json();
      if (j && j.build > PC.VERSION.build) {
        M.upd = j; const u = $('upd'); if (u) { u.style.display = 'flex'; $('updTxt').textContent = 'Yeni sürüm hazır: ' + j.name + (j.notes ? ' — ' + j.notes : ''); }
        if (manual) dialog('Yeni sürüm var: <b>' + j.name + '</b><br><small>' + (j.notes || '') + '</small>', [['İndir', () => M.openUrl(j.url), 'pri'], ['Sonra', null]]);
      } else if (manual) dialog('Oyun güncel (v' + PC.VERSION.name + ').', [['Tamam', null]]);
    } catch (e) { if (manual) dialog('Güncelleme denetlenemedi. İnternet bağlantını kontrol et.', [['Tamam', null]]); }
  };

  // ================= ayar şeması =================
  const PRESETS = {
    low: { gRes: 0.45, gDyn: 1, gFps: 30, gDist: 900, gShadow: 0, gShadowDist: 40, gRefl: 0, gMirror: 0, gTrees: 25, gTreeDist: 350, gGrass: 0, gMsaa: 0, gBloom: 0, gBloomK: 0.4, gSsao: 0, gSharp: 0, gAniso: 2, gParticles: 0, gWater: 0, gSpot: 0 },
    med: { gRes: 0.58, gDyn: 1, gFps: 60, gDist: 1500, gShadow: 1, gShadowDist: 55, gRefl: 1, gMirror: 1, gTrees: 55, gTreeDist: 650, gGrass: 1, gMsaa: 0, gBloom: 1, gBloomK: 0.5, gSsao: 0, gSharp: 0.18, gAniso: 4, gParticles: 1, gWater: 1, gSpot: 1 },
    high: { gRes: 0.72, gDyn: 1, gFps: 60, gDist: 2300, gShadow: 2, gShadowDist: 70, gRefl: 2, gMirror: 2, gTrees: 85, gTreeDist: 950, gGrass: 2, gMsaa: 2, gBloom: 1, gBloomK: 0.55, gSsao: 1, gSharp: 0.2, gAniso: 8, gParticles: 1, gWater: 1, gSpot: 1 },
    ultra: { gRes: 0.9, gDyn: 1, gFps: 60, gDist: 3200, gShadow: 3, gShadowDist: 90, gRefl: 3, gMirror: 3, gTrees: 100, gTreeDist: 1400, gGrass: 3, gMsaa: 4, gBloom: 1, gBloomK: 0.6, gSsao: 1, gSharp: 0.22, gAniso: 16, gParticles: 1, gWater: 1, gSpot: 1 },
  };
  PC.PRESETS = PRESETS;
  const GKEYS = Object.keys(PRESETS.med);
  const Q4 = [[0, 'Kapalı'], [1, 'Düşük'], [2, 'Orta'], [3, 'Yüksek']];
  const pct = (v) => Math.round(v * 100) + '%';
  const SCHEMA = [
    { id: 'gfx', name: 'Grafik', items: [
      { h: 'Kalite' },
      { k: 'preset', t: 'seg', label: 'Kalite ön ayarı', opts: [['low', 'Düşük'], ['med', 'Orta'], ['high', 'Yüksek'], ['ultra', 'Ultra'], ['custom', 'Özel']], note: 'Bir ön ayar seçince aşağıdaki tüm ayrıntılar ona göre ayarlanır. Herhangi birini elle değiştirirsen "Özel" olur.' },
      { h: 'Performans' },
      { k: 'gRes', t: 'range', label: 'Çözünürlük ölçeği', min: 0.3, max: 1, step: 0.02, fmt: (v) => pct(v) + ' (' + Math.round(innerWidth * (window.devicePixelRatio || 1) * v) + '×' + Math.round(innerHeight * (window.devicePixelRatio || 1) * v) + ')', note: 'Ekranın yerel çözünürlüğüne oranı. FPS\'i en çok etkileyen ayardır.' },
      { k: 'gDyn', t: 'tog', label: 'Dinamik çözünürlük', note: 'FPS hedefin altına düşerse çözünürlüğü otomatik azaltır, toparlanınca geri yükseltir.' },
      { k: 'gFps', t: 'seg', label: 'FPS sınırı', opts: [[30, '30'], [45, '45'], [60, '60'], [90, '90'], [120, '120'], [0, 'Sınırsız']], note: '30 FPS pil ve ısınma için en iyisidir.' },
      { k: 'gMsaa', t: 'seg', label: 'Kenar yumuşatma (MSAA)', opts: [[0, 'Kapalı'], [2, '2x'], [4, '4x']], note: 'Mobilde pahalıdır; değiştirince sahne yeniden kurulur.' },
      { h: 'Dünya' },
      { k: 'gDist', t: 'range', label: 'Görüş mesafesi', min: 500, max: 3200, step: 100, fmt: (v) => v + ' m', note: 'Uzak kısımlar sisle kaybolur; azaltmak FPS kazandırır.' },
      { k: 'gTrees', t: 'range', label: 'Ağaç yoğunluğu', min: 0, max: 100, step: 5, fmt: (v) => v + '%' },
      { k: 'gTreeDist', t: 'range', label: 'Ağaç çizim mesafesi', min: 300, max: 1500, step: 50, fmt: (v) => v + ' m' },
      { k: 'gGrass', t: 'seg', label: 'Çim', opts: Q4 },
      { k: 'gWater', t: 'seg', label: 'Deniz', opts: [[0, 'Basit'], [1, 'Detaylı']], note: 'Detaylı: kıyı köpüğü ve dalga katmanları.' },
      { h: 'Işık ve gölge' },
      { k: 'gShadow', t: 'seg', label: 'Gölgeler', opts: Q4 },
      { k: 'gShadowDist', t: 'range', label: 'Gölge mesafesi', min: 30, max: 120, step: 5, fmt: (v) => v + ' m' },
      { k: 'gRefl', t: 'seg', label: 'Araç yansımaları', opts: Q4, note: 'Aracın gövdesinde çevrenin canlı yansıması.' },
      { k: 'gMirror', t: 'seg', label: 'Dikiz aynası kalitesi', opts: Q4 },
      { k: 'gSpot', t: 'tog', label: 'Far ışığı (yolu aydınlatır)' },
      { h: 'Görüntü efektleri' },
      { k: 'gBloom', t: 'tog', label: 'Parlama (bloom)' },
      { k: 'gBloomK', t: 'range', label: 'Parlama şiddeti', min: 0.1, max: 1.2, step: 0.05, fmt: (v) => v.toFixed(2) },
      { k: 'gSsao', t: 'tog', label: 'Ortam gölgesi (SSAO)', note: 'Köşelerde ve araç altlarında derinlik hissi verir.' },
      { k: 'gSharp', t: 'range', label: 'Keskinlik', min: 0, max: 0.5, step: 0.02, fmt: (v) => v.toFixed(2) },
      { k: 'gVig', t: 'range', label: 'Vinyet (kenar koyulaşması)', min: 0, max: 0.6, step: 0.02, fmt: (v) => v.toFixed(2) },
      { k: 'gGrain', t: 'range', label: 'Film greni', min: 0, max: 0.04, step: 0.002, fmt: (v) => v.toFixed(3) },
      { k: 'gParticles', t: 'tog', label: 'Lastik izi ve duman / toz' },
      { h: 'Renk' },
      { k: 'gExp', t: 'range', label: 'Parlaklık', min: 0.6, max: 1.6, step: 0.02, fmt: (v) => v.toFixed(2) },
      { k: 'gContrast', t: 'range', label: 'Kontrast', min: 0.9, max: 1.3, step: 0.01, fmt: (v) => v.toFixed(2) },
      { k: 'gSat', t: 'range', label: 'Doygunluk', min: 0.6, max: 1.6, step: 0.02, fmt: (v) => v.toFixed(2) },
      { h: 'Doku' },
      { k: 'gAniso', t: 'seg', label: 'Doku filtreleme', opts: [[1, '1x'], [2, '2x'], [4, '4x'], [8, '8x'], [16, '16x']], note: 'Uzaktaki yol ve cephelerin netliği.' },
      { h: 'Gösterge' },
      { k: 'fpsShow', t: 'tog', label: 'FPS göster' },
    ] },
    { id: 'play', name: 'Oynanış', items: [
      { h: 'Sürüş modeli' },
      { k: 'drive', t: 'seg', label: 'Zorluk', opts: [['arcade', 'Arcade'], ['real', 'Gerçekçi'], ['sim', 'Simülasyon']], note: 'Arcade: daha fazla tutuş ve tüm yardımlar açık. Simülasyon: ESC ve çekiş kontrolü kapalı.' },
      { k: 'assist', t: 'tog', label: 'Hıza duyarlı direksiyon' },
      { k: 'manual', t: 'tog', label: 'Manuel vites' },
      { k: 'esc', t: 'seg', label: 'ESC (denge kontrolü)', opts: [[2, 'Açık'], [1, 'Spor'], [0, 'Kapalı']] },
      { k: 'tcs', t: 'tog', label: 'Çekiş kontrolü (TCS)' },
      { k: 'abs', t: 'tog', label: 'ABS' },
      { h: 'Direksiyon' },
      { k: 'steerMode', t: 'seg', label: 'Direksiyon tipi', opts: [['slide', 'Kaydır'], ['wheel', 'Direksiyon'], ['buttons', 'Tuşlar'], ['tilt', 'Eğme']] },
      { k: 'sens', t: 'range', label: 'Direksiyon hassasiyeti', min: 0.5, max: 2, step: 0.05, fmt: (v) => v.toFixed(2) },
      { h: 'Kamera' },
      { k: 'camDef', t: 'seg', label: 'Başlangıç kamerası', opts: [[0, 'Takip'], [1, 'Kokpit'], [2, 'Kaput'], [3, 'Serbest']] },
      { k: 'fov', t: 'range', label: 'Kokpit görüş açısı (FOV)', min: 40, max: 85, step: 1, fmt: (v) => v + '°' },
      { k: 'fovOut', t: 'range', label: 'Takip kamerası görüş açısı', min: 40, max: 75, step: 1, fmt: (v) => v + '°' },
      { k: 'seatY', t: 'range', label: 'Koltuk yüksekliği', min: -0.15, max: 0.1, step: 0.01, fmt: (v) => v.toFixed(2) },
      { k: 'seatX', t: 'range', label: 'Koltuk geri (+) / ileri (−)', min: -0.1, max: 0.3, step: 0.01, fmt: (v) => v.toFixed(2) },
      { h: 'Dünya ve trafik' },
      { k: 'hour', t: 'range', label: 'Gün saati', min: 0, max: 24, step: 0.1, fmt: (v) => String(Math.floor(v)).padStart(2, '0') + ':' + String(Math.round((v % 1) * 60)).padStart(2, '0') },
      { k: 'traffic', t: 'range', label: 'Hareketli trafik', min: 0, max: 5, step: 1, fmt: (v) => v },
      { k: 'parked', t: 'range', label: 'Park hâlinde araç', min: 0, max: 40, step: 1, fmt: (v) => v },
      { k: 'aggr', t: 'range', label: 'Trafik agresifliği', min: 0, max: 1, step: 0.05, fmt: pct },
      { h: 'Diğer' },
      { k: 'units', t: 'seg', label: 'Hız birimi', opts: [['kmh', 'km/h'], ['mph', 'mph']] },
      { k: 'autoLights', t: 'tog', label: 'Geceleri farları otomatik aç' },
      { k: 'vibrate', t: 'tog', label: 'Çarpma titreşimi' },
    ] },
    { id: 'ui', name: 'Arayüz', items: [
      { h: 'Ekran düzeni' },
      { k: 'hudScale', t: 'range', label: 'Düğme boyutu', min: 0.8, max: 1.4, step: 0.05, fmt: pct },
      { k: 'hudOpacity', t: 'range', label: 'Düğme opaklığı', min: 0.6, max: 1, step: 0.02, fmt: pct, note: 'Düğmeler varsayılan olarak yarı saydam değil, okunaklıdır.' },
      { k: 'lefty', t: 'tog', label: 'Sol el düzeni (direksiyon sağda, pedallar solda)' },
      { k: 'showMap', t: 'tog', label: 'Mini harita' },
      { k: 'showMeters', t: 'tog', label: 'G-metre göstergesi' },
      { k: 'mirror', t: 'tog', label: 'Kokpit dikiz aynası' },
    ] },
    { id: 'snd', name: 'Ses', items: [
      { k: 'volume', t: 'range', label: 'Ana ses', min: 0, max: 1, step: 0.05, fmt: pct },
      { k: 'vEngine', t: 'range', label: 'Motor sesi', min: 0, max: 1.5, step: 0.05, fmt: pct },
      { k: 'vTire', t: 'range', label: 'Lastik ve yol sesi', min: 0, max: 1.5, step: 0.05, fmt: pct },
    ] },
    { id: 'tune', name: 'Araç ayarı', items: [
      { k: 'grip', t: 'range', label: 'Lastik tutuşu', min: 0.7, max: 1.3, step: 0.01, fmt: (v) => v.toFixed(2) },
      { k: 'susp', t: 'range', label: 'Süspansiyon sertliği', min: 0.6, max: 1.8, step: 0.02, fmt: (v) => v.toFixed(2) },
      { k: 'bias', t: 'range', label: 'Fren dengesi (ön +)', min: -0.15, max: 0.15, step: 0.01, fmt: (v) => v.toFixed(2) },
      { k: 'final', t: 'range', label: 'Son dişli oranı', min: 0.8, max: 1.25, step: 0.01, fmt: (v) => v.toFixed(2) },
    ] },
  ];
  PC.SCHEMA = SCHEMA;
  const DRIVE = { arcade: { esc: 2, tcs: 1, abs: 1, assist: 1, grip: 1.12 }, real: { esc: 2, tcs: 1, abs: 1, assist: 1, grip: 1 }, sim: { esc: 0, tcs: 0, abs: 1, assist: 0, grip: 1 } };

  M.resetTab = function (id) {
    const sec = SCHEMA.find((s) => s.id === id), D = PC.DEFAULTS;
    for (const it of sec.items) if (it.k && it.k !== 'preset') M.set(it.k, D[it.k]);
    if (id === 'gfx') M.set('preset', D.preset); else if (id === 'play') M.set('drive', 'real');
    UI.toast(sec.name + ' ayarları sıfırlandı');
  };
  M.set = function (k, v, silent) {
    ST[k] = v;
    if (k === 'preset' && PRESETS[v]) { Object.assign(ST, PRESETS[v]); for (const g of GKEYS) fire('setting', g, ST[g]); }
    else if (GKEYS.indexOf(k) >= 0 && ST.preset !== 'custom') ST.preset = 'custom';
    if (k === 'drive' && DRIVE[v]) { Object.assign(ST, DRIVE[v]); for (const g in DRIVE[v]) fire('setting', g, ST[g]); }
    PC.saveSettings(); if (!silent) fire('setting', k, v); UI.applyMode();
  };

  // ================= tam ekran paneller =================
  function panelShell(title, tabs) {
    const p = el('div', 'scr'); p.id = 'panel';
    const h = el('header'); const back = el('button', 'btn', '‹ Geri'); back.addEventListener('click', () => M.closePanel()); h.appendChild(back); h.appendChild(el('h1', '', title));
    const tb = el('div', 'tabs'); h.appendChild(tb); p.appendChild(h); const body = el('div', 'body'); p.appendChild(body);
    return { p, body, tb };
  }
  M.panel = function (kind) {
    M.closePanel(true); M.open = kind;
    if (kind === 'settings') { LS.set('pcd-seen-settings', '1'); M.updateBang(); buildSettings(); }
    else if (kind === 'garage') buildGarage();
    else if (kind === 'about') buildAbout();
  };
  M.closePanel = function (keep) { const p = $('panel'); if (p) p.remove(); M.open = null; if (!keep && M.ctx === 'pause') $('pauseM').classList.remove('hidden'); };

  function control(it) {
    const box = el('div', 'item'), v = ST[it.k];
    const top = el('div', 'top'); top.appendChild(el('label', '', it.label));
    if (it.t === 'range') { const o = el('output', ''); o.textContent = it.fmt ? it.fmt(v) : v; top.appendChild(o); it._o = o; }
    if (it.t === 'tog') { const s = el('div', 'sw' + (v ? ' on' : '')); s.addEventListener('click', () => { const nv = ST[it.k] ? 0 : 1; M.set(it.k, nv); s.classList.toggle('on', !!nv); sync(); }); top.appendChild(s); it._s = s; }
    box.appendChild(top);
    if (it.t === 'seg') {
      const sg = el('div', 'seg'); it._b = [];
      for (const [val, name] of it.opts) { const b = el('button', String(ST[it.k]) === String(val) ? 'on' : '', name); b.addEventListener('click', () => { M.set(it.k, typeof it.opts[0][0] === 'number' ? +val : val); sync(); }); sg.appendChild(b); it._b.push([val, b]); }
      box.appendChild(sg);
    }
    if (it.t === 'range') {
      const r = el('input'); r.type = 'range'; r.min = it.min; r.max = it.max; r.step = it.step; r.value = v; it._r = r;
      r.addEventListener('input', () => { const nv = +r.value; it._o.textContent = it.fmt ? it.fmt(nv) : nv; M.set(it.k, nv); sync(); });
      box.appendChild(r);
    }
    if (it.note) box.appendChild(el('small', '', it.note));
    return box;
  }
  let curItems = [];
  function sync() { // ön ayar veya zorluk değişince diğer kontrolleri tazele
    for (const it of curItems) {
      const v = ST[it.k];
      if (it._b) for (const [val, b] of it._b) b.classList.toggle('on', String(v) === String(val));
      if (it._r) { it._r.value = v; it._o.textContent = it.fmt ? it.fmt(+v) : v; }
      if (it._s) it._s.classList.toggle('on', !!v);
    }
  }
  function buildSettings() {
    const sh = panelShell('AYARLAR'), tabs = SCHEMA.map((s) => s.id);
    const show = (id) => {
      M.setTab = id; sh.tb.querySelectorAll('.btn').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
      sh.body.innerHTML = ''; curItems = []; const sec = SCHEMA.find((s) => s.id === id);
      let grid = null; for (const it of sec.items) { if (it.h) { sh.body.appendChild(el('h2', '', it.h)); grid = el('div', 'grid2'); sh.body.appendChild(grid); continue; } if (!grid) { grid = el('div', 'grid2'); sh.body.appendChild(grid); } curItems.push(it); grid.appendChild(control(it)); }
      const a = el('div', 'action'); a.style.marginTop = '16px'; const r = el('button', 'btn red', '↺ Bu sekmeyi varsayılana sıfırla (' + sec.name + ')');
      r.addEventListener('click', () => dialog('<b>' + sec.name + '</b> sekmesindeki tüm ayarlar varsayılana dönecek. Emin misin?', [['Sıfırla', () => { M.resetTab(id); show(id); }, 'red'], ['Vazgeç', null]])); a.appendChild(r); sh.body.appendChild(a);
      sh.body.scrollTop = 0;
    };
    for (const s of SCHEMA) { const b = el('button', 'btn', s.name); b.dataset.id = s.id; b.addEventListener('click', () => show(s.id)); sh.tb.appendChild(b); }
    document.body.appendChild(sh.p); show(M.setTab && tabs.indexOf(M.setTab) >= 0 ? M.setTab : 'gfx');
    if (M.ctx === 'pause') $('pauseM').classList.add('hidden');
  }

  // ---------- garaj ----------
  function buildGarage() {
    const sh = panelShell('GARAJ'); const pause = M.ctx === 'pause';
    const draw = () => {
      sh.body.innerHTML = '';
      const specs = PC.CarSpecs, cats = []; for (const c of specs) if (!c.hidden && cats.indexOf(c.cat || 'Diğer') < 0) cats.push(c.cat || 'Diğer');
      cats.sort((a, b) => (a === 'Araçlar' ? -1 : b === 'Araçlar' ? 1 : 0)); // birincil kategori: Araçlar
      const cur = specs[ST.car]; if (!M.cat || cats.indexOf(M.cat) < 0) M.cat = cur && !cur.hidden ? cur.cat || 'Diğer' : cats[0];
      sh.tb.innerHTML = ''; for (const c of cats) { const b = el('button', 'btn' + (c === M.cat ? ' on' : ''), c + ' (' + specs.filter((x) => !x.hidden && (x.cat || 'Diğer') === c).length + ')'); b.addEventListener('click', () => { M.cat = c; draw(); }); sh.tb.appendChild(b); }
      const g = el('div', 'garage'), list = el('div', 'cars');
      specs.forEach((c, i) => { if (c.hidden || (c.cat || 'Diğer') !== M.cat) return; const card = el('div', 'card' + (i === ST.car ? ' on' : ''), (PC.Thumbs && PC.Thumbs[i] ? '<img src="' + PC.Thumbs[i] + '">' : '') + '<b>' + c.name + '</b>'); card.addEventListener('click', () => pick(i)); list.appendChild(card); });
      const sp = specs[ST.car], info = el('div', 'info');
      const hp = Math.round((sp.powerKw || 150) * 1.341), dr = { rwd: 'Arkadan itiş', fwd: 'Önden çekiş', awd: '4 çeker' }[sp.drive] || sp.drive;
      info.innerHTML = '<h3>' + sp.name + '</h3><p>' + sp.cls + '</p><div class="spec"><div>Güç<b>' + hp + ' hp</b></div><div>Ağırlık<b>' + Math.round(sp.mass) + ' kg</b></div><div>Çekiş<b>' + dr + '</b></div><div>Vites<b>' + (sp.gears ? sp.gears.length : '-') + ' ileri</b></div></div><div class="colors"></div>';
      const cl = info.querySelector('.colors'); sp.colors.forEach((c, i) => { const s = el('i', i === ST.color ? 'on' : ''); s.style.background = '#' + (c === null ? 0x8a0f1a : c).toString(16).padStart(6, '0'); s.addEventListener('click', () => { ST.color = i; PC.saveSettings(); draw(); applyCar(); }); cl.appendChild(s); });
      if (pause) {
        info.appendChild(el('h2', '', 'Işınlan')); const tp = el('div', 'action');
        (PC.World.teleports || []).forEach((t, i) => { const b = el('button', 'btn', t.name); b.addEventListener('click', () => { M.closePanel(true); M.resume(); fire('teleport', i); }); tp.appendChild(b); }); info.appendChild(tp);
        info.appendChild(el('h2', '', 'Görev')); const mb = el('button', 'btn', '🏁 Varış görevi başlat / iptal'); mb.addEventListener('click', () => { M.closePanel(true); M.resume(); fire('mission'); }); info.appendChild(mb);
      } else {
        info.appendChild(el('h2', '', 'Başlangıç noktası')); const sg = el('div', 'seg'); const opts = [[-1, 'Şehir (varsayılan)']].concat((PC.World.teleports || []).map((t, i) => [i, t.name]));
        for (const [v, n] of opts) { const b = el('button', (ST.startAt === undefined ? -1 : ST.startAt) === v ? 'on' : '', n); b.addEventListener('click', () => { ST.startAt = v; PC.saveSettings(); draw(); }); sg.appendChild(b); } info.appendChild(sg);
      }
      const use = el('button', 'btn pri', pause ? 'ARACI KULLAN VE DEVAM ET' : 'ARACI KULLAN'); use.style.cssText = 'width:100%;margin-top:12px'; use.addEventListener('click', async () => { M.busy(true, 'Araç hazırlanıyor…'); try { await PC.Game.carReady(); } catch (e) { /* */ } M.busy(false); M.closePanel(); if (pause) M.resume(); }); info.appendChild(use);
      g.appendChild(list); g.appendChild(info); sh.body.appendChild(g);
    };
    const applyCar = async () => {
      M.busy(true, 'Araç yükleniyor…'); PC.Game.carError = null;
      try { await fire('car'); } catch (e) { PC.Game.carError = String((e && e.message) || e); } finally { M.busy(false); }
      if (PC.Game.carError) { dialog('Araç yüklenemedi: <small>' + PC.Game.carError + '</small>', [['Tamam', null]]); }
      const cur = PC.Game.car && PC.CarSpecs.indexOf(PC.Game.car.spec); if (cur >= 0 && cur !== ST.car) { ST.car = cur; PC.saveSettings(); }
      draw(); if (!PC.Game.carError) UI.toast('Seçildi: ' + PC.CarSpecs[ST.car].name);
    };
    const pick = (i) => { if (M.busyCar) return; M.busyCar = true; ST.car = i; ST.color = 0; ST.bias = 0; PC.saveSettings(); draw(); applyCar().finally(() => { M.busyCar = false; }); };
    document.body.appendChild(sh.p); draw(); M.refresh = draw;
    if (pause) $('pauseM').classList.add('hidden');
  }

  // ---------- hakkında ----------
  function buildAbout() {
    const sh = panelShell('HAKKINDA'); sh.tb.remove();
    const b = sh.body; b.innerHTML = '<h2>Sürüm</h2><div class="item"><label>Pacifica Coast Driver Mobile v' + PC.VERSION.name + '</label><small>Derleme ' + PC.VERSION.build + ' · açık kaynak: github.com/' + PC.VERSION.repo + '</small><div class="action"><button class="btn pri" id="abUpd">Güncellemeleri denetle</button><button class="btn" id="abGit">GitHub sayfası</button></div></div>'
      + '<h2>Sürüş istatistikleri</h2><div class="item"><small>' + (() => { const s = PC.Game.stats; return 'Toplam yol: <b>' + s.km.toFixed(1) + ' km</b> · Oyun süresi: <b>' + Math.floor(s.sec / 60) + ' dk</b> · En yüksek hız: <b>' + Math.round(s.top) + ' km/s</b>'; })() + '</small></div>'
      + '<h2>Kontroller</h2><div class="item"><small>Klavye: Yön tuşları / WASD sür · Boşluk el freni · C kamera · Q/E vites · 1-4 D/N/R/P · R yola koy · Geri tuşu geri sar · T ağır çekim · L far · Z/X sinyal · H korna · G görev · Esc duraklat</small></div>'
      + '<h2>Emeği geçenler</h2><div class="item"><small>' + (PC.Credits || []).join('<br>') + '</small></div>'
      + '<h2>Veri</h2><div class="item"><div class="action"><button class="btn red" id="abReset">Tüm ayarları sıfırla</button></div></div>';
    b.querySelector('#abUpd').addEventListener('click', () => M.checkUpdate(true)); b.querySelector('#abGit').addEventListener('click', () => M.openUrl('https://github.com/' + PC.VERSION.repo));
    b.querySelector('#abReset').addEventListener('click', () => dialog('Tüm ayarlar varsayılana dönecek. Emin misin?', [['Sıfırla', () => { try { localStorage.removeItem('pacifica-coast'); localStorage.removeItem('pcd-seen-settings'); } catch (e) { /* */ } location.reload(); }, 'red'], ['Vazgeç', null]]));
    document.body.appendChild(sh.p); if (M.ctx === 'pause') $('pauseM').classList.add('hidden');
  }

  // ================= duraklatma menüsü =================
  M.pause = function (open) {
    if (M.ctx === 'main') return;
    M.ctx = 'pause'; PC.Game.pause(); let p = $('pauseM');
    if (!p) {
      p = el('div'); p.id = 'pauseM';
      p.innerHTML = '<div class="box"><h1>DURAKLATILDI</h1><button class="mbtn pri" id="pResume">DEVAM ET</button><button class="mbtn" id="pGarage">GARAJ / IŞINLAN</button><button class="mbtn" id="pSet">AYARLAR</button><button class="mbtn" id="pReset">YOLA KOY</button><button class="mbtn" id="pMain">ANA MENÜ</button></div>';
      document.body.appendChild(p);
      $('pResume').addEventListener('click', () => M.resume()); $('pGarage').addEventListener('click', () => M.panel('garage')); $('pSet').addEventListener('click', () => M.panel('settings'));
      $('pReset').addEventListener('click', () => { M.resume(); fire('reset'); }); $('pMain').addEventListener('click', () => { M.closePanel(true); p.classList.add('hidden'); PC.Game.stop(); M.ctx = 'main'; M.showMain(); });
    }
    p.classList.remove('hidden'); $('hud').classList.add('hidden'); if (open) M.panel(open);
  };
  M.resume = function () {
    M.closePanel(true); const p = $('pauseM'); if (p) p.classList.add('hidden');
    if (M.ctx === 'pause') { M.ctx = 'play'; PC.Game.resume(); }
  };
  M.toggle = function () { if (M.ctx === 'pause') { if (M.open) M.closePanel(); else M.resume(); } else if (M.ctx === 'play') M.pause(); };

  M.init = function () {
    M.buildMain();
    if (LS.get('pcd-launched') !== '1') { M.first = true; }
  };
  M.markLaunched = function () { LS.set('pcd-launched', '1'); };
})();
