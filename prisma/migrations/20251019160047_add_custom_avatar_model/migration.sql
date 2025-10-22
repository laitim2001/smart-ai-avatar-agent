-- CreateTable
CREATE TABLE "custom_avatars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sourcePhoto" TEXT,
    "rpmId" TEXT,
    "rpmData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_avatars_userId_createdAt_idx" ON "custom_avatars"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "custom_avatars_userId_isActive_idx" ON "custom_avatars"("userId", "isActive");

-- AddForeignKey
ALTER TABLE "custom_avatars" ADD CONSTRAINT "custom_avatars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
