# 北海道やどさがし（OpenStreetMap版）

北海道全域の宿（ホテル・旅館・民宿・ゲストハウス・モーテル）を、地域・市町村・種類・温泉・キーワードで探せるサイトです。
宿データは OpenStreetMap から GitHub Actions が毎月自動取得。サーバー・DB・APIキー不要。料金・プランは各予約サイトへのリンクで確認する形です。

## ファイル
| ファイル | 役割 |
|---|---|
| index.html / app.js / style.css | サイト本体 |
| config.js | 宿の詳細画面に並べる予約・比較リンク（アフィリエイトリンクに差し替え可） |
| data/hotels.json | 宿データ（最初はサンプル120件。取得を実行すると実データに置き換わる） |
| scripts/fetch-osm.js | OpenStreetMap から宿データを取得するスクリプト |
| .github/workflows/osm.yml | 取得を毎月2日3時（日本時間）に自動実行する設定 |

## 公開手順
1. GitHub でリポジトリを作成（Public）し、すべてのファイルをアップロード
   - `.github` が入らない場合は「Add file」→「Create new file」でファイル名に `.github/workflows/osm.yml` と入力して中身を貼る
2. Settings → Pages → Branch「main」「/(root)」→ Save（サンプルデータで表示される）
3. Settings → Actions → General → Workflow permissions を「Read and write permissions」にして Save
4. Actions タブ →「宿データ更新（OpenStreetMap）」→「Run workflow」
   - 数分で data/hotels.json が実データに更新され、サイトに反映される（画面下の「サンプルデータ」表示が消える）

## 収益化（任意）
config.js の `LINKS` に、バリューコマース・もしもアフィリエイト等で作った予約サイトのリンクを追加。
`{q}` は「宿名 市町村」に置き換わります。

## 注意
- 画面下の「© OpenStreetMap contributors」表示は削除しないこと（ODbL の条件）
- OpenStreetMap は有志が作る地図データのため、宿の掲載漏れ・閉業済みの宿が含まれる場合があります
- 楽天トラベルAPIが復旧したら、料金・プランで絞り込める版に拡張できます
