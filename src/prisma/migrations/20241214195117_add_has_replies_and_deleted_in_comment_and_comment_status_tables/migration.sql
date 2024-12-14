/*
  Warnings:

  - Added the required column `hasReplies` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_id_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "hasReplies" BOOLEAN NOT NULL DEFAULT false;

--AlterTable
ALTER TABLE "Comment" ADD COLUMN     "hasParent" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "CommentStatus" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_id_fkey" FOREIGN KEY ("id") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
