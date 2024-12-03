-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "draftContent" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "draftParentContent" TEXT,
ADD COLUMN     "draftParentExtension" TEXT,
ADD COLUMN     "draftParentMedia" TEXT,
ADD COLUMN     "draftParentMessageId" INTEGER,
ADD COLUMN     "draftTime" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_draftParentMessageId_fkey" FOREIGN KEY ("draftParentMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
