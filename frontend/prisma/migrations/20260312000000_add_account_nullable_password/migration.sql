-- User.passwordHash を nullable に変更（OAuthユーザーはパスワードなし）
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- OAuthプロバイダーとの紐付けを管理する Account テーブルを追加
CREATE TABLE "Account" (
  "id"                TEXT        NOT NULL,
  "userId"            TEXT        NOT NULL,
  "provider"          TEXT        NOT NULL,
  "providerAccountId" TEXT        NOT NULL,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- provider + providerAccountId の組み合わせはユニーク
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_key"
  UNIQUE ("provider", "providerAccountId");

-- User への外部キー（User削除時にAccountも削除）
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
