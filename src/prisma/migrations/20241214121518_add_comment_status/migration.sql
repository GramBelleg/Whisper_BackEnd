/*
  Warnings:

  - You are about to drop the column `time` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `sentAt` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "time",
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CommentStatus" (
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentStatus_commentId_userId_key" ON "CommentStatus"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "CommentStatus" ADD CONSTRAINT "CommentStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentStatus" ADD CONSTRAINT "CommentStatus_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
