# CLAUDE.md — 店コレ (misekore)

## プロジェクト概要

**店コレ** は、行きたいお店・行ったお店・お気に入りのお店を管理するWebアプリ。

- タグライン: 「行く店、即答できる。」
- ターゲット: 日本語ユーザー向け、スマートフォン優先
- UIラベルはすべて **日本語**

### ステータス定義

| 値 | 意味 |
|----|------|
| `WANT` | 行きたい |
| `VISITED` | 行った |
| `FAVORITE` | お気に入り |

---

## 技術スタック

| 分野 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI |
| 言語 | TypeScript (strict: true) |
| DB | PostgreSQL + Prisma 7 (スキーマ定義のみ、クエリは生SQL) |
| 認証 | NextAuth v5 beta (Credentials Provider / JWT) |
| フォーム | React Hook Form + Zod |
| 地図 | Google Maps API (@googlemaps/js-api-loader) |
| 写真 | Swiper (カルーセル) |
| 通知 | Sonner (Toast) |
| インフラ | Docker (Node 20), docker-compose |

### 必須環境変数

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<ランダム文字列>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<クライアント側キー>
GOOGLE_PLACES_SERVER_KEY=<サーバー側キー>
```

---

## ディレクトリ構造

```
frontend/
├── prisma/
│   ├── schema.prisma          # モデル定義（Tag/ShopTagはここに未定義）
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # ランディングページ（未認証向け）
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── shops/
│   │   │   ├── page.tsx           # お店一覧
│   │   │   ├── [id]/page.tsx      # お店詳細
│   │   │   ├── new/page.tsx       # 新規登録
│   │   │   └── _components/       # shops配下専用コンポーネント
│   │   ├── map/page.tsx           # 地図ページ
│   │   ├── favorite/page.tsx      # お気に入り一覧
│   │   ├── settings/              # 設定ページ群（大半がプレースホルダー）
│   │   ├── actions/               # Server Actions（6ファイル）
│   │   └── api/
│   │       ├── auth/[...nextauth]/ # NextAuth エンドポイント
│   │       ├── map/shops/          # 地図用お店一覧API
│   │       └── places/{autocomplete,details}/ # Google Places プロキシ
│   ├── components/
│   │   ├── layout/            # AppLayout, Footer
│   │   ├── map/ShopMap.tsx    # Google Maps実装（地図ページ用）
│   │   ├── settings/          # 設定UI部品
│   │   └── ui/                # Radix UIベースの汎用コンポーネント
│   ├── lib/
│   │   ├── auth.ts            # NextAuth設定
│   │   ├── auth.config.ts     # ミドルウェア用認証設定
│   │   ├── db.server.ts       # pg Pool + query<T>() ヘルパー
│   │   ├── shop.ts            # DBクエリ関数群
│   │   ├── rate-limit.ts      # レートリミット
│   │   └── utils.ts           # cn() (tailwind-merge)
│   ├── types/
│   │   └── shop.ts            # ShopStatus型
│   └── middleware.ts
```

---

## データベース

### Prisma スキーマ（定義済みモデル）

```
User         ─┬─ UserShop ──── Shop
              │   status        name, address
              │   memo          lat, lng
              │   rating        placeId, source
              │   visitedAt
              └─ ShopPhoto ─── Shop
```

### スキーマ未定義だが実在するテーブル

`Tag` と `ShopTag` は Prisma スキーマに定義されていないが、DBとServer Actionsで直接使用されている。

```sql
Tag      : id, name, createdAt, updatedAt
ShopTag  : id, shopId, tagId, createdAt, updatedAt
```

### DBアクセスパターン

トランザクションが必要な場合は `pool` を直接使う：

```typescript
import { pool } from '@/lib/db.server'

const client = await pool.connect()
try {
  await client.query('BEGIN')
  // ... 複数のクエリ
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

---

## 主要コンポーネント

### ページ構成

| ルート | 役割 |
|--------|------|
| `/` | ランディング（未認証向け） |
| `/shops` | お店一覧（タブ・タグフィルタ・ページネーション） |
| `/shops/[id]` | お店詳細（写真・メモ・タグ・地図・ステータス変更） |
| `/shops/new` | 新規登録（Google Places検索 or 手動入力） |
| `/map` | 全お店の地図表示（色分けピン） |
| `/favorite` | お気に入り一覧 |
| `/settings` | 設定ハブ（各サブページはほぼプレースホルダー） |

### コンポーネント役割

| コンポーネント | 役割 |
|----------------|------|
| `AppLayout` | 認証済みページの共通ラッパー（Footer含む） |
| `Footer` | 固定ボトムナビ（5タブ） |
| `RestaurantCard` | お店一覧のカード1枚 |
| `SegmentTabs` | WANT/VISITED/ALL の切り替えタブ |
| `TagFilteredShopList` | タグフィルタ + ページネーション（8件/ページ） |
| `PlaceSearchInput` | Google Places Autocomplete（デバウンス300ms） |
| `TagInput` | タグ入力UI（最大10個、20文字/個） |
| `EditShopDialog` | お店編集モーダル（名前・ステータス・タグ・メモ・削除） |
| `ShopStatusAction` | 固定ボトムバー（ステータス変更ボタン） |
| `ShopDetailMap` | 詳細ページ内埋め込みマップ（単一ピン） |
| `components/map/ShopMap` | 地図ページのフルマップ（全お店、色分けピン） |

### Server Actions

| ファイル | 処理 | 完了後 |
|----------|------|--------|
| `create-shop.ts` | Google Places経由でお店登録 | `/shops` へリダイレクト |
| `create-manual-shop.ts` | 手動入力でお店登録（Geocoding API使用） | `/shops` へリダイレクト |
| `update-shop.ts` | お店情報更新（名前・メモ・ステータス・タグ） | JSON `{ success, error }` を返す |
| `update-shop-status.ts` | ステータスのみ変更（visitedAt自動セット） | `revalidatePath` 後に返す |
| `delete-shop.ts` | UserShopレコードを削除（お店本体は残す） | `/shops` へリダイレクト |
| `sign-up.ts` | ユーザー登録 + 自動ログイン | `/shops` へリダイレクト |

---

## コーディング方針

### 認証

- セッション取得は `auth()` を使う（`@/lib/auth` からインポート）
- 未認証の場合は `Error('Unauthorized')` をスローする
- **`'user-1'` のハードコードは既知の技術的負債**（複数箇所に残存）。新規コードでは必ず `session.user.id` を使うこと

```typescript
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const userId = session.user.id
```

### データ取得

- ページコンポーネントは **Server Component** で書く（`'use client'` を付けない）
- データ取得は `lib/shop.ts` の関数を使うか、必要なら同ファイルに追加する
- `force-dynamic` が必要なページには `export const dynamic = 'force-dynamic'` を追加する

### Server Actions

- ファイル先頭に `'use server'` を記述する
- IDは `randomUUID()` (`import { randomUUID } from 'crypto'`) で生成する
- 複数テーブルを変更する場合は必ずトランザクションを使う
- キャッシュ無効化は `revalidatePath()` で行う
- ミューテーション完了後は原則 `redirect()` でリダイレクトする

### UIコンポーネント

- スタイルは **Tailwind CSS** クラスで記述する（CSS Modulesは使わない）
- クラス結合は `cn()` ユーティリティを使う（`@/lib/utils` からインポート）
- 汎用UIは `src/components/ui/` の既存コンポーネントを再利用する
- ページ固有コンポーネントは `_components/` ディレクトリに置く
- UIラベル・メッセージは **日本語** で書く

### TypeScript

- `any` の使用は避ける。DBクエリの戻り値には必ず型パラメータを渡す

```typescript
// 良い例
const rows = await query<{ id: string; name: string }>(sql, params)

// 悪い例
const rows = await query<any>(sql, params)
```

- 型定義はファイル内に `type XxxRow = ...` の形でローカルに定義する（共通型は `src/types/` に置く）

### パスエイリアス

`@/` は `src/` を指す（tsconfig.json で設定済み）。相対パスの代わりに必ず使う。

```typescript
import { query } from '@/lib/db.server'   // 良い
import { query } from '../../lib/db.server' // 悪い
```

### コメントアウト
実装内容がわかるようにコメントアウトで記入する
---

## 既知の技術的負債

コードを修正する際は以下を念頭に置く（積極的に直す必要はないが、悪化させない）:

1. **`user-1` ハードコード** — `lib/shop.ts` の `getShopDetail` / `getAllShopsForList` にTODOコメントあり。新規コードでは使わないこと
2. **Tag/ShopTag がPrismaスキーマ未定義** — DBには存在する。スキーマに追加する場合はマイグレーションを慎重に行う
3. **設定ページがほぼ未実装** — `/settings` 配下はナビゲーション構造のみ
4. **写真の保存先が `public/uploads/`** — 本番ではS3等の外部ストレージが必要
5. **`ShopMap` が2箇所に存在** — `src/app/shops/_components/ShopMap.tsx`（旧・テキスト表示）は削除候補

---

## 開発の始め方

```bash
# Docker で起動
docker compose up

# DBマイグレーション（別ターミナル）
cd frontend
npx prisma migrate dev

# 型チェック
npm run build

# Lint & Format
npm run lint
npm run format
```

# Git ワークフロー

- 実装前に必ず新規ブランチを作成する（main で直接作業しない）
- PR マージ後は main に pull する

# GitHub Issue ワークフロー

- 実装計画が固まったら、**まず GitHub Issue を作成する**
- Issue 作成後は、ユーザーから明示的に「実装して」と指示があるまで実装を開始しない
- Issue には実装内容・変更ファイル・設計方針を記載する

# テスト駆動開発（TDD）

- 新機能・バグ修正は **テストを先に書いてから実装する**（Red → Green → Refactor）
- テストファイルは実装ファイルと同階層に `*.test.ts` / `*.test.tsx` の形で置く
- テストは `npm run test` で実行する
- 実装完了の定義は「テストがすべてパスすること」とする
- UIコンポーネントのテストは Testing Library、ロジックのテストは Vitest を使う
