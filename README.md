# 北海道やどさがし

北海道全域のホテル・旅館を、エリア・日程・人数・料金・食事プラン・温泉などで検索できるサイトです。
データは楽天トラベルAPI。ビルド不要・DB不要（お気に入りは端末に保存）。

## 構成
```
スマホ → GitHub Pages（このサイト） → Cloudflare Worker（中継・キーを隠す） → 楽天トラベルAPI
```
| ファイル | 役割 |
|---|---|
| index.html / app.js / style.css | サイト本体（さがす・検索結果・絞り込み・地図・宿の詳細・お気に入り） |
| config.js | Worker のURL。空ならデモデータで動作 |
| worker/worker.js | Cloudflare Worker に貼るコード（GitHub Pages では使われない） |

## 1. まず動かす（デモ）
config.js が空のまま GitHub Pages に公開すれば、架空の宿7件で全画面を試せます。

## 2. 楽天ウェブサービスに登録
1. https://webservice.rakuten.co.jp/ で楽天IDログイン → アプリ新規作成
2. **アプリID** と **アクセスキー** を控える（2026年版APIから両方必須）
3. 収益化する場合は楽天アフィリエイトに登録し **アフィリエイトID** も控える
4. アプリの「許可するWebサイト」等の設定がある場合は、Worker のURLを登録

## 3. Cloudflare Worker を作る（無料・1日10万回まで）
1. https://dash.cloudflare.com/ に登録 → Workers & Pages → Create → 「Hello World」で作成
2. 「Edit code」で中身を全部消し、`worker/worker.js` を貼り付けて Deploy
3. Settings → Variables and Secrets に登録
   - `RAKUTEN_APP_ID`（Text）
   - `RAKUTEN_ACCESS_KEY`（**Secret**）
   - `RAKUTEN_AFFILIATE_ID`（Text・任意）
   - `ALLOW_ORIGIN`（Text）：`https://<ユーザー名>.github.io`（末尾の / なし）
4. 動作確認：ブラウザで `https://<worker名>.<サブドメイン>.workers.dev/areas` を開き、北海道のエリア一覧が出ればOK

## 4. サイトとつなぐ
config.js に Worker のURLを入れて GitHub にアップロード：
```js
window.HOTEL_API = 'https://<worker名>.<サブドメイン>.workers.dev';
```

## 公開前に確認すること
- 画面下部の「Supported by Rakuten Developers」は、楽天が指定するクレジット表記（画像バナー）に差し替える
- 楽天ウェブサービス・楽天アフィリエイトの利用規約（表示ルール・禁止事項）
- 料金の絞り込み（minCharge / maxCharge）は楽天側の基準で判定されます。1人1泊の表示と多少ずれる場合があります
- 楽天APIは短時間に大量アクセスすると一時的に止まります。Worker で同じ検索を10分キャッシュしています
