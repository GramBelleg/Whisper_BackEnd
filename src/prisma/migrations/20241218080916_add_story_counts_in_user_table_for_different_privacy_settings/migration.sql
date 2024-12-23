/*
  Warnings:

  - You are about to drop the column `hasStory` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hasStory",
ADD COLUMN     "contactStory" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "everyOneStory" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "storyCount" INTEGER NOT NULL DEFAULT 0;
