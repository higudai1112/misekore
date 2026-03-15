-- 1日あたりのAPI呼び出し回数・お店登録回数を管理するログ
CREATE TABLE "DailyUsageLog" (
    "id"           TEXT         NOT NULL,
    "userId"       TEXT         NOT NULL,
    "dayKey"       TEXT         NOT NULL,
    "apiCallCount" INTEGER      NOT NULL DEFAULT 0,
    "shopRegCount" INTEGER      NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyUsageLog_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "DailyUsageLog"
    ADD CONSTRAINT "DailyUsageLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "DailyUsageLog_userId_dayKey_key" ON "DailyUsageLog"("userId", "dayKey");
CREATE INDEX "DailyUsageLog_userId_dayKey_idx" ON "DailyUsageLog"("userId", "dayKey");
