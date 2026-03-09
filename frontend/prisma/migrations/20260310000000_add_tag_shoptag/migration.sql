-- CreateTable: Tag
-- IF NOT EXISTS を使用し、既存DBでも安全に実行できるようにする
CREATE TABLE IF NOT EXISTS "Tag" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex: Tag.name
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");

-- CreateTable: ShopTag
CREATE TABLE IF NOT EXISTS "ShopTag" (
    "id"        TEXT         NOT NULL,
    "shopId"    TEXT         NOT NULL,
    "tagId"     TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShopTag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: ShopTag → Shop（制約が既に存在する場合は無視）
DO $$ BEGIN
    ALTER TABLE "ShopTag"
        ADD CONSTRAINT "ShopTag_shopId_fkey"
        FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey: ShopTag → Tag（制約が既に存在する場合は無視）
DO $$ BEGIN
    ALTER TABLE "ShopTag"
        ADD CONSTRAINT "ShopTag_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "Tag"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
