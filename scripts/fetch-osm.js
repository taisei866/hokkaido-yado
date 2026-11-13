// OpenStreetMap（Overpass API）から北海道の宿泊施設を取得し data/hotels.json に保存
// GitHub Actions から毎月実行。手元で試す: node scripts/fetch-osm.js
const fs = require('fs');
const iconv = require('iconv-lite'); // じゃらん検索用に宿名を Shift_JIS へ変換
const sjis = t => [...iconv.encode(t, 'Shift_JIS')].map(b => '%' + b.toString(16).toUpperCase().padStart(2, '0')).join('');

const QUERY = `[out:json][timeout:300];
area["ISO3166-2"="JP-01"]->.hk;
rel(area.hk)["boundary"="administrative"]["admin_level"="7"];
map_to_area->.cities;
foreach.cities->.c(
  .c out tags;
  nwr(area.c)["tourism"~"^(hotel|guest_house|hostel|motel)$"]["name"];
  out center tags;
);`;

// 観光エリア（代表地点に一番近いエリアへ割り当て）
const REGIONS = {
  '札幌・定山渓': [[43.06, 141.35], [42.97, 141.16]],
  '小樽・ニセコ・積丹': [[43.19, 141.0], [42.86, 140.69], [43.3, 140.6]],
  '千歳・苫小牧': [[42.82, 141.65], [42.63, 141.6]],
  '登別・洞爺・室蘭': [[42.49, 141.15], [42.56, 140.82], [42.32, 140.97]],
  '函館・道南': [[41.77, 140.73], [41.43, 140.11], [42.25, 140.27]],
  '日高・えりも': [[42.17, 142.77], [42.48, 142.06]],
  '旭川・層雲峡': [[43.77, 142.36], [43.72, 142.95]],
  '富良野・美瑛': [[43.34, 142.38], [43.59, 142.47]],
  '空知・岩見沢': [[43.56, 141.9], [43.2, 141.76]],
  '稚内・利尻礼文・留萌': [[45.41, 141.67], [45.18, 141.24], [43.94, 141.64]],
  '網走・知床・紋別': [[44.02, 144.27], [44.07, 145.0], [44.35, 143.35]],
  '釧路・阿寒・根室': [[42.98, 144.38], [43.43, 144.1], [43.33, 145.58], [43.62, 144.44]],
  '帯広・十勝': [[42.92, 143.2], [42.3, 143.32], [43.1, 143.6]],
};
const d2 = (a, b) => ((a[0] - b[0]) * 111) ** 2 + ((a[1] - b[1]) * 82) ** 2;
const regionOf = p => Object.entries(REGIONS).map(([k, pts]) => [k, Math.min(...pts.map(q => d2(p, q)))]).sort((a, b) => a[1] - b[1])[0][0];
const KIND = t => (t.hotel === 'ryokan' || t.guest_house === 'ryokan' || /旅館/.test(t.name || '')) ? 'ryokan'
  : t.tourism === 'hostel' ? 'hostel' : t.tourism === 'guest_house' ? 'guest' : t.tourism === 'motel' ? 'motel' : 'hotel';

// ===== 写真（Wikimedia Commons。自由ライセンスのみ・撮影者とライセンスを記録） =====
const UA = { 'User-Agent': 'namarayado/1.0 (https://github.com/taisei866/hokkaido-yado; GitHub Actions)' };
const getJSON = async u => { const r = await fetch(u, { headers: UA }); if (!r.ok) throw Error(`${r.status} ${u.slice(0, 80)}`); return r.json(); };
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const normFile = f => { f = decodeURIComponent(f).replace(/^(File|ファイル):/i, '').replace(/_/g, ' ').trim(); return f && f[0].toUpperCase() + f.slice(1); };
function commonsFile(v) {
  if (!v) return null;
  const m = String(v).match(/(?:File|ファイル):([^?#|]+)/i) || String(v).match(/upload\.wikimedia\.org\/.+\/([^/?#]+\.(?:jpe?g|png|webp))/i);
  return m ? normFile(m[1]) : null;
}
// 代表的な景色（日本語版Wikipediaの記事のメイン画像を使う）
const REGION_PAGES = {
  '札幌・定山渓': '大通公園', '小樽・ニセコ・積丹': '小樽運河', '千歳・苫小牧': '支笏湖', '登別・洞爺・室蘭': '地獄谷 (登別市)', '函館・道南': '函館山',
  '日高・えりも': '襟裳岬', '旭川・層雲峡': '層雲峡', '富良野・美瑛': '白金青い池', '空知・岩見沢': '石狩川', '稚内・利尻礼文・留萌': '利尻山',
  '網走・知床・紋別': '知床五湖', '釧路・阿寒・根室': '釧路湿原', '帯広・十勝': '十勝平野',
};
async function commonsInfo(files) {
  const out = {};
  for (const c of chunk([...new Set(files)], 40)) {
    const j = await getJSON('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640&titles=' + encodeURIComponent(c.map(f => 'File:' + f).join('|')));
    for (const p of Object.values(j.query?.pages || {})) {
      const ii = p.imageinfo?.[0], m = ii?.extmetadata || {}, lic = m.LicenseShortName?.value || '';
      if (!ii?.thumburl || !lic || /fair use|non-free/i.test(lic)) continue;
      out[normFile(p.title)] = { u: ii.thumburl, by: strip(m.Artist?.value).slice(0, 60) || '不明', lic, src: ii.descriptionurl };
    }
    await sleep(300);
  }
  return out;
}
async function addPhotos(hotels) {
  // Wikidata の画像（P18）
  const qids = [...new Set(hotels.filter(h => h._wd && !h._file).map(h => h._wd))];
  const p18 = {};
  for (const c of chunk(qids, 50)) {
    const j = await getJSON('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=' + c.join('|'));
    for (const [id, e] of Object.entries(j.entities || {})) { const v = e.claims?.P18?.[0]?.mainsnak?.datavalue?.value; if (v) p18[id] = normFile(v); }
    await sleep(300);
  }
  hotels.forEach(h => { h._file = h._file || p18[h._wd] || null; });
  // 地域の代表写真
  const pj = await getJSON('https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=' + encodeURIComponent(Object.values(REGION_PAGES).join('|')));
  const byTitle = {}; Object.values(pj.query?.pages || {}).forEach(p => { if (p.pageimage) byTitle[p.title] = normFile(p.pageimage); });
  const alias = Object.fromEntries([...(pj.query?.normalized || []), ...(pj.query?.redirects || [])].map(x => [x.from, x.to]));
  const regionFile = Object.fromEntries(Object.entries(REGION_PAGES).map(([r, t]) => [r, byTitle[alias[t] || t] || byTitle[alias[alias[t]]]]).filter(([, f]) => f));
  const info = await commonsInfo([...hotels.map(h => h._file).filter(Boolean), ...Object.values(regionFile)]);
  hotels.forEach(h => { if (h._file && info[h._file]) h.photo = info[h._file]; });
  return Object.fromEntries(Object.entries(regionFile).map(([r, f]) => [r, info[f]]).filter(([, v]) => v));
}

// 混雑に備えて、複数のサーバーを順に・待ち時間を延ばしながら試す
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fetchOverpass() {
  let last;
  for (let round = 0; round < 3; round++) {
    for (const url of ENDPOINTS) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'hokkaido-yado (GitHub Actions)' }, body: 'data=' + encodeURIComponent(QUERY), signal: AbortSignal.timeout(330000) });
        if (r.ok) { console.log(`取得成功: ${url}`); return await r.json(); }
        last = `${url} → ${r.status}`;
      } catch (e) { last = `${url} → ${e.message}`; }
      console.log(`失敗: ${last}`);
    }
    const wait = 30000 * 2 ** round; console.log(`${wait / 1000}秒待って再試行します`); await sleep(wait);
  }
  throw Error(`すべてのサーバーで取得に失敗しました（最後: ${last}）`);
}

(async () => {
  const { elements } = await fetchOverpass();
  let city = '';
  const seen = new Set(), hotels = [];
  for (const e of elements) {
    if (e.type === 'area') { city = e.tags?.name || ''; continue; }
    const t = e.tags || {}, lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon, id = `${e.type[0]}${e.id}`;
    if (!lat || seen.has(id)) continue;
    seen.add(id);
    const addr = t['addr:full'] || [t['addr:city'], t['addr:quarter'], t['addr:neighbourhood'], t['addr:block_number'], t['addr:housenumber']].filter(Boolean).join('');
    hotels.push({
      id, name: t['name:ja'] || t.name, sj: sjis(t['name:ja'] || t.name), kind: KIND(t), lat: +lat.toFixed(5), lng: +lng.toFixed(5), city, region: regionOf([lat, lng]),
      addr: addr || null, website: t.website || t['contact:website'] || null, phone: t.phone || t['contact:phone'] || null,
      _wd: t.wikidata || null, _file: commonsFile(t.wikimedia_commons) || commonsFile(t.image),
      onsen: t.onsen === 'yes' || /温泉/.test(`${t.name} ${t['name:ja'] || ''} ${t.description || ''}`),
    });
  }
  if (hotels.length < 100) throw Error(`取得件数が少なすぎます（${hotels.length}件）。保存を中止しました`);
  let photos = {};
  try { photos = await addPhotos(hotels); console.log(`写真：宿 ${hotels.filter(h => h.photo).length}件 / 地域 ${Object.keys(photos).length}件`); }
  catch (e) { console.log('写真の取得をスキップしました：' + e.message); }
  hotels.forEach(h => { delete h._wd; delete h._file; });
  hotels.sort((a, b) => a.region.localeCompare(b.region, 'ja') || a.name.localeCompare(b.name, 'ja'));
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/hotels.json', JSON.stringify({ updated: new Date().toISOString().slice(0, 10), regions: Object.keys(REGIONS), photos, hotels }));
  console.log(`保存しました: ${hotels.length}件`);
  Object.keys(REGIONS).forEach(k => console.log(`  ${k}: ${hotels.filter(h => h.region === k).length}件`));
})().catch(e => { console.error(e); process.exit(1); });
