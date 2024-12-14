/*
  Warnings:

  - You are about to drop the column `hasParent` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `hasReplies` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "hasParent",
DROP COLUMN "hasReplies",
ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0;
