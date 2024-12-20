-- DropForeignKey
ALTER TABLE "GroupParticipant" DROP CONSTRAINT "GroupParticipant_id_fkey";

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_id_fkey" FOREIGN KEY ("id") REFERENCES "ChatParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
