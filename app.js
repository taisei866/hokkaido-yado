// ===== 共通 =====
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const go = p => (location.hash = '#/' + p);
const yen = n => n == null ? '-' : `¥${Math.round(n).toLocaleString()}`;
const ymd = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
const jpDate = s => { const d = new Date(s + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}(${'日月火水木金土'[d.getDay()]})`; };
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem('hy_' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('hy_' + k, JSON.stringify(v)); } catch {} },
};
const API = window.HOTEL_API || '', DEMO = !API;
const DEFAULTS = () => ({ in: addDays(ymd(new Date()), 7), n: '1', a: '2', r: '1' });
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 1900); };

const P = {
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  filter: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
};
const I = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;

const MEALS = [['', '指定なし'], ['none', '素泊まり'], ['b', '朝食付き'], ['d', '夕食付き'], ['bd', '2食付き']];
const CONDS = [['onsen', '温泉'], ['daiyoku', '大浴場'], ['kinen', '禁煙ルーム'], ['internet', 'ネット接続']];
const SORTS = [['standard', 'おすすめ順'], ['+roomCharge', '料金の安い順'], ['-roomCharge', '料金の高い順']];
const PRICES = [5000, 8000, 10000, 15000, 20000, 30000, 50000];
const POPULAR = ['札幌', '函館', '小樽', '富良野', '旭川', '登別', '洞爺', '定山渓', 'ニセコ', '知床', '阿寒', '帯広'];
const mealOf = p => p.breakfast && p.dinner ? 'bd' : p.breakfast ? 'b' : p.dinner ? 'd' : 'none';
const mealLabel = p => MEALS.find(([k]) => k === mealOf(p))[1];

// ===== データ（Worker経由の楽天トラベルAPI / デモ） =====
const api = async (path, params = {}) => {
  if (DEMO) return demo(path, params);
  const r = await fetch(API + path + '?' + new URLSearchParams(params));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(j.error || '検索に失敗しました');
  return j;
};
let AREAS;
const areas = async () => (AREAS ??= await api('/areas'));
const areaName = q => { const s = (AREAS || []).find(a => a.code === q.small); const d = s?.details.find(x => x.code === q.detail); return s ? (d ? `${s.name}・${d.name}` : s.name) : '北海道'; };

const toApi = q => {
  const p = { checkinDate: q.in, checkoutDate: addDays(q.in, +q.n || 1), adultNum: q.a || 2, roomNum: q.r || 1, searchPattern: 1, sort: q.sort || 'standard', page: q.page || 1, hits: 30 };
  if (q.hotel) p.hotelNo = q.hotel; else { p.smallClassCode = q.small; if (q.detail) p.detailClassCode = q.detail; }
  if (q.min) p.minCharge = q.min;
  if (q.max) p.maxCharge = q.max;
  const sq = q.cond ? q.cond.split(',') : [];
  if (q.meal === 'b' || q.meal === 'bd') sq.push('breakfast');
  if (q.meal === 'd' || q.meal === 'bd') sq.push('dinner');
  if (sq.length) p.squeezeCondition = sq.join(',');
  return p;
};
// 同じ宿をまとめ、食事条件で絞り、最安プランを先頭に
async function search(q, extra = {}) {
  const res = await api('/vacant', { ...toApi(q), ...extra });
  const m = new Map();
  res.hotels.forEach(h => { const x = m.get(h.no); x ? x.plans.push(...h.plans) : m.set(h.no, { ...h, plans: [...h.plans] }); });
  const hotels = [...m.values()].map(h => ({ ...h, plans: h.plans.filter(p => !q.meal || mealOf(p) === q.meal).sort((a, b) => a.total - b.total) })).filter(h => h.plans.length);
  return { paging: res.paging, hotels };
}
const perNight = (p, q) => p.total / (+q.n || 1) / (+q.a || 1);

const favs = () => LS.get('fav') || [];
window.toggleFav = (no, ev) => {
  ev?.stopPropagation();
  const f = favs(), i = f.findIndex(x => x.no === no);
  if (i >= 0) { f.splice(i, 1); toast('お気に入りから外しました'); }
  else { const h = (window.SEEN || {})[no]; if (h) f.unshift({ no, name: h.name, thumb: h.thumb, reviewAvg: h.reviewAvg, station: h.station, areaName: h.areaName }); toast('お気に入りに追加しました'); }
  LS.set('fav', f); render();
};
const remember = list => { window.SEEN = window.SEEN || {}; list.forEach(h => (window.SEEN[h.no] = h)); };

// ===== 部品 =====
const qstr = q => new URLSearchParams(Object.entries(q).filter(([, v]) => v !== '' && v != null));
const stars = v => v ? `<span class="rate">★${Number(v).toFixed(2)}</span>` : '<span class="rate none">★ -</span>';
const empty = (t, p) => `<div class="empty"><div>🏨</div><b>${t}</b><p>${p}</p></div>`;
const heart = no => `<button class="heart ${favs().some(x => x.no === no) ? 'on' : ''}" onclick="toggleFav(${no}, event)" aria-label="お気に入り">${I('heart')}</button>`;
const summary = q => `${esc(areaName(q))}｜${jpDate(q.in)}から${q.n}泊｜大人${q.a}名・${q.r}室`;
const opts = (list, cur) => list.map(([v, t]) => `<option value="${v}" ${String(cur ?? '') === String(v) ? 'selected' : ''}>${t}</option>`).join('');
const radios = (name, list, cur) => list.map(([v, t]) => `<label class="chip"><input type="radio" name="${name}" value="${v}" ${String(cur ?? '') === String(v) ? 'checked' : ''}>${t}</label>`).join('');
const CREDIT = `<footer class="credit"><a href="https://developers.rakuten.com/" target="_blank" rel="noopener">Supported by Rakuten Developers</a>
  <p>宿泊料金・空室状況は検索時点のものです。予約は楽天トラベルで行われます。当サイトは楽天アフィリエイトを利用しています（PR）。</p>${DEMO ? '<p><b>デモモード：表示中の宿・料金は架空のサンプルです</b></p>' : ''}</footer>`;

const card = (h, q, qs) => { const p = h.plans[0]; return `<div class="card" onclick="go('hotel/${h.no}?${qs}')">
  <div class="ph" style="background-image:url('${esc(h.thumb)}')"></div>
  <div class="cb"><b class="nm">${esc(h.name)}</b>
    <div class="meta">${stars(h.reviewAvg)}<small>(${h.reviewCount || 0})</small><span>${I('pin', 12)} ${esc(h.station || h.areaName || '')}</span></div>
    <div class="price"><small>最安</small> ${yen(p.total)}<span>1人1泊 ${yen(perNight(p, q))}</span></div>
    <div class="tags"><span class="tag m-${mealOf(p)}">${mealLabel(p)}</span><span class="tag">${h.plans.length}プラン</span></div></div>
  ${heart(h.no)}</div>`; };

function mkMap(list, q, qs) {
  if (!window.L) { $('#map').innerHTML = '<p class="muted" style="padding:40px;text-align:center">地図を読み込めませんでした。通信環境を確認して再読み込みしてください。</p>'; return; }
  const m = L.map('map', { zoomControl: false }).setView([43.2, 142.8], 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  const pts = list.filter(h => h.lat && h.lng).map(h => {
    const icon = L.divIcon({ className: '', html: `<div class="mprice">${yen(h.plans[0].total)}</div>`, iconSize: null });
    L.marker([h.lat, h.lng], { icon }).addTo(m).bindPopup(`<div class="pop"><b>${esc(h.name)}</b><small>${stars(h.reviewAvg)} ${mealLabel(h.plans[0])} ${yen(h.plans[0].total)}〜</small><a href="#/hotel/${h.no}?${qs}">詳細・プランを見る</a></div>`);
    return [h.lat, h.lng];
  });
  if (pts.length > 1) m.fitBounds(pts, { padding: [40, 40] }); else if (pts.length) m.setView(pts[0], 14);
}

// ===== 操作 =====
window.onSmall = sel => {
  const a = AREAS.find(x => x.code === sel.value), d = $('#detail');
  d.innerHTML = a?.details.length ? opts(a.details.map(x => [x.code, x.name])) : '';
  d.parentElement.style.display = a?.details.length ? '' : 'none';
};
window.doSearch = f => {
  const q = Object.fromEntries(new FormData(f));
  if (!q.small) return toast('エリアを選んでください');
  LS.set('last', q); go('list?' + qstr(q));
};
window.doFilter = (f, base) => {
  const fd = new FormData(f), q = { ...Object.fromEntries(new URLSearchParams(base)), meal: fd.get('meal'), min: fd.get('min'), max: fd.get('max'), sort: fd.get('sort'), cond: fd.getAll('cond').join(','), page: '' };
  if (q.min && q.max && +q.min >= +q.max) return toast('料金の下限は上限より小さくしてください');
  go('list?' + qstr(q));
};

// ===== 画面 =====
const V = {
  // さがす（トップ）
  async ''() {
    const all = await areas(), q = { ...DEFAULTS(), ...(LS.get('last') || {}) };
    const cur = all.find(a => a.code === q.small) || null;
    const pops = POPULAR.map(k => all.find(a => a.name.includes(k))).filter((a, i, arr) => a && arr.indexOf(a) === i);
    return { cls: 'home', h: `<div class="hero"><p class="brand">北海道やどさがし</p><h1>北海道の宿を、<br>料金とプランで探す。</h1>
      <form class="sform" onsubmit="doSearch(this);return false">
        <label>エリア<select name="small" onchange="onSmall(this)" required><option value="">エリアを選択</option>${opts(all.map(a => [a.code, a.name]), q.small)}</select></label>
        <label style="${cur?.details.length ? '' : 'display:none'}">エリア詳細<select name="detail" id="detail">${cur?.details.length ? opts(cur.details.map(x => [x.code, x.name]), q.detail) : ''}</select></label>
        <div class="row2"><label>チェックイン<input type="date" name="in" value="${q.in}" min="${ymd(new Date())}" required></label>
          <label>泊数<select name="n">${opts([1, 2, 3, 4, 5, 6, 7].map(n => [n, `${n}泊`]), q.n)}</select></label></div>
        <div class="row2"><label>大人<select name="a">${opts([1, 2, 3, 4, 5, 6].map(n => [n, `${n}名`]), q.a)}</select></label>
          <label>部屋数<select name="r">${opts([1, 2, 3].map(n => [n, `${n}室`]), q.r)}</select></label></div>
        <button class="btn">${I('search', 18)}空室を検索</button></form></div>
      <section><h2>人気のエリア</h2><div class="chips">${pops.map(a => `<a class="chip" href="#/list?${qstr({ ...DEFAULTS(), small: a.code, detail: a.details[0]?.code || '' })}">${esc(a.name)}</a>`).join('')}</div></section>
      <section class="howto"><h2>こんな探し方ができます</h2><ul><li>🍳 朝食付き・2食付き・素泊まりで絞り込み</li><li>♨️ 温泉・大浴場のある宿だけ表示</li><li>💴 1泊あたりの料金帯で絞り込み</li><li>🗺️ 地図で宿の位置と料金を一覧</li></ul></section>${CREDIT}` };
  },
  // 検索結果
  async list({ q, qs }) {
    if (!q.small && !q.hotel) return V['']();
    await areas(); LS.set('last', { small: q.small, detail: q.detail, in: q.in, n: q.n, a: q.a, r: q.r });
    const { paging, hotels } = await search(q); remember(hotels);
    const act = [MEALS.find(([k]) => k === q.meal)?.[1], q.min && `${yen(q.min)}〜`, q.max && `〜${yen(q.max)}`, ...CONDS.filter(([k]) => (q.cond || '').split(',').includes(k)).map(([, t]) => t)].filter(x => x && x !== '指定なし');
    const page = +q.page || 1, pg = n => `#/list?${qstr({ ...q, page: n })}`;
    return { t: '検索結果', h: `<div class="sum"><span>${summary(q)}</span><a href="#/" class="tbtn">${I('edit', 14)}変更</a></div>
      <div class="toolbar"><span class="count"><b>${paging.recordCount}</b>件</span><a class="tbtn" href="#/filter?${qs}">${I('filter', 16)}絞り込み</a><a class="tbtn" href="#/map?${qs}">${I('map', 16)}地図</a></div>
      ${act.length ? `<div class="chips small">${act.map(a => `<span class="chip on">${esc(a)}</span>`).join('')}</div>` : ''}
      ${hotels.map(h => card(h, q, qs)).join('') || empty('条件に合う空室がありません', '日程や条件を変えて探してみてください')}
      ${paging.pageCount > 1 ? `<div class="pager">${page > 1 ? `<a class="tbtn" href="${pg(page - 1)}">‹ 前へ</a>` : '<span></span>'}<span>${page} / ${paging.pageCount}</span>${page < paging.pageCount ? `<a class="tbtn" href="${pg(page + 1)}">次へ ›</a>` : '<span></span>'}</div>` : ''}${CREDIT}` };
  },
  // 絞り込み
  filter: ({ q, qs }) => ({ t: '絞り込み', h: `<form class="fform" onsubmit="doFilter(this,'${qs}');return false">
    <h3>食事</h3><div class="chips">${radios('meal', MEALS, q.meal || '')}</div>
    <h3>料金（1泊あたり）</h3><div class="row2"><select name="min">${opts([['', '下限なし'], ...PRICES.map(v => [v, `${yen(v)}〜`])], q.min)}</select><select name="max">${opts([['', '上限なし'], ...PRICES.map(v => [v, `〜${yen(v)}`])], q.max)}</select></div>
    <h3>こだわり</h3><div class="chips">${CONDS.map(([k, t]) => `<label class="chip"><input type="checkbox" name="cond" value="${k}" ${(q.cond || '').split(',').includes(k) ? 'checked' : ''}>${t}</label>`).join('')}</div>
    <h3>並び順</h3><div class="chips">${radios('sort', SORTS, q.sort || 'standard')}</div>
    <div class="sticky-bottom"><a class="btn sub" href="#/list?${qstr({ small: q.small, detail: q.detail, in: q.in, n: q.n, a: q.a, r: q.r })}">クリア</a><button class="btn">${I('search', 18)}この条件で表示</button></div></form>` }),
  // 地図
  async map({ q, qs }) {
    if (!q.small) { const l = LS.get('last'); if (l?.small) return go('map?' + qstr(l)); return { t: '地図', h: empty('まずエリアを選んで検索してください', '検索した宿を地図で表示します') + '<a class="btn" href="#/">宿をさがす</a>' }; }
    await areas(); const { hotels } = await search(q); remember(hotels);
    return { t: '地図', cls: 'p0', h: `<div class="mapsum">${summary(q)}</div><div id="map" class="full"></div><a class="fab" href="#/list?${qs}">${I('list', 18)}一覧で見る（${hotels.length}件）</a>`, a: () => mkMap(hotels, q, qs) };
  },
  // 宿の詳細・プラン一覧
  async hotel({ id, q, qs }) {
    if (!q.in) return go(`hotel/${id}?${qstr({ ...DEFAULTS(), ...(LS.get('last') || {}), hotel: '' })}`);
    await areas();
    const { hotels } = await search({ ...q, hotel: id }, { sort: '+roomCharge', page: 1 }); remember(hotels);
    const h = hotels[0], f = favs().find(x => x.no === id);
    if (!h) return { t: '宿の詳細', h: `<h1>${esc(f?.name || '宿の詳細')}</h1><div class="sum"><span>${jpDate(q.in)}から${q.n}泊｜大人${q.a}名・${q.r}室</span><a href="#/" class="tbtn">${I('edit', 14)}変更</a></div>${empty('この日程・条件では空室がありません', '日程を変えるか、絞り込み条件を外してみてください')}` };
    return { t: '宿の詳細', h: `<div class="dhero" style="background-image:url('${esc(h.image || h.thumb)}')"></div><div class="sheet">
      <h1 class="dname">${esc(h.name)}</h1>
      <div class="drate">${stars(h.reviewAvg)}<small>口コミ${h.reviewCount || 0}件</small>${heart(h.no)}</div>
      ${h.special ? `<p class="memo">${esc(h.special)}</p>` : ''}
      <ul class="info"><li><small>住所</small>${esc(h.address)}</li>${h.access ? `<li><small>アクセス</small>${esc(h.access)}</li>` : ''}
        ${h.checkin ? `<li><small>チェックイン／アウト</small>${esc(h.checkin)} ／ ${esc(h.checkout)}</li>` : ''}${h.parking ? `<li><small>駐車場</small>${esc(h.parking)}</li>` : ''}</ul>
      <div class="links"><a class="tbtn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}">${I('map', 14)}地図</a>${h.infoUrl ? `<a class="tbtn" target="_blank" rel="noopener" href="${esc(h.infoUrl)}">${I('ext', 14)}施設情報・口コミ</a>` : ''}</div>
      <div class="sec-head"><h2>空室のあるプラン（${h.plans.length}件）</h2></div>
      <div class="sum"><span>${jpDate(q.in)}から${q.n}泊｜大人${q.a}名・${q.r}室</span><a href="#/filter?${qstr({ ...q, small: q.small || '' })}" class="tbtn">${I('filter', 14)}条件</a></div>
      ${h.plans.map(p => `<div class="plan"><div class="ptop"><span class="tag m-${mealOf(p)}">${mealLabel(p)}</span>${p.point > 1 ? `<span class="tag">ポイント${p.point}%</span>` : ''}</div>
        <b>${esc(p.name)}</b><small>${esc(p.room)}</small>
        <div class="pbottom"><div><span class="total">${yen(p.total)}</span><small>合計（税込）・1人1泊 ${yen(perNight(p, q))}</small></div>
        <a class="btn" target="_blank" rel="noopener sponsored" href="${esc(p.url)}">予約へ</a></div></div>`).join('')}
      ${CREDIT}</div>` };
  },
  // お気に入り
  fav: () => {
    const f = favs(), qs = qstr({ ...DEFAULTS(), ...(LS.get('last') || {}) });
    return { t: 'お気に入り', h: f.length ? f.map(h => `<div class="card" onclick="go('hotel/${h.no}?${qs}')"><div class="ph" style="background-image:url('${esc(h.thumb)}')"></div>
      <div class="cb"><b class="nm">${esc(h.name)}</b><div class="meta">${stars(h.reviewAvg)}<span>${esc(h.station || h.areaName || '')}</span></div><small class="muted">タップで最新の空室・料金を確認</small></div>${heart(h.no)}</div>`).join('')
      : empty('お気に入りはまだありません', '宿の ♡ をタップすると保存できます') };
  },
};

const TABS = [['', 'search', 'さがす'], ['map', 'map', '地図'], ['fav', 'heart', 'お気に入り']];
const nav = cur => `<nav>${TABS.map(([k, ic, t]) => `<a class="${k === cur ? 'on' : ''}" href="#/${k}">${I(ic, 22)}${t}</a>`).join('')}</nav>`;
const PARENT = { list: '', filter: '', hotel: '' };

async function render() {
  const [path, qs = ''] = location.hash.slice(2).split('?');
  const [name = '', arg] = path.split('/');
  const q = { ...Object.fromEntries(new URLSearchParams(qs)) };
  $('#app').innerHTML = `<main><div class="loading">読み込み中…</div></main>${nav(PARENT[name] ?? name)}`;
  try {
    const v = await (V[name] || V[''])({ id: Number(arg), q, qs });
    if (!v) return;
    const root = TABS.some(([k]) => k === name);
    $('#app').innerHTML = (v.t ? `<header>${root ? '<span class="hsp"></span>' : `<button class="back" onclick="history.length>1?history.back():go('')" aria-label="戻る">${I('back')}</button>`}<h2>${v.t}</h2><span class="hsp"></span></header>` : '')
      + `<main class="${v.cls || ''}">${v.h}</main>${nav(PARENT[name] ?? name)}`;
    v.a?.(); scrollTo(0, 0);
  } catch (e) { $('#app').innerHTML = `<main>${empty('エラーが発生しました', esc(e.message))}<a class="btn" href="#/">トップへ</a></main>${nav('')}`; }
}
addEventListener('hashchange', render);
render();

// ===== デモデータ（HOTEL_API 未設定時のみ使用・すべて架空） =====
function demo(path, p) {
  const A = [
    { code: 'sapporo', name: '札幌', details: [{ code: 'A', name: '札幌駅・大通' }, { code: 'B', name: 'すすきの・中島公園' }] },
    { code: 'jozankei', name: '定山渓', details: [] }, { code: 'otaru', name: '小樽', details: [] },
    { code: 'hakodate', name: '函館', details: [] }, { code: 'noboribetsu', name: '登別・室蘭', details: [] },
    { code: 'furano', name: '富良野・美瑛', details: [] },
  ];
  if (path === '/areas') return A;
  const ph = (c, e) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='${c}'/><text x='200' y='175' font-size='90' text-anchor='middle'>${e}</text></svg>`).replace(/'/g, '%27')}`;
  const H = [
    [1, 'サンプルホテル札幌駅前', 'sapporo', 'A', 43.0687, 141.3508, 6500, 4.21, 812, '札幌駅', 0, 1, '#a5d8ff', '🏙️'],
    [2, 'サンプルイン すすきの', 'sapporo', 'B', 43.0555, 141.3530, 4800, 3.88, 240, 'すすきの駅', 0, 0, '#d0bfff', '🌃'],
    [3, 'サンプル旅館 定山渓', 'jozankei', '', 42.9680, 141.1580, 14000, 4.52, 530, '定山渓', 1, 1, '#ffd8a8', '♨️'],
    [4, 'サンプルイン 小樽運河', 'otaru', '', 43.1990, 141.0020, 7800, 4.05, 321, '小樽駅', 0, 1, '#c3fae8', '⛵'],
    [5, 'サンプルリゾート 函館ベイ', 'hakodate', '', 41.7687, 140.7288, 9800, 4.33, 655, '函館駅', 1, 1, '#99e9f2', '🌉'],
    [6, 'サンプル温泉宿 登別', 'noboribetsu', '', 42.4960, 141.1450, 12000, 4.47, 402, '登別駅', 1, 1, '#ffc9c9', '♨️'],
    [7, 'サンプルペンション 富良野', 'furano', '', 43.3420, 142.3830, 8500, 4.61, 188, '富良野駅', 0, 0, '#d8f5a2', '🌻'],
  ];
  const nights = Math.max(1, (Date.parse(p.checkoutDate) - Date.parse(p.checkinDate)) / 864e5), ppl = +p.adultNum || 1;
  const sq = (p.squeezeCondition || '').split(',').filter(Boolean);
  let list = H.filter(h => p.hotelNo ? h[0] === +p.hotelNo : h[2] === p.smallClassCode && (!h[3] || !p.detailClassCode || h[3] === p.detailClassCode))
    .filter(h => !sq.includes('onsen') || h[10]).filter(h => !sq.includes('daiyoku') || h[11])
    .map(h => {
      const plans = [['素泊まりプラン', 0, 0, 1], ['朝食付きプラン', 1, 0, 1.18], ['夕朝食付き スタンダードプラン', 1, 1, 1.6], ['【早割30】2食付きプラン', 1, 1, 1.45]]
        .map(([n, b, d, k], i) => ({ name: n, room: i % 2 ? 'ツインルーム' : 'スタンダードルーム', breakfast: !!b, dinner: !!d, total: Math.round(h[6] * k / 100) * 100 * nights * ppl, point: i === 3 ? 5 : 1, url: '#/', perRoom: false }))
        .filter(x => (!sq.includes('breakfast') || x.breakfast) && (!sq.includes('dinner') || x.dinner))
        .filter(x => (!p.minCharge || x.total / nights / ppl >= +p.minCharge) && (!p.maxCharge || x.total / nights / ppl <= +p.maxCharge));
      return { no: h[0], name: h[1], lat: h[4], lng: h[5], minCharge: h[6], reviewAvg: h[7], reviewCount: h[8], station: h[9], areaName: A.find(a => a.code === h[2]).name,
        thumb: ph(h[12], h[13]), image: ph(h[12], h[13]), address: `北海道${A.find(a => a.code === h[2]).name}（架空の住所）`, access: `${h[9]}から徒歩5分（例）`, checkin: '15:00', checkout: '10:00',
        special: 'デモ用の架空の宿です。Worker を設定すると楽天トラベルの実データに切り替わります。', plans };
    }).filter(h => h.plans.length);
  if (p.sort === '+roomCharge') list.sort((a, b) => a.plans[0].total - b.plans[0].total);
  if (p.sort === '-roomCharge') list.sort((a, b) => b.plans[0].total - a.plans[0].total);
  return { paging: { page: 1, pageCount: 1, recordCount: list.length }, hotels: list };
}
