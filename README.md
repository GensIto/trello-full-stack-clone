# Trello フルスタッククローン

Cloudflare Workers上で動作するTrelloクローンアプリケーション。モダンなフルスタック技術とドメイン駆動設計（DDD）を採用した実装例です。

## 技術スタック

### フロントエンド
- [**React 19**](https://react.dev/) - モダンなUIライブラリ
- [**Vite**](https://vite.dev/) - 高速ビルドツール＆開発サーバー
- [**TanStack Router**](https://tanstack.com/router) - ファイルベースルーティング
- [**TanStack Query**](https://tanstack.com/query) - サーバーステート管理
- [**Tailwind CSS 4**](https://tailwindcss.com/) - ユーティリティファーストCSS
- [**Better Auth**](https://www.better-auth.com/) - 認証システム

### バックエンド
- [**Hono**](https://hono.dev/) - 軽量・高速なWebフレームワーク
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - エッジコンピューティングプラットフォーム
- [**Cloudflare D1**](https://developers.cloudflare.com/d1/) - サーバーレスSQLiteデータベース
- [**Drizzle ORM**](https://orm.drizzle.team/) - 型安全なORM
- [**Zod**](https://zod.dev/) - スキーマバリデーション

### アーキテクチャ
- **ドメイン駆動設計（DDD）** - 値オブジェクト、エンティティ、リポジトリパターン
- **依存性注入（DI）** - カスタムDIコンテナによる疎結合な設計
- **レイヤードアーキテクチャ** - Controller → Service → Repository → Domain

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

Drizzle Studioを使用する場合は、以下の環境変数を設定してください：

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-d1-token
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### データベース管理

```bash
# スキーマからマイグレーションファイルを生成
npm run db:gen

# ローカルDBにマイグレーションを適用
npm run db:migrate

# 本番DBにマイグレーションを適用
npm run db:migrate:remote

# ローカルDB用のDrizzle Studioを起動
npm run db:studio

# 本番DB用のDrizzle Studioを起動
npm run db:studio:prod
```

### リンティング

```bash
npm run lint
```

### 型チェック

```bash
npm run cf-typegen  # Cloudflare Workers型定義の生成
npm run check       # TypeScript + ビルド + デプロイドライラン
```

## 本番環境

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

### デプロイ

```bash
npm run deploy
```

### モニタリング

```bash
npx wrangler tail
```

## プロジェクト構成

```
src/
├── react-app/           # フロントエンド
│   ├── routes/          # TanStack Routerのルート定義
│   ├── features/        # 機能別コンポーネント
│   ├── lib/             # ライブラリ設定
│   └── App.tsx
│
└── worker/              # バックエンド
    ├── controllers/     # HTTPリクエストハンドラ
    ├── service/         # ビジネスロジック
    ├── domain/          # ドメインモデル
    │   ├── entities/    # エンティティ
    │   └── value-object/ # 値オブジェクト
    ├── infrastructure/  # リポジトリ実装
    ├── db/              # データベーススキーマ
    ├── middleware/      # ミドルウェア
    └── index.ts         # エントリーポイント
```

## アーキテクチャの特徴

### ドメイン駆動設計（DDD）

- **値オブジェクト**: バリデーション付きの型安全なプリミティブ
  - `.of(value)` - バリデーションエラー時は例外をスロー
  - `.tryOf(value)` - 成功/失敗の結果オブジェクトを返却

- **エンティティ**: イミュータブルなビジネスドメインオブジェクト
  - 静的ファクトリメソッドで生成
  - ビジネスロジックをメソッドとして持つ

- **リポジトリパターン**: データ永続化の抽象化
  - インターフェースとして定義
  - Drizzle ORMで型安全なクエリ実行

### 依存性注入

- カスタムDIコンテナで依存関係を管理
- ミドルウェアでHonoコンテキストに注入
- テスタビリティの向上

### 認証

- Better Authによるセッションベース認証
- `/api/auth/*` エンドポイントで認証処理
- `injectAuth` ミドルウェアで保護されたルート

## 開発ガイド

詳細なアーキテクチャ説明や開発パターンについては [CLAUDE.md](./CLAUDE.md) を参照してください。

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Hono ドキュメント](https://hono.dev/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [TanStack Router ドキュメント](https://tanstack.com/router)
- [Better Auth ドキュメント](https://www.better-auth.com/)
