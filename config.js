// ===== 予約サイト（アフィリエイト）設定 =====
// url  : 遷移先。{q}=宿名＋市町村（UTF-8）、{sj}=宿名（じゃらん用 Shift_JIS）に置き換わります
// wrap : アフィリエイトの包みリンク。{url} に遷移先が入ります
//        例）バリューコマースのMyLink: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=●●&pid=●●&vc_url={url}'
// pr   : 広告リンクのとき true（「PR」表示。wrap を入れると自動で true 扱い）
// primary : 一覧のカードにも出す一番手の予約サイト
window.PARTNERS = [
  { id: 'jalan', name: 'じゃらん', color: '#e8590c', url: 'https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword={sj}&distCd=06', wrap: '', primary: true },
  { id: 'booking', name: 'Booking.com', color: '#003580', url: 'https://www.booking.com/searchresults.ja.html?ss={q}', wrap: '' }, // アフィリエイトIDは url の末尾に &aid=●● を追加
  { id: 'google', name: 'Googleで料金比較', color: '#1a73e8', url: 'https://www.google.com/travel/search?q={q}', note: '複数サイトの料金を一覧' },
];

// Googleアナリティクス4の測定ID（例: 'G-XXXXXXX'）。ページ閲覧に加え、次のイベントを集計できます
//   affiliate_click（予約ボタン：partner別）/ gacha_spin / shindan_result（type別）/ fav_add / stay_add / share_x / share_shiori
window.GA_ID = 'G-5MH8LTWPGF';

// Cloudflare Web Analytics のトークン（Cookieなしのアクセス解析。Cloudflare → Web Analytics → サイト追加で表示される token）
window.CF_BEACON_TOKEN = 'f343a621d6b5420698089f967eef689a';
