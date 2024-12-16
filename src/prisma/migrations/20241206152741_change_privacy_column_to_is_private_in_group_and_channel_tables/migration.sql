/*
  Warnings:

  - You are about to drop the column `privacy` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `privacy` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "privacy",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "privacy",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT true;
