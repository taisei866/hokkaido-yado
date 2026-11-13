// ===== 共通 =====
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const go = p => (location.hash = '#/' + p);
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem('hy_' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('hy_' + k, JSON.stringify(v)); } catch {} },
};
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 1900); };
const qstr = q => new URLSearchParams(Object.entries(q).filter(([, v]) => v !== '' && v != null));

const P = {
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  filter: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
};
const I = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;

const KINDS = { hotel: ['ホテル', '🏨', '#1c7ed6'], ryokan: ['旅館', '🏯', '#c2255c'], guest: ['民宿・ペンション', '🏡', '#2f9e44'], hostel: ['ゲストハウス', '🛏️', '#f08c00'], motel: ['モーテル', '🚗', '#7048e8'] };
const REGION_EMOJI = { '札幌・定山渓': '🏙️', '小樽・ニセコ・積丹': '⛷️', '千歳・苫小牧': '✈️', '登別・洞爺・室蘭': '♨️', '函館・道南': '🌉', '日高・えりも': '🐎', '旭川・層雲峡': '🍁', '富良野・美瑛': '💜', '空知・岩見沢': '🌾', '稚内・利尻礼文・留萌': '🌊', '網走・知床・紋別': '🧊', '釧路・阿寒・根室': '🦢', '帯広・十勝': '🐄' };
const PAGE = 40;

// ===== データ =====
let DB;
const load = async () => DB ??= await (await fetch('data/hotels.json', { cache: 'no-cache' })).json();
const filt = (list, q) => {
  const kw = (q.kw || '').trim().toLowerCase();
  return list.filter(h => (!q.region || h.region === q.region) && (!q.city || h.city === q.city) && (!q.kind || q.kind.split(',').includes(h.kind))
    && (!q.onsen || h.onsen) && (!q.web || h.website) && (!kw || `${h.name} ${h.city} ${h.addr || ''}`.toLowerCase().includes(kw)));
};
const favs = () => LS.get('fav') || [];
window.toggleFav = (id, ev) => {
  ev?.stopPropagation();
  const f = favs(), i = f.indexOf(id);
  i >= 0 ? f.splice(i, 1) : f.unshift(id);
  LS.set('fav', f); toast(i >= 0 ? 'お気に入りから外しました' : 'お気に入りに追加しました'); render();
};

// ===== 部品 =====
const empty = (t, p) => `<div class="empty"><div>🏨</div><b>${t}</b><p>${p}</p></div>`;
const heart = id => `<button class="heart ${favs().includes(id) ? 'on' : ''}" onclick="toggleFav('${id}', event)" aria-label="お気に入り">${I('heart')}</button>`;
const kindTag = h => `<span class="tag" style="background:color-mix(in srgb,${KINDS[h.kind][2]} 14%,#fff);color:${KINDS[h.kind][2]}">${KINDS[h.kind][0]}</span>`;
const card = h => `<div class="card" onclick="go('hotel/${h.id}')">
  <div class="ph emo" style="--c:${KINDS[h.kind][2]}">${KINDS[h.kind][1]}</div>
  <div class="cb"><b class="nm">${esc(h.name)}</b>
    <div class="meta">${I('pin', 12)} ${esc(h.city)}・${esc(h.region)}</div>
    <div class="tags">${kindTag(h)}${h.onsen ? '<span class="tag m-bd">♨️ 温泉</span>' : ''}${h.website ? '<span class="tag">公式サイトあり</span>' : ''}</div></div>
  ${heart(h.id)}</div>`;
const linksFor = h => (window.LINKS || []).map(l => `<a class="btn" target="_blank" rel="noopener sponsored" href="${esc(l.url.replace('{q}', encodeURIComponent(`${h.name} ${h.city}`)))}">${I('ext', 18)}${esc(l.label)}</a>`).join('');
const CREDIT = () => `<footer class="credit">宿データ：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>（ODbL）${DB?.updated ? `｜更新 ${esc(DB.updated)}` : ''}
  <p>掲載情報は地図データに基づくもので、営業状況・料金は各予約サイト・公式サイトでご確認ください。当サイトのリンクには広告（PR）が含まれる場合があります。</p>
  ${DB?.updated === 'sample' ? '<p><b>サンプルデータを表示中です（GitHub Actionsで「宿データ更新」を実行すると実データに切り替わります）</b></p>' : ''}</footer>`;
const activeChips = q => [q.region, q.city, ...(q.kind ? q.kind.split(',').map(k => KINDS[k]?.[0]) : []), q.onsen && '温泉', q.web && '公式サイトあり', q.kw && `「${q.kw}」`].filter(Boolean);

function mkMap(list) {
  if (!window.L) { $('#map').innerHTML = '<p class="muted" style="padding:40px;text-align:center">地図を読み込めませんでした。再読み込みしてください。</p>'; return; }
  const m = L.map('map', { zoomControl: false, preferCanvas: true }).setView([43.2, 142.8], 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(m);
  list.forEach(h => L.circleMarker([h.lat, h.lng], { radius: 7, color: '#fff', weight: 2, fillColor: KINDS[h.kind][2], fillOpacity: 1 }).addTo(m)
    .bindPopup(`<div class="pop"><b>${esc(h.name)}</b><small>${KINDS[h.kind][0]}・${esc(h.city)}${h.onsen ? '・♨️温泉' : ''}</small><a href="#/hotel/${h.id}">詳細を見る</a></div>`));
  if (list.length > 1) m.fitBounds(list.map(h => [h.lat, h.lng]), { padding: [30, 30], maxZoom: 15 }); else if (list.length) m.setView([list[0].lat, list[0].lng], 15);
}

// ===== 操作 =====
window.doSearch = f => { const fd = new FormData(f); go('list?' + qstr({ kw: fd.get('kw'), region: fd.get('region') })); };
window.doFilter = f => { const fd = new FormData(f); go('list?' + qstr({ region: fd.get('region'), city: fd.get('city'), kind: fd.getAll('kind').join(','), onsen: fd.get('onsen'), web: fd.get('web'), kw: fd.get('kw') })); };
window.onRegion = sel => {
  const cities = [...new Set(DB.hotels.filter(h => !sel.value || h.region === sel.value).map(h => h.city))].sort((a, b) => a.localeCompare(b, 'ja'));
  $('#city').innerHTML = `<option value="">市町村：すべて</option>${cities.map(c => `<option>${esc(c)}</option>`).join('')}`;
};

// ===== 画面 =====
const V = {
  async ''() {
    const db = await load(), n = r => db.hotels.filter(h => h.region === r).length;
    return { h: `<div class="hero"><p class="brand">北海道やどさがし</p><h1>北海道の宿を、<br>エリアと種類で探す。</h1>
      <form class="sform" onsubmit="doSearch(this);return false">
        <label>キーワード<input name="kw" placeholder="宿名・市町村（例：洞爺湖、すすきの）"></label>
        <label>地域<select name="region"><option value="">北海道全域</option>${db.regions.map(r => `<option>${r}</option>`).join('')}</select></label>
        <button class="btn">${I('search', 18)}${db.hotels.length.toLocaleString()}軒から探す</button></form></div>
      <section><h2>地域から探す</h2><div class="rgrid">${db.regions.map(r => `<a class="rtile" href="#/list?${qstr({ region: r })}"><span>${REGION_EMOJI[r] || '📍'}</span><b>${r}</b><small>${n(r)}軒</small></a>`).join('')}</div></section>
      <section><h2>種類から探す</h2><div class="chips">${Object.entries(KINDS).map(([k, [t, e]]) => `<a class="chip" href="#/list?kind=${k}">${e} ${t}</a>`).join('')}<a class="chip" href="#/list?onsen=1">♨️ 温泉地の宿</a></div></section>
      ${CREDIT()}` };
  },
  async list({ q }) {
    const db = await load(), list = filt(db.hotels, q), lim = +q.lim || PAGE, act = activeChips(q);
    return { t: q.region || q.city || '検索結果', h: `<div class="toolbar"><span class="count"><b>${list.length.toLocaleString()}</b>軒</span>
      <a class="tbtn" href="#/filter?${qstr(q)}">${I('filter', 16)}絞り込み</a><a class="tbtn" href="#/map?${qstr({ ...q, lim: '' })}">${I('map', 16)}地図</a></div>
      ${act.length ? `<div class="chips small">${act.map(a => `<span class="chip on">${esc(a)}</span>`).join('')}<a class="chip" href="#/list">クリア</a></div>` : ''}
      ${list.slice(0, lim).map(card).join('') || empty('条件に合う宿がありません', '条件を減らして探してみてください')}
      ${list.length > lim ? `<a class="btn sub" href="#/list?${qstr({ ...q, lim: lim + PAGE })}">もっと見る（残り${(list.length - lim).toLocaleString()}軒）</a>` : ''}${CREDIT()}`, keepScroll: !!q.lim };
  },
  async filter({ q }) {
    const db = await load(), cities = [...new Set(db.hotels.filter(h => !q.region || h.region === q.region).map(h => h.city))].sort((a, b) => a.localeCompare(b, 'ja'));
    const kinds = (q.kind || '').split(',');
    return { t: '絞り込み', h: `<form class="fform" onsubmit="doFilter(this);return false">
      <h3>キーワード</h3><input name="kw" value="${esc(q.kw)}" placeholder="宿名・住所など">
      <h3>地域・市町村</h3><div class="row2"><select name="region" onchange="onRegion(this)"><option value="">地域：すべて</option>${db.regions.map(r => `<option ${r === q.region ? 'selected' : ''}>${r}</option>`).join('')}</select>
        <select name="city" id="city"><option value="">市町村：すべて</option>${cities.map(c => `<option ${c === q.city ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <h3>宿の種類（複数選択可）</h3><div class="chips">${Object.entries(KINDS).map(([k, [t, e]]) => `<label class="chip"><input type="checkbox" name="kind" value="${k}" ${kinds.includes(k) ? 'checked' : ''}>${e} ${t}</label>`).join('')}</div>
      <h3>こだわり</h3><div class="chips"><label class="chip"><input type="checkbox" name="onsen" value="1" ${q.onsen ? 'checked' : ''}>♨️ 温泉地の宿</label><label class="chip"><input type="checkbox" name="web" value="1" ${q.web ? 'checked' : ''}>公式サイトあり</label></div>
      <div class="sticky-bottom"><a class="btn sub" href="#/filter">クリア</a><button class="btn">${I('search', 18)}この条件で表示</button></div></form>` };
  },
  async map({ q }) {
    const db = await load(), list = filt(db.hotels, q);
    return { t: '地図', cls: 'p0', h: `<div class="mapsum">${activeChips(q).map(esc).join('・') || '北海道全域'}｜${list.length.toLocaleString()}軒（ピンの色＝宿の種類）</div><div id="map" class="full"></div>
      <a class="fab" href="#/list?${qstr(q)}">${I('list', 18)}一覧で見る</a>`, a: () => mkMap(list) };
  },
  async hotel({ id }) {
    const db = await load(), h = db.hotels.find(x => x.id === id);
    if (!h) return { t: '宿の詳細', h: empty('宿が見つかりません', 'データ更新で掲載が終了した可能性があります') };
    const near = db.hotels.filter(x => x.id !== h.id && x.city === h.city).slice(0, 5);
    return { t: '宿の詳細', h: `<div class="dhero emo" style="--c:${KINDS[h.kind][2]}">${KINDS[h.kind][1]}</div><div class="sheet">
      <div class="tags">${kindTag(h)}${h.onsen ? '<span class="tag m-bd">♨️ 温泉</span>' : ''}</div>
      <div class="drate"><h1 class="dname">${esc(h.name)}</h1>${heart(h.id)}</div>
      <ul class="info"><li><small>所在地</small>${esc(h.addr || h.city)}（${esc(h.region)}）</li>${h.phone ? `<li><small>電話</small><a href="tel:${esc(h.phone)}">${esc(h.phone)}</a></li>` : ''}</ul>
      <div id="map" class="mini"></div>
      <h2 class="sec-head">空室・料金を確認する</h2>
      ${h.website ? `<a class="btn" target="_blank" rel="noopener" href="${esc(h.website)}">${I('ext', 18)}公式サイト</a>` : ''}${linksFor(h)}
      <a class="btn sub" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}">${I('map', 18)}Googleマップで場所を見る</a>
      ${near.length ? `<h2 class="sec-head">${esc(h.city)}のほかの宿</h2>${near.map(card).join('')}` : ''}${CREDIT()}</div>`, a: () => mkMap([h]) };
  },
  async fav() {
    const db = await load(), list = favs().map(id => db.hotels.find(h => h.id === id)).filter(Boolean);
    return { t: 'お気に入り', h: list.length ? `${list.map(card).join('')}<a class="btn sub" href="#/map?fav=1">${I('map', 18)}地図で見る</a>` : empty('お気に入りはまだありません', '宿の ♡ をタップすると保存できます') };
  },
};

const TABS = [['', 'search', 'さがす'], ['map', 'map', '地図'], ['fav', 'heart', 'お気に入り']];
const nav = cur => `<nav>${TABS.map(([k, ic, t]) => `<a class="${k === cur ? 'on' : ''}" href="#/${k}">${I(ic, 22)}${t}</a>`).join('')}</nav>`;
const PARENT = { list: '', filter: '', hotel: '' };

async function render() {
  const [path, qs = ''] = location.hash.slice(2).split('?');
  const [name = '', arg] = path.split('/');
  const q = Object.fromEntries(new URLSearchParams(qs));
  try {
    if (name === 'map' && q.fav) { await load(); const f = favs(); return showMap(DB.hotels.filter(h => f.includes(h.id))); }
    const v = await (V[name] || V[''])({ id: arg, q });
    const root = TABS.some(([k]) => k === name), y = scrollY;
    $('#app').innerHTML = (v.t ? `<header>${root ? '<span class="hsp"></span>' : `<button class="back" onclick="history.length>1?history.back():go('')" aria-label="戻る">${I('back')}</button>`}<h2>${esc(v.t)}</h2><span class="hsp"></span></header>` : '')
      + `<main class="${v.cls || ''}">${v.h}</main>${nav(PARENT[name] ?? name)}`;
    v.a?.(); scrollTo(0, v.keepScroll ? y : 0);
  } catch (e) { $('#app').innerHTML = `<main>${empty('読み込みに失敗しました', esc(e.message))}<a class="btn" href="#/">トップへ</a></main>${nav('')}`; }
}
function showMap(list) {
  $('#app').innerHTML = `<header><button class="back" onclick="history.back()">${I('back')}</button><h2>お気に入りの地図</h2><span class="hsp"></span></header><main class="p0"><div class="mapsum">${list.length}軒</div><div id="map" class="full"></div></main>${nav('fav')}`;
  mkMap(list);
}
addEventListener('hashchange', render);
render();
