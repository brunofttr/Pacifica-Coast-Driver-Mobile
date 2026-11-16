// Pacifica Coast — gömülü varlıklar (derlemede base64 olarak HTML'e girer; geliştirmede assets/ klasöründen okunur)
(function () {
  'use strict';
  const PC = (window.PC = window.PC || {});
  const A = (PC.Assets = { cache: {} });
  A.get = function (name) {
    if (A.cache[name]) return A.cache[name];
    const el = document.getElementById('asset-' + name);
    let p;
    if (el) p = new Promise((res) => { const s = atob(el.textContent.trim()), n = s.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i); el.textContent = ''; res(u.buffer); });
    else if (window.PC_DIST && name.indexOf('cars/') === 0) { const sg = name.split('/'), dir = sg[0] + '/' + sg[1], rest = sg.slice(2).join('/'); p = A.loadPack(dir).then(() => { const b = A.packs[dir][rest]; if (!b) throw new Error(name); const dec = () => { const st = atob(b), n = st.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = st.charCodeAt(i); return u.buffer; }; return fetch('data:application/octet-stream;base64,' + b).then((r) => r.arrayBuffer()).catch(dec); }); }
    else p = fetch('assets/' + name).then((r) => { if (!r.ok) throw new Error(name); return r.arrayBuffer(); });
    return (A.cache[name] = p);
  };
  A.imgs = {};
  A.TEX = ['fac0', 'fac0_n', 'fac0_r', 'fac1', 'fac1_n', 'fac1_r', 'fac2', 'fac2_n', 'fac2_r', 'fac3', 'fac3_n', 'fac3_r', 'asphalt', 'asphalt_n', 'paving', 'paving_n', 'ground', 'ground_n', 'grass', 'leaf', 'leaf_a', 'blade', 'blade_a', 'bark', 'bark_n'];
  A.loadImages = function () {
    return Promise.all(A.TEX.map((n) => A.get('tex/' + n + '.jpg').then((buf) => new Promise((res) => {
      const im = new Image(); im.onload = () => { A.imgs[n] = im; res(); }; im.onerror = () => res();
      im.src = URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
    })).catch(() => {})));
  };
})();
(function () {
  const A = window.PC.Assets;
  A.drop = function (dir) { for (const k in A.cache) if (k.indexOf(dir + '/') === 0) delete A.cache[k]; delete A.packs[dir]; delete A._pl[dir]; const s = document.getElementById('pack-' + dir); if (s) s.remove(); };
  A.packs = {}; A._pl = {};
  A.pack = function (dir, files) { A.packs[dir] = files; };
  A.loadPack = function (dir) {
    if (A.packs[dir]) return Promise.resolve();
    if (A._pl[dir]) return A._pl[dir];
    return (A._pl[dir] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.id = 'pack-' + dir; s.src = (window.PC_PACK_DIR !== undefined ? window.PC_PACK_DIR : 'data/') + dir.split('/')[1] + '.js';
      s.onload = () => (A.packs[dir] ? res() : rej(new Error('paket boş')));
      s.onerror = () => { delete A._pl[dir]; s.remove(); rej(new Error('paket bulunamadı')); };
      document.head.appendChild(s);
    }));
  };
})();
