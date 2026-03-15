-- Shop.placeId の @@index を削除し、@@unique に変更する
-- NULL 値は PostgreSQL の UNIQUE 制約の対象外のため、手動登録（placeId = NULL）には影響なし

-- 既存インデックスを削除
DROP INDEX IF EXISTS "Shop_placeId_idx";

-- UNIQUE 制約を追加（同時に UNIQUE インデックスが作成される）
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_placeId_key" UNIQUE ("placeId");
