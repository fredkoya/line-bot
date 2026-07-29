# line-bot

LINE Messaging API のwebhookを受け取り、OpenAI の応答を返信する LINE Bot。

## 必要環境

Node.js のバージョンは Docker イメージ（`node:24.18.0-bookworm-slim`）で固定している。Docker で起動する場合、ホストに Node.js をインストールする必要はない。

ホストで直接動かす場合は Node.js 24 以上が必要。TypeScript は Node の型ストリップ機能で直接実行するため、実行用のトランスパイラは不要。

## Docker で起動する（推奨）

```sh
cp .env.example .env   # 各値を設定する
docker compose up --build
```

`src/` と `tsconfig.json` はバインドマウントしているため、コードを変更したら再ビルドせずに反映できる。

```sh
docker compose restart app
```

`node --watch` による自動リロードはコンテナ内では機能しない。Docker Desktop の virtiofs 越しにファイル変更の inotify イベントが伝わらないため。ホスト側の `npm run dev` では従来どおり自動リロードが効く。

## ホストで直接起動する

```sh
cp .env.example .env   # 各値を設定する
npm ci
npm run dev
```

## 環境変数

| 変数 | 説明 |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers のチャネルアクセストークン |
| `LINE_CHANNEL_SECRET` | webhook の署名検証に使うチャネルシークレット |
| `OPENAI_API_KEY` | OpenAI の API キー。未設定だと起動時に失敗する |
| `PORT` | 待ち受けポート（省略時は 3000） |

## npm scripts

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | `.env` を読み込み、ファイル変更を監視して起動 |
| `npm run typecheck` | 型チェックのみ実行 |
| `npm run build` | `dist/` に JavaScript を出力 |
| `npm start` | ビルド済みの `dist/index.js` を起動 |

## エンドポイント

`POST /webhook` — LINE からの webhook を受け取る。署名が不正な場合は 401、リクエストボディが不正な場合は 400 を返す。
