-- CreateIndex
CREATE INDEX "Message_content_idx" ON "Message"("content");

-- CreateIndex
CREATE INDEX "Message_attachmentName_idx" ON "Message"("attachmentName");
