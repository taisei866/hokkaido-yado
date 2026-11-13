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

// ===== なまらくん（マスコット） =====
const kun = (m = 'normal', s = 64) => {
  const ink = '#2B2B2B';
  const eyes = m === 'happy' ? `<path d="M15.5 26.5q2.5-3 5 0M23.5 26.5q2.5-3 5 0" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    : m === 'sleep' ? `<path d="M15.5 26h5M23.5 26h5" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`
    : `<circle cx="18" cy="26" r="1.9" fill="${ink}"/><circle cx="26" cy="26" r="1.9" fill="${ink}"/>`;
  const mouth = m === 'wow' ? `<ellipse cx="22" cy="30.3" rx="1.9" ry="2.3" fill="${ink}"/>` : m === 'happy' ? `<path d="M18.5 28.8Q22 33.2 25.5 28.8Z" fill="${ink}"/>`
    : `<path d="M19 29Q22 31 25 29" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
  return `<svg class="kun ${m}" width="${s}" height="${s}" viewBox="0 0 44 44" role="img" aria-label="なまらくん"><circle cx="22" cy="22" r="20" fill="#F28C38"/><path d="M12 24L22 14L32 24V32H12Z" fill="#FFF7EC" stroke="#FFF7EC" stroke-width="1.5" stroke-linejoin="round"/><circle cx="15.3" cy="28.6" r="1.6" fill="#F7B9A0"/><circle cx="28.7" cy="28.6" r="1.6" fill="#F7B9A0"/>${eyes}${mouth}${m === 'sleep' ? '<text x="31" y="12" font-size="7" font-weight="700" fill="#8E7CC3">z</text>' : ''}</svg>`;
};
const say = (t, m = 'normal', s = 56) => `<div class="say">${kun(m, s)}<p class="bubble">${t}</p></div>`;

// ===== データ =====
let DB;
const load = async () => DB ??= await (await fetch('data/hotels.json', { cache: 'no-cache' })).json();
const SORTS = [['', 'おすすめ順'], ['onsen', '温泉の宿を先に'], ['web', '公式サイトありを先に'], ['name', '名前順']];
const filt = (list, q) => {
  const kw = (q.kw || '').trim().toLowerCase();
  const r = list.filter(h => (!q.region || h.region === q.region) && (!q.city || h.city === q.city) && (!q.kind || q.kind.split(',').includes(h.kind))
    && (!q.onsen || h.onsen) && (!q.web || h.website) && (!kw || `${h.name} ${h.city} ${h.addr || ''}`.toLowerCase().includes(kw)));
  // おすすめ順：情報が多い宿（公式サイト・電話・住所あり）を上に
  const score = h => (h.website ? 2 : 0) + (h.phone ? 1 : 0) + (h.addr ? 1 : 0) + (h.onsen ? 1 : 0);
  if (q.sort === 'onsen') r.sort((a, b) => b.onsen - a.onsen);
  else if (q.sort === 'web') r.sort((a, b) => !!b.website - !!a.website);
  else if (q.sort === 'name') r.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  else r.sort((a, b) => score(b) - score(a));
  return r;
};
const count = (q, patch) => filt(DB.hotels, { ...q, ...patch }).length;
const favs = () => LS.get('fav') || [];
window.toggleFav = (id, ev) => {
  ev?.stopPropagation();
  const f = favs(), i = f.indexOf(id);
  i >= 0 ? f.splice(i, 1) : f.unshift(id);
  LS.set('fav', f); toast(i >= 0 ? 'しおりから外したよ' : 'しおりに入れたよ！なまらいいね'); render();
};
const isPC = () => matchMedia('(min-width: 960px)').matches;

// ===== 部品 =====
const empty = (t, p, m = 'wow') => `<div class="empty">${kun(m, 84)}<b>${t}</b><p>${p}</p></div>`;
const heart = id => `<button class="heart ${favs().includes(id) ? 'on' : ''}" onclick="toggleFav('${id}', event)" aria-label="お気に入り">${I('heart')}</button>`;
const kindTag = h => `<span class="tag" style="background:color-mix(in srgb,${KINDS[h.kind][2]} 14%,#fff);color:${KINDS[h.kind][2]}">${KINDS[h.kind][0]}</span>`;
const tags = h => `${kindTag(h)}${h.onsen ? '<span class="tag m-bd">♨️ 温泉</span>' : ''}${h.website ? '<span class="tag">公式サイトあり</span>' : ''}`;
const card = h => `<div class="card" data-id="${h.id}" onclick="go('hotel/${h.id}')" onmouseenter="hl('${h.id}',1)" onmouseleave="hl('${h.id}',0)">
  <div class="ph emo" style="--c:${KINDS[h.kind][2]}">${KINDS[h.kind][1]}</div>
  <div class="cb"><b class="nm">${esc(h.name)}</b>
    <div class="meta">${I('pin', 12)} ${esc(h.city)}・${esc(h.region)}</div>
    <div class="tags">${tags(h)}</div>
    ${h.addr ? `<div class="addr">${esc(h.addr)}</div>` : ''}${miniOut(h)}</div>
  ${heart(h.id)}${stays().includes(h.id) ? '<span class="stayed">泊まった</span>' : ''}</div>`;
// ===== 予約サイト（アフィリエイト） =====
const PARTNERS = window.PARTNERS || [];
const outUrl = (l, h) => { const q = encodeURIComponent(`${h.name} ${h.city}`); let u = l.url.replace('{q}', q).replace('{sj}', h.sj || q); if (l.wrap) u = l.wrap.replace('{url}', encodeURIComponent(u)); return u; };
const isPR = l => !!(l.wrap || l.pr);
window.trackOut = (pid, hid) => { const c = LS.get('clicks') || {}; c[pid] = (c[pid] || 0) + 1; LS.set('clicks', c); window.gtag?.('event', 'affiliate_click', { partner: pid, hotel_id: hid }); };
const outBtn = (l, h) => `<a class="ota" style="--b:${l.color || '#495057'}" target="_blank" rel="noopener sponsored nofollow" href="${esc(outUrl(l, h))}" onclick="event.stopPropagation();trackOut('${l.id}','${h.id}')"><span><b>${esc(l.name)}</b><small>${esc(l.note || '空室・料金を見る')}</small></span>${isPR(l) ? '<i>PR</i>' : ''}${I('ext', 16)}</a>`;
const otaBox = h => `<div class="otas">${PARTNERS.map(l => outBtn(l, h)).join('')}</div>${PARTNERS.some(isPR) ? '<p class="prnote">※「PR」表示のリンクは広告（アフィリエイト）です。予約・料金は各サイトでご確認ください。</p>' : ''}`;
const PRIMARY = () => PARTNERS.find(p => p.primary) || PARTNERS[0];
const miniOut = h => { const l = PRIMARY(); return l ? `<a class="miniota" target="_blank" rel="noopener sponsored nofollow" href="${esc(outUrl(l, h))}" onclick="event.stopPropagation();trackOut('${l.id}','${h.id}')">${esc(l.name)}で空室を見る ›${isPR(l) ? '<i>PR</i>' : ''}</a>` : ''; };
if (window.GA_ID) { const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${window.GA_ID}`; document.head.append(s); window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', window.GA_ID); }

// ===== 制覇マップ（泊まった宿） =====
const stays = () => LS.get('stay') || [];
window.toggleStay = id => { const s = stays(), i = s.indexOf(id); i >= 0 ? s.splice(i, 1) : s.push(id); LS.set('stay', s); toast(i >= 0 ? '「泊まった」を取り消したよ' : '🎉 なまらすごい！スタンプ押したよ'); render(); };

const crumb = (q, last) => `<nav class="crumb"><a href="#/list">北海道</a>${q.region ? ` › <a href="#/list?${qstr({ region: q.region })}">${esc(q.region)}</a>` : ''}${q.city ? ` › <a href="#/list?${qstr({ region: q.region, city: q.city })}">${esc(q.city)}</a>` : ''}${last ? ` › <span>${esc(last)}</span>` : ''}</nav>`;
const CREDIT = () => `<footer class="credit"><div class="bye">${kun('happy', 30)}<span>したっけね〜！また来てね</span></div>宿データ：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>（ODbL）${DB?.updated ? `｜更新 ${esc(DB.updated)}` : ''}
  <p>掲載情報は地図データに基づくもので、営業状況・料金は各予約サイト・公式サイトでご確認ください。当サイトのリンクには広告（PR）が含まれる場合があります。</p>
  ${DB?.updated === 'sample' ? '<p><b>サンプルデータを表示中です（GitHub Actionsで「宿データ更新」を実行すると実データに切り替わります）</b></p>' : ''}</footer>`;
const activeChips = q => [q.region, q.city, ...(q.kind ? q.kind.split(',').map(k => KINDS[k]?.[0]) : []), q.onsen && '温泉', q.web && '公式サイトあり', q.kw && `「${q.kw}」`].filter(Boolean);
const citiesOf = region => [...new Set(DB.hotels.filter(h => !region || h.region === region).map(h => h.city))].sort((a, b) => a.localeCompare(b, 'ja'));

// 絞り込みフォーム（PCは左サイドで即時反映、スマホは専用画面）
const filterForm = (q, live) => {
  const kinds = (q.kind || '').split(',');
  const on = live ? 'onchange="doFilter(this.form)"' : '';
  return `<form class="fform" onsubmit="doFilter(this);return false">
    <h3>キーワード</h3><input name="kw" value="${esc(q.kw)}" placeholder="宿名・住所など" ${live ? 'onchange="doFilter(this.form)"' : ''}>
    <h3>地域</h3><select name="region" ${live ? on : 'onchange="onRegion(this)"'}><option value="">すべて（${count(q, { region: '', city: '' }).toLocaleString()}）</option>${DB.regions.map(r => `<option value="${r}" ${r === q.region ? 'selected' : ''}>${r}（${count(q, { region: r, city: '' })}）</option>`).join('')}</select>
    <h3>市町村</h3><select name="city" id="city" ${on}><option value="">すべて</option>${citiesOf(q.region).map(c => `<option ${c === q.city ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
    <h3>宿の種類</h3><div class="checks">${Object.entries(KINDS).map(([k, [t, e]]) => `<label><input type="checkbox" name="kind" value="${k}" ${kinds.includes(k) ? 'checked' : ''} ${on}><span>${e} ${t}</span><small>${count(q, { kind: k })}</small></label>`).join('')}</div>
    <h3>こだわり</h3><div class="checks"><label><input type="checkbox" name="onsen" value="1" ${q.onsen ? 'checked' : ''} ${on}><span>♨️ 温泉地の宿</span><small>${count(q, { onsen: '1' })}</small></label>
      <label><input type="checkbox" name="web" value="1" ${q.web ? 'checked' : ''} ${on}><span>公式サイトあり</span><small>${count(q, { web: '1' })}</small></label></div>
    <input type="hidden" name="sort" value="${esc(q.sort)}">
    ${live ? `<a class="clear" href="#/list">条件をすべてクリア</a>` : `<div class="sticky-bottom"><a class="btn sub" href="#/filter">クリア</a><button class="btn">${I('search', 18)}この条件で表示</button></div>`}</form>`;
};

// 地図：MapLibre GL ＋ OpenFreeMap（無料・キー不要のベクター地図）
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
let MAP;
const popHtml = h => `<div class="pop"><span class="pe" style="--c:${KINDS[h.kind][2]}">${KINDS[h.kind][1]}</span><b>${esc(h.name)}</b><small>${KINDS[h.kind][0]}・${esc(h.city)}${h.onsen ? '・♨️温泉' : ''}</small><a href="#/hotel/${h.id}">詳細を見る →</a></div>`;
const mapFail = el => (el.innerHTML = '<p class="muted" style="padding:40px;text-align:center">地図を読み込めませんでした。再読み込みしてください。</p>');
function newMap(el, opts = {}) {
  MAP?.remove?.();
  MAP = new maplibregl.Map({ container: el, style: MAP_STYLE, center: [142.8, 43.4], zoom: 5.3, attributionControl: { compact: true }, ...opts });
  MAP.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  return MAP;
}
function mkMap(list, focus) {
  const el = $('#map'); if (!el) return;
  if (!window.maplibregl) return mapFail(el);
  const m = newMap(el, { cooperativeGestures: !isPC() && !el.classList.contains('full') });
  const byId = Object.fromEntries(list.map(h => [h.id, h]));
  const data = { type: 'FeatureCollection', features: list.map(h => ({ type: 'Feature', properties: { id: h.id, color: KINDS[h.kind][2] }, geometry: { type: 'Point', coordinates: [h.lng, h.lat] } })) };
  m.on('load', () => {
    m.addSource('h', { type: 'geojson', data, cluster: list.length > 25, clusterRadius: 48, clusterMaxZoom: 11, promoteId: 'id' });
    m.addLayer({ id: 'cl', type: 'circle', source: 'h', filter: ['has', 'point_count'], paint: { 'circle-color': '#8E7CC3', 'circle-opacity': 0.9, 'circle-radius': ['step', ['get', 'point_count'], 17, 20, 23, 100, 31], 'circle-stroke-width': 4, 'circle-stroke-color': 'rgba(255,255,255,.85)' } });
    m.addLayer({ id: 'cn', type: 'symbol', source: 'h', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-allow-overlap': true }, paint: { 'text-color': '#fff' } });
    m.addLayer({ id: 'pt', type: 'circle', source: 'h', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': ['get', 'color'], 'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 13, 8],
      'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 4, 2.5], 'circle-stroke-color': '#fff' } });
    m.on('click', 'cl', async e => { const f = e.features[0]; const z = await m.getSource('h').getClusterExpansionZoom(f.properties.cluster_id); m.easeTo({ center: f.geometry.coordinates, zoom: z + 0.5 }); });
    m.on('click', 'pt', e => { const f = e.features[0]; new maplibregl.Popup({ offset: 14, maxWidth: '260px' }).setLngLat(f.geometry.coordinates).setHTML(popHtml(byId[f.properties.id])).addTo(m); });
    ['cl', 'pt'].forEach(l => { m.on('mouseenter', l, () => (m.getCanvas().style.cursor = 'pointer')); m.on('mouseleave', l, () => (m.getCanvas().style.cursor = '')); });
    if (focus) hl(focus.id, 1);
  });
  if (focus) m.jumpTo({ center: [focus.lng, focus.lat], zoom: 14 });
  else if (list.length > 1) { const b = new maplibregl.LngLatBounds(); list.forEach(h => b.extend([h.lng, h.lat])); m.fitBounds(b, { padding: 48, maxZoom: 14, duration: 0 }); }
  else if (list.length) m.jumpTo({ center: [list[0].lng, list[0].lat], zoom: 14 });
}
// トップ：北海道の地図に地域の泡を並べる
function mkRegionMap(db) {
  const el = $('#rmap'); if (!el) return;
  if (!window.maplibregl) return mapFail(el);
  const m = newMap(el, { zoom: isPC() ? 5.9 : 5.1, center: [142.9, 43.45], scrollZoom: false, cooperativeGestures: !isPC() });
  db.regions.forEach(r => {
    const hs = db.hotels.filter(h => h.region === r); if (!hs.length) return;
    const lat = hs.reduce((s, h) => s + h.lat, 0) / hs.length, lng = hs.reduce((s, h) => s + h.lng, 0) / hs.length;
    const a = document.createElement('a'); a.className = 'rbub'; a.href = '#/list?' + qstr({ region: r });
    a.innerHTML = `<span>${REGION_EMOJI[r] || '📍'}</span><b>${esc(r.split('・')[0])}</b><small>${hs.length}</small>`; a.title = r;
    new maplibregl.Marker({ element: a }).setLngLat([lng, lat]).addTo(m);
  });
}
window.hl = (id, on) => { try { if (MAP?.getSource('h')) MAP.setFeatureState({ source: 'h', id }, { hover: !!on }); } catch {} };

// 宿ガチャ
window.gacha = async enc => {
  await load();
  const q = Object.fromEntries(new URLSearchParams(decodeURIComponent(enc || ''))), list = filt(DB.hotels, q);
  if (!list.length) return toast('対象の宿がありません');
  document.querySelector('.gacha')?.remove();
  const ov = document.createElement('div'); ov.className = 'gacha';
  ov.innerHTML = `<div class="gbox"><div class="gkun">${kun('wow', 76)}<p class="bubble">まわすよ〜！</p></div><p class="glbl">🎲 宿ガチャ${list.length < DB.hotels.length ? `（今の条件の${list.length}軒から）` : ''}</p><div class="gname">…</div><div class="gres"></div><button class="gx" aria-label="閉じる">×</button></div>`;
  document.body.append(ov);
  const close = () => ov.remove(); ov.onclick = e => { if (e.target === ov || e.target.classList.contains('gx')) close(); };
  const nm = ov.querySelector('.gname'), pick = () => list[Math.floor(Math.random() * list.length)];
  let i = 0;
  const t = setInterval(() => {
    nm.textContent = pick().name;
    if (++i < 16) return;
    clearInterval(t); const h = pick(); nm.textContent = h.name; nm.classList.add('done');
    ov.querySelector('.gkun').innerHTML = `${kun('happy', 76)}<p class="bubble">${['ここ、なまらいいっしょ！', 'これ当たりだべさ！', 'ここで決まりっしょ！'][Math.floor(Math.random() * 3)]}</p>`;
    ov.querySelector('.gres').innerHTML = `<div class="gmeta">${KINDS[h.kind][1]} ${KINDS[h.kind][0]}・${esc(h.city)}${h.onsen ? '・♨️温泉' : ''}</div>
      <a class="btn" href="#/hotel/${h.id}">この宿を見てみる</a>${PRIMARY() ? outBtn(PRIMARY(), h) : ''}
      <div class="grow"><button class="btn sub" onclick="gacha('${enc || ''}')">🎲 もう一回</button><a class="btn sub" target="_blank" rel="noopener" href="${xShare(`宿ガチャで「${h.name}」（${h.city}）が出た！次の北海道旅行はここかも🎲`, `${location.origin}${location.pathname}#/hotel/${h.id}`)}">𝕏 シェア</a></div>`;
    ov.querySelector('.gres a').onclick = close;
  }, 60 + i * 4);
};

const xShare = (text, url) => `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent('なまらやど')}`;
// 旅のしおり：URLで共有
window.shareFav = async () => {
  const url = `${location.origin}${location.pathname}#/fav?ids=${favs().join(',')}`;
  try { if (navigator.share) await navigator.share({ title: 'なまらやど 旅のしおり', url }); else { await navigator.clipboard.writeText(url); toast('共有リンクをコピーしました'); } } catch {}
};
window.importFav = ids => { const f = favs(); ids.split(',').forEach(i => !f.includes(i) && f.push(i)); LS.set('fav', f); toast('自分のしおりに追加しました'); go('fav'); };

// 距離の目安（直線）
const SPOTS = [['札幌駅', 43.0687, 141.3508], ['新千歳空港', 42.7752, 141.6923]];
const km = (a, b) => { const t = Math.PI / 180, x = Math.sin((b[0] - a[0]) * t / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin((b[1] - a[1]) * t / 2) ** 2; return Math.round(12742 * Math.asin(Math.sqrt(x))); };
const MOODS = [['♨️', '温泉でととのう', '湯けむりの宿だけ', { onsen: 1 }], ['🏯', '和の宿でのんびり', '旅館に絞って', { kind: 'ryokan' }], ['🎒', 'ひとり旅・身軽に', 'ゲストハウス・民宿', { kind: 'hostel,guest' }],
  ['🏙️', '街を拠点に遊ぶ', '札幌のホテル', { region: '札幌・定山渓', kind: 'hotel' }], ['⛷️', '雪山へ', 'ニセコ・小樽方面', { region: '小樽・ニセコ・積丹' }], ['🦌', '道東の大自然', '釧路・阿寒・根室', { region: '釧路・阿寒・根室' }]];

// ===== 操作 =====
window.doSearch = f => { const fd = new FormData(f); go('list?' + qstr({ kw: fd.get('kw'), region: fd.get('region'), kind: fd.get('kind') })); };
window.doFilter = f => { const fd = new FormData(f); go('list?' + qstr({ region: fd.get('region'), city: fd.get('city'), kind: fd.getAll('kind').join(','), onsen: fd.get('onsen'), web: fd.get('web'), kw: fd.get('kw'), sort: fd.get('sort') })); };
window.onRegion = sel => { $('#city').innerHTML = `<option value="">すべて</option>${citiesOf(sel.value).map(c => `<option>${esc(c)}</option>`).join('')}`; };
window.setSort = v => { const q = Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || '')); go('list?' + qstr({ ...q, sort: v, lim: '' })); };

// ===== 画面 =====
const V = {
  async ''() {
    const db = await load(), m = new Date().getMonth() + 1, snow = m >= 11 || m <= 3;
    return { cls: 'home', h: `<div class="hero ${snow ? 'snow' : ''}"><div class="hero-in"><div class="hero-top"><div><p class="brand">なまらやど</p><h1>北海道の宿を、<br>なまら楽しく探そう。</h1></div>
      <div class="hero-kun"><p class="bubble">今夜どこ泊まるっしょ？<br>ぼくが手伝うよ！</p>${kun('happy', 110)}</div></div>
      <p class="lead">北海道全域 ${db.hotels.length.toLocaleString()}軒のホテル・旅館・民宿から、エリアと気分で探せます。</p>
      <form class="sform" onsubmit="doSearch(this);return false">
        <label class="kw">キーワード<input name="kw" placeholder="宿名・市町村（例：洞爺湖、すすきの）"></label>
        <label>地域<select name="region"><option value="">北海道全域</option>${db.regions.map(r => `<option>${r}</option>`).join('')}</select></label>
        <label>種類<select name="kind"><option value="">すべて</option>${Object.entries(KINDS).map(([k, [t]]) => `<option value="${k}">${t}</option>`).join('')}</select></label>
        <button class="btn">${I('search', 18)}探す</button></form>
      <div class="hbtns"><a class="gbtn" href="#/shindan">🔮 30秒 宿タイプ診断</a><button class="gbtn" onclick="gacha()">🎲 迷ったら宿ガチャ</button></div></div></div>
      <div class="wrap"><section><div class="sec-head"><h2>地図から選ぶ</h2><span class="muted">泡をタップするとその地域の宿へ</span></div><div id="rmap"></div></section>
      <section><h2>気分で探す</h2><div class="moods">${MOODS.map(([e, t, s, q]) => `<a class="mood" href="#/list?${qstr(q)}"><span>${e}</span><b>${t}</b><small>${s}・${count({}, q)}軒</small></a>`).join('')}</div></section>
      <section><h2>地域の一覧</h2><div class="rgrid">${db.regions.map(r => `<a class="rtile" href="#/list?${qstr({ region: r })}"><span>${REGION_EMOJI[r] || '📍'}</span><b>${r}</b><small>${db.hotels.filter(h => h.region === r).length}軒</small></a>`).join('')}</div></section>
      ${CREDIT()}</div>`, a: () => mkRegionMap(db) };
  },
  async list({ q }) {
    const db = await load(), list = filt(db.hotels, q), lim = +q.lim || PAGE, act = activeChips(q);
    return { t: q.city || q.region || '検索結果', cls: 'wide', keepScroll: !!q.lim, h: `${crumb(q)}
      <div class="listwrap"><aside class="side">${filterForm(q, true)}</aside>
      <div class="results"><div class="toolbar"><span class="count"><b>${list.length.toLocaleString()}</b>軒</span>
        <select class="sort" onchange="setSort(this.value)" aria-label="並び順">${SORTS.map(([v, t]) => `<option value="${v}" ${v === (q.sort || '') ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <button class="tbtn" onclick="gacha('${encodeURIComponent(qstr(q))}')">🎲<span class="pcl"> ガチャ</span></button><a class="tbtn sp" href="#/filter?${qstr(q)}">${I('filter', 16)}絞り込み</a><a class="tbtn sp" href="#/map?${qstr({ ...q, lim: '' })}">${I('map', 16)}地図</a></div>
      ${act.length ? `<div class="chips small">${act.map(a => `<span class="chip on">${esc(a)}</span>`).join('')}<a class="chip" href="#/list">クリア</a></div>` : ''}
      ${list.slice(0, lim).map(card).join('') || empty('条件に合う宿がありません', '条件を減らして探してみてください')}
      ${list.length > lim ? `<a class="btn sub" href="#/list?${qstr({ ...q, lim: lim + PAGE })}">もっと見る（残り${(list.length - lim).toLocaleString()}軒）</a>` : ''}${CREDIT()}</div>
      <div class="mapcol"><div id="map"></div></div></div>`, a: () => isPC() && mkMap(list) };
  },
  async filter({ q }) { await load(); return { t: '絞り込み', h: filterForm(q, false) }; },
  async map({ q }) {
    const db = await load(), list = q.fav ? db.hotels.filter(h => favs().includes(h.id)) : filt(db.hotels, q);
    return { t: q.fav ? 'お気に入りの地図' : '地図', cls: 'p0', h: `<div class="mapsum">${q.fav ? 'お気に入り' : activeChips(q).map(esc).join('・') || '北海道全域'}｜${list.length.toLocaleString()}軒（ピンの色＝宿の種類）</div><div id="map" class="full"></div>
      ${q.fav ? '' : `<a class="fab" href="#/list?${qstr(q)}">${I('list', 18)}一覧で見る</a>`}`, a: () => mkMap(list) };
  },
  async hotel({ id }) {
    const db = await load(), h = db.hotels.find(x => x.id === id);
    if (!h) return { t: '宿の詳細', h: empty('宿が見つかりません', 'データ更新で掲載が終了した可能性があります') };
    const near = db.hotels.filter(x => x.id !== h.id && x.city === h.city).slice(0, 6);
    return { t: '宿の詳細', cls: 'wide', h: `${crumb(h, h.name)}<div class="dgrid"><div class="dmain">
      <div class="dhero emo" style="--c:${KINDS[h.kind][2]}">${KINDS[h.kind][1]}</div>
      <div class="sheet"><div class="tags">${tags(h)}</div>
      <div class="drate"><h1 class="dname">${esc(h.name)}</h1>${heart(h.id)}</div>
      <ul class="info"><li><small>所在地</small>${esc(h.addr || h.city)}（${esc(h.region)}）</li>${h.phone ? `<li><small>電話</small><a href="tel:${esc(h.phone)}">${esc(h.phone)}</a></li>` : ''}<li><small>種類</small>${KINDS[h.kind][0]}</li>
        <li><small>距離の目安（直線）</small>${SPOTS.map(([n, la, ln]) => `${n}から約${km([la, ln], [h.lat, h.lng])}km`).join('・')}</li></ul>
      <div id="map" class="mini"></div></div></div>
      <aside class="cta" id="cmp"><h2>💴 空室・料金をまとめて比較</h2><p class="muted">同じ宿でも、サイトによって料金やポイントが違うことがあります。</p>
        ${otaBox(h)}${h.website ? `<a class="btn sub" target="_blank" rel="noopener" href="${esc(h.website)}">${I('ext', 18)}公式サイトで見る</a>` : ''}
        <div class="grow"><button class="btn sub" onclick="toggleFav('${h.id}')">${favs().includes(h.id) ? '♥ しおり済み' : '♡ しおりに入れる'}</button><button class="btn sub ${stays().includes(h.id) ? 'on' : ''}" onclick="toggleStay('${h.id}')">${stays().includes(h.id) ? '✅ 泊まった' : '🏁 泊まった！'}</button></div>
        <a class="btn sub" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}">${I('map', 18)}Googleマップで場所を見る</a></aside></div>
      ${near.length ? `<section><h2>${esc(h.city)}のほかの宿</h2><div class="cgrid">${near.map(card).join('')}</div></section>` : ''}${CREDIT()}<div class="stickycta"><div><b>${esc(h.name)}</b><small>空室・料金を予約サイトで比較</small></div><button class="btn" onclick="document.getElementById('cmp').scrollIntoView({behavior:'smooth'})">料金を見る</button></div>`, a: () => mkMap([h, ...near], h) };
  },
  async shindan({ q }) {
    await load();
    const a = q.a ? q.a.split(',').map(Number) : [];
    if (a.length < QS.length) {
      const [qt, opts] = QS[a.length];
      return { t: '宿タイプ診断', h: `<div class="quiz">${a.length ? '' : say('ぼくが、あなたにぴったりの宿を当ててみせるよ！', 'happy')}<p class="qstep">Q${a.length + 1} / ${QS.length}</p><div class="qbar"><i style="width:${a.length / QS.length * 100}%"></i></div>
        <h1>${qt}</h1><div class="qopts">${opts.map((o, i) => `<a class="qopt" href="#/shindan?a=${[...a, i].join(',')}">${o}</a>`).join('')}</div>
        ${a.length ? `<a class="muted" href="#/shindan${a.length > 1 ? '?a=' + a.slice(0, -1).join(',') : ''}">‹ ひとつ前に戻る</a>` : ''}</div>` };
    }
    const r = typeOf(a), list = filt(DB.hotels, r.q).slice(0, 4), more = qstr(r.q);
    return { t: '診断結果', h: `<div class="quiz result">${say('診断結果が出たよ！なまら当たってるっしょ？', 'happy')}<p class="qstep">あなたの宿タイプは…</p><div class="rtype"><span>${r.e}</span><h1>${r.name}</h1><p>${r.desc}</p></div>
      <a class="btn" href="#/list?${more}">${r.name}向けの宿を見る（${count({}, r.q)}軒）</a>
      <div class="grow"><a class="btn sub" href="#/shindan">もう一度診断</a><a class="btn sub" target="_blank" rel="noopener" href="${xShare(`私の北海道の宿タイプは「${r.e}${r.name}」でした！`, location.origin + location.pathname + '#/shindan')}">𝕏 シェア</a></div></div>
      ${list.length ? `<section><h2>おすすめの宿</h2><div class="cgrid">${list.map(card).join('')}</div></section>` : ''}${CREDIT()}` };
  },
  async fav({ q }) {
    const db = await load(), ids = q.ids ? q.ids.split(',') : favs(), list = ids.map(id => db.hotels.find(h => h.id === id)).filter(Boolean);
    const shared = !!q.ids;
    return { t: '旅のしおり', cls: 'wide', h: `<div class="shead"><div><h1>📒 ${shared ? '共有された旅のしおり' : '旅のしおり'}</h1><p class="muted">${list.length}軒${shared ? '' : '・ ♡ を押した宿がここにたまります'}</p></div>
      ${list.length ? (shared ? `<button class="btn" onclick="importFav('${esc(q.ids)}')">自分のしおりに入れる</button>` : `<button class="btn sub" onclick="shareFav()">🔗 しおりを共有する</button>`) : ''}</div>
      ${list.length ? `<div class="cgrid">${list.map(card).join('')}</div><div id="map" class="mini"></div>` : empty('しおりはまだ空っぽ…', '気になる宿の ♡ を押すと、ぼくがここにしまっておくよ', 'sleep')}
      ${shared ? '' : conquest(db)}`, a: () => list.length && mkMap(list) };
  },
};

// 北海道制覇スタンプ帳
function conquest(db) {
  const st = stays().map(id => db.hotels.find(h => h.id === id)).filter(Boolean), done = new Set(st.map(h => h.region));
  return `<section class="conq"><div class="sec-head"><h2>🏁 北海道制覇スタンプ帳</h2><b class="rate">${done.size} / ${db.regions.length} 地域</b></div>
    <div class="cbar"><i style="width:${done.size / db.regions.length * 100}%"></i></div>
    <div class="stamps">${db.regions.map(r => `<a class="stamp ${done.has(r) ? 'on' : ''}" href="#/list?${qstr({ region: r })}"><span>${REGION_EMOJI[r] || '📍'}</span><small>${esc(r.split('・')[0])}</small></a>`).join('')}</div>
    <p class="muted">泊まった宿の詳細ページで「🏁 泊まった！」を押すとスタンプが押されます（${st.length}軒）。${done.size ? `<a target="_blank" rel="noopener" href="${xShare(`北海道を${done.size}/${db.regions.length}地域制覇！あと${db.regions.length - done.size}地域🏁`, location.origin + location.pathname)}">𝕏 で自慢する</a>` : ''}</p></section>`;
}
const QS = [
  ['だれと行く？', ['🧍 ひとりで', '👫 友達と', '💑 恋人・夫婦で', '👨‍👩‍👧 家族で']],
  ['一番の目的は？', ['♨️ 温泉でのんびり', '🍣 街あそび・グルメ', '🏔️ 大自然・アクティビティ', '💰 とにかく安く']],
  ['泊まるなら？', ['🏯 和の旅館', '🏨 きれいなホテル', '🏡 アットホームな民宿・ゲストハウス', '🤷 こだわらない']],
  ['冬の北海道、どう？', ['⛄ 雪を思いきり楽しみたい', '🥶 寒いのは苦手', '🙆 どちらでも']],
];
const TYPES = {
  onsen: ['♨️', '湯けむり癒やし派', '温泉街の宿で湯めぐりを楽しみ、上げ膳据え膳でゆったり過ごすのが至福のタイプ。', { region: '登別・洞爺・室蘭', onsen: '1' }],
  city: ['🏙️', '街あそびグルメ派', '昼は街歩き、夜はグルメとはしご。駅近のホテルを拠点に動き回るタイプ。', { region: '札幌・定山渓' }],
  night: ['🌉', '夜景ロマンス派', '港町の夜景と歴史ある街並みを、大切な人とゆっくり味わうタイプ。', { region: '函館・道南' }],
  snow: ['⛷️', 'パウダースノー探検派', '雪山と温泉を行き来する、冬の北海道を全力で楽しむタイプ。', { region: '小樽・ニセコ・積丹' }],
  wild: ['🦌', '大自然ワイルド派', '湿原やカルデラ湖、野生動物に会いに。景色のために遠くまで行けるタイプ。', { region: '釧路・阿寒・根室' }],
  local: ['🎒', '身軽ローカル派', 'ゲストハウスや民宿で、地元の人や旅人との出会いを楽しむタイプ。', { kind: 'hostel,guest' }],
};
const KIND_BY = ['ryokan', 'hotel', 'guest,hostel', ''];
function typeOf([who, aim, stay, winter]) {
  const k = aim === 0 ? 'onsen' : aim === 3 ? 'local' : aim === 1 ? (who === 2 ? 'night' : 'city') : (winter === 0 ? 'snow' : 'wild');
  const [e, name, desc, base] = TYPES[k], q = { ...base };
  if (k !== 'local' && KIND_BY[stay]) q.kind = KIND_BY[stay];
  if (!count({}, q)) delete q.kind; // 該当がなければ種類の条件を外す
  return { e, name, desc, q };
}
const TABS = [['', 'search', 'さがす'], ['map', 'map', '地図'], ['fav', 'heart', 'しおり']];
const nav = cur => `<nav class="bottom">${TABS.map(([k, ic, t]) => `<a class="${k === cur ? 'on' : ''}" href="#/${k}">${I(ic, 22)}${t}</a>`).join('')}</nav>`;
const topbar = cur => `<div class="topbar"><a class="logo" href="#/">${kun('normal', 34)}<span>なまらやど</span></a>
  <form class="tsearch" onsubmit="doSearch(this);return false">${I('search', 16)}<input name="kw" placeholder="宿名・市町村で検索"></form>
  <div class="tlinks">${TABS.map(([k, ic, t]) => `<a class="${k === cur ? 'on' : ''}" href="#/${k}">${I(ic, 18)}${t}${k === 'fav' && favs().length ? `<b>${favs().length}</b>` : ''}</a>`).join('')}</div></div>`;
const PARENT = { list: '', filter: '', hotel: '', shindan: '' };

async function render() {
  document.querySelector('.gacha')?.remove();
  const [path, qs = ''] = location.hash.slice(2).split('?');
  const [name = '', arg] = path.split('/');
  const q = Object.fromEntries(new URLSearchParams(qs));
  try {
    const v = await (V[name] || V[''])({ id: arg, q });
    const root = TABS.some(([k]) => k === name), y = scrollY, cur = PARENT[name] ?? name;
    $('#app').innerHTML = topbar(cur) + (v.t ? `<header>${root ? '<span class="hsp"></span>' : `<button class="back" onclick="history.length>1?history.back():go('')" aria-label="戻る">${I('back')}</button>`}<h2>${esc(v.t)}</h2><span class="hsp"></span></header>` : '')
      + `<main class="${v.cls || ''}">${v.h}</main>${nav(cur)}`;
    v.a?.(); scrollTo(0, v.keepScroll ? y : 0);
  } catch (e) { $('#app').innerHTML = `${topbar('')}<main>${empty('読み込みに失敗しました', esc(e.message))}<a class="btn" href="#/">トップへ</a></main>${nav('')}`; }
}
addEventListener('hashchange', render);
// 画面幅をまたいだら描き直す（一覧の地図の出し分け）
let wasPC = isPC(); addEventListener('resize', () => { if (isPC() !== wasPC) { wasPC = isPC(); render(); } });
render();
