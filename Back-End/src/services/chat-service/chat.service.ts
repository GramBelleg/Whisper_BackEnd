import db from "src/prisma/PrismaClient";
import { ChatMessage } from "@prisma/client";

type OmitId<T> = Omit<T, "id">;
export async function saveMessage(message: OmitId<ChatMessage>): Promise<number> {
  const savedMessage = await db.chatMessage.create({
    data: { ...message },
  });
  return savedMessage.id;
}
export async function setLastMessage(
  chatId: number,
  messageId: number
): Promise<void> {
  await db.chat.update({
    where: { id: chatId },
    data: { lastMessageId: messageId },
  });
}
