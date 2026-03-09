-- AddUniqueConstraint: ShopTag(shopId, tagId) の組み合わせは一意
-- 同一店舗に同じタグが重複登録されることを防ぐ
CREATE UNIQUE INDEX IF NOT EXISTS "ShopTag_shopId_tagId_key" ON "ShopTag"("shopId", "tagId");
