import db from "src/prisma/PrismaClient";
import { ChatMessage } from "@prisma/client";

type OmitId<T> = Omit<T, "id">;
export async function saveChatMessage(
  message: OmitId<ChatMessage>
): Promise<number> {
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
export async function editChatMessage(
  id: number,
  content: string
): Promise<void> {
  await db.chatMessage.update({
    where: { id },
    data: { content },
  });
}

export async function deleteChatMessage(id: number): Promise<void> {
  await db.chatMessage.delete({
    where: { id },
  });
}

export async function setNewLastMessage(
  chatId: number
): Promise<number | null> {
  const lastMessage = await db.chatMessage.findFirst({
    where: { chatId },
    orderBy: { createdAt: "desc" },
  });
  const lastMessageId = lastMessage ? lastMessage.id : null;
  await db.chat.update({
    where: { id: chatId },
    data: { lastMessageId },
  });
  return lastMessageId;
}

