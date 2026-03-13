-- フリーミアムプラン対応のDBマイグレーション

-- UserPlan Enum を作成
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PREMIUM');

-- User テーブルにプラン関連カラムを追加
ALTER TABLE "User" ADD COLUMN "plan" "UserPlan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "premiumExpiresAt" TIMESTAMP(3);

-- PlacesUsageLog テーブルを作成（Google検索登録の月次利用状況を管理）
CREATE TABLE "PlacesUsageLog" (
    "id"         TEXT         NOT NULL,
    "userId"     TEXT         NOT NULL,
    "monthKey"   TEXT         NOT NULL,
    "usedCount"  INTEGER      NOT NULL DEFAULT 0,
    "videoCount" INTEGER      NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlacesUsageLog_pkey" PRIMARY KEY ("id")
);

-- 外部キー制約（ユーザー削除時にログも削除）
ALTER TABLE "PlacesUsageLog"
    ADD CONSTRAINT "PlacesUsageLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ユーザーIDと月キーの組み合わせを一意に制約
CREATE UNIQUE INDEX "PlacesUsageLog_userId_monthKey_key" ON "PlacesUsageLog"("userId", "monthKey");

-- 検索用インデックス
CREATE INDEX "PlacesUsageLog_userId_monthKey_idx" ON "PlacesUsageLog"("userId", "monthKey");
