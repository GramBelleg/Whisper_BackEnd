/*
  Warnings:

  - You are about to drop the column `channelId` on the `ChannelParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `isMuted` on the `ChannelParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChannelParticipant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `ChannelParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelParticipant" DROP CONSTRAINT "ChannelParticipant_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelParticipant" DROP CONSTRAINT "ChannelParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_chatId_fkey";

-- DropIndex
DROP INDEX "ChannelParticipant_channelId_userId_key";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "ChannelParticipant" DROP COLUMN "channelId",
DROP COLUMN "isMuted",
DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "ChannelParticipant_id_seq";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "maxSize" SET DEFAULT 1000;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelParticipant_id_key" ON "ChannelParticipant"("id");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelParticipant" ADD CONSTRAINT "ChannelParticipant_id_fkey" FOREIGN KEY ("id") REFERENCES "ChatParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
