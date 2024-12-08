/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `GroupParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipant_id_key" ON "GroupParticipant"("id");
