// 前日のGA4集計をDiscordに送る（GitHub Actionsから毎朝実行）
// 必要なSecrets: GA_PROPERTY_ID / GA_CREDENTIALS（サービスアカウントJSON）/ DISCORD_WEBHOOK
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');

const PROPERTY = `properties/${process.env.GA_PROPERTY_ID}`;
const ga = new BetaAnalyticsDataClient({ credentials: JSON.parse(process.env.GA_CREDENTIALS) });
const DAYS = [{ startDate: 'yesterday', endDate: 'yesterday' }, { startDate: '2daysAgo', endDate: '2daysAgo' }];

let lastErr = '';
const run = async (dims, mets, opt = {}) => {
  try {
    const [r] = await ga.runReport({ property: PROPERTY, dimensions: dims.map(name => ({ name })), metrics: mets.map(name => ({ name })), ...opt });
    return r.rows || [];
  } catch (e) { console.error(dims, e.message); lastErr ||= e.message; return null; }
};
const n = v => Number(v || 0).toLocaleString('ja-JP');
const diff = (a, b) => { const d = a - b; return d === 0 ? '±0' : (d > 0 ? `+${d}` : `${d}`); };

const EVENTS = { affiliate_click: '予約ボタン', gacha_spin: 'ガチャ', shindan_result: '診断', fav_add: 'しおり追加', stay_add: '泊まった登録', share_x: 'Xシェア', share_shiori: 'しおり共有' };
const PARTNERS = { jalan: 'じゃらん', booking: 'Booking.com', google: 'Google' };
const CHANNELS = { 'Organic Search': '検索', Direct: '直接', 'Organic Social': 'SNS', Referral: '他サイト', 'Paid Search': '広告', Unassigned: '不明' };

(async () => {
  let hotels = {};
  try { for (const h of JSON.parse(fs.readFileSync('data/hotels.json', 'utf8')).hotels) hotels[h.id] = h.name; } catch {}

  const day = new Date(Date.now() + 9 * 3600e3 - 86400e3);
  const L = [`**なまらやど 日報（${day.getUTCMonth() + 1}/${day.getUTCDate()}）**`];

  // 1. 全体（前日比）
  const tot = await run([], ['activeUsers', 'sessions', 'screenPageViews'], { dateRanges: DAYS });
  if (tot) {
    const cur = tot.find(r => r.dimensionValues?.[0]?.value === 'date_range_0') || tot[0];
    const prev = tot.find(r => r.dimensionValues?.[0]?.value === 'date_range_1');
    const v = i => Number(cur?.metricValues[i].value || 0), p = i => Number(prev?.metricValues[i].value || 0);
    L.push(`訪問者 **${n(v(0))}人**（前日比 ${diff(v(0), p(0))}）／ 訪問 ${n(v(1))}回 ／ 閲覧 ${n(v(2))}ページ`);
  }
  const Y = { dateRanges: [DAYS[0]] };

  // 2. 流入元
  const ch = await run(['sessionDefaultChannelGroup'], ['sessions'], { ...Y, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 5 });
  if (ch?.length) L.push('\n**どこから来たか**\n' + ch.map(r => `・${CHANNELS[r.dimensionValues[0].value] || r.dimensionValues[0].value}：${n(r.metricValues[0].value)}回`).join('\n'));

  // 3. 機能の利用回数
  const ev = await run(['eventName'], ['eventCount'], { ...Y, dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: Object.keys(EVENTS) } } } });
  if (ev) {
    const m = Object.fromEntries(ev.map(r => [r.dimensionValues[0].value, r.metricValues[0].value]));
    L.push('\n**使われた機能**\n' + Object.entries(EVENTS).map(([k, t]) => `${t} ${n(m[k])}`).join('／'));
  }

  // 4. 予約ボタン：予約先別・宿別（カスタムディメンション登録後に表示）
  const clickFilter = { dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'affiliate_click' } } } };
  const pt = await run(['customEvent:partner'], ['eventCount'], { ...Y, ...clickFilter });
  if (pt?.length) L.push('\n**予約ボタン（予約先別）**\n' + pt.map(r => `・${PARTNERS[r.dimensionValues[0].value] || r.dimensionValues[0].value}：${n(r.metricValues[0].value)}回`).join('\n'));
  const ht = await run(['customEvent:hotel_id'], ['eventCount'], { ...Y, ...clickFilter, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 3 });
  if (ht?.length) L.push('**予約ボタンが押された宿 TOP3**\n' + ht.map((r, i) => `${i + 1}. ${hotels[r.dimensionValues[0].value] || r.dimensionValues[0].value}（${r.metricValues[0].value}回）`).join('\n'));

  // 5. 診断タイプ
  const ty = await run(['customEvent:type'], ['eventCount'], { ...Y, dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'shindan_result' } } }, limit: 5 });
  if (ty?.length) L.push('\n**診断結果**\n' + ty.map(r => `・${r.dimensionValues[0].value}：${r.metricValues[0].value}回`).join('\n'));

  // 6. よく見られたページ
  const pg = await run(['pageTitle'], ['screenPageViews'], { ...Y, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 });
  if (pg?.length) L.push('\n**よく見られたページ**\n' + pg.map((r, i) => `${i + 1}. ${r.dimensionValues[0].value.replace(/｜?なまらやど.*$/, '') || 'トップ'}（${r.metricValues[0].value}）`).join('\n'));

  if (!tot) L.push('\n⚠️ GA4からデータを取得できませんでした。プロパティIDと権限をご確認ください。\n```' + lastErr.slice(0, 400) + '```');
  const content = L.join('\n').slice(0, 1990);
  console.log(content);
  const res = await fetch(process.env.DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'なまらくん', content }) });
  if (!res.ok) throw new Error(`Discord ${res.status}`);
})().catch(e => { console.error(e); process.exit(1); });
