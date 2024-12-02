-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "keyId" INTEGER;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "key" TEXT;

-- CreateTable
CREATE TABLE "PublicKey" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "participantUserId" INTEGER,
    "chatId" INTEGER,

    CONSTRAINT "PublicKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicKey_userId_idx" ON "PublicKey"("userId");

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "PublicKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicKey" ADD CONSTRAINT "PublicKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
