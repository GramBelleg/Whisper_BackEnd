/*
  Warnings:

  - You are about to drop the column `groupId` on the `GroupParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `isMuted` on the `GroupParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GroupParticipant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupParticipant" DROP CONSTRAINT "GroupParticipant_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupParticipant" DROP CONSTRAINT "GroupParticipant_userId_fkey";

-- DropIndex
DROP INDEX "GroupParticipant_groupId_userId_key";

-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "picture" TEXT,
ALTER COLUMN "maxSize" SET DEFAULT 100,
ALTER COLUMN "privacy" SET DEFAULT 'Private';

-- AlterTable
ALTER TABLE "GroupParticipant" DROP COLUMN "groupId",
DROP COLUMN "isMuted",
DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "GroupParticipant_id_seq";

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_id_fkey" FOREIGN KEY ("id") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
