-- DBには既に存在するカラムをマイグレーション履歴に記録するためのファイル
-- （直接DBに追加されたカラムとPrismaの履歴を同期させる）

-- Shop テーブルへの placeId・source カラム追加
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeId" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'google';
CREATE INDEX IF NOT EXISTS "Shop_placeId_idx" ON "Shop"("placeId");

-- UserShop テーブルへの rating カラム追加
ALTER TABLE "UserShop" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
