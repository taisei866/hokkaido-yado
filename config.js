// 宿の詳細画面に並べるリンク。{q} は「宿名 市町村」に置き換わります。
// アフィリエイトを使う場合は、バリューコマース等で作った検索リンクに差し替え・追加してください。
window.LINKS = [
  { label: 'Googleで空室・料金を比較', url: 'https://www.google.com/travel/search?q={q}' },
  // 例（バリューコマースのMyLink形式。sid・pidは自分のものに。遷移先URLは各サイトの検索URLを確認して入れる）
  // { label: 'じゃらんで見る', url: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=XXXX&pid=YYYY&vc_url=' + encodeURIComponent('（じゃらんの検索URL）') },
];
