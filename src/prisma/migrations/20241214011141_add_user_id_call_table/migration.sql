/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `Call` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Call` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CallEndStatus" AS ENUM ('MISSED', 'CANCELLED', 'JOINED');

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Call_messageId_key" ON "Call"("messageId");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
