-- CreateTable
CREATE TABLE "user_favorite_avatars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_favorite_avatars_userId_idx" ON "user_favorite_avatars"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_avatars_avatarId_idx" ON "user_favorite_avatars"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_avatars_userId_avatarId_key" ON "user_favorite_avatars"("userId", "avatarId");

-- AddForeignKey
ALTER TABLE "user_favorite_avatars" ADD CONSTRAINT "user_favorite_avatars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_avatars" ADD CONSTRAINT "user_favorite_avatars_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
