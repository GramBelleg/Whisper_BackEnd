/*
  Warnings:

  - You are about to drop the column `selfDestruct` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "selfDestruct" INTEGER;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "selfDestruct";
