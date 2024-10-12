import redisClient from "@redis/redis.client";
import {
  saveChatMessage,
  setLastMessage,
} from "@services/chat-service/chat.service";
import { ChatMessage } from "@prisma/client";
import { saveExpiryMessage } from "@services/redis-service/chat.service";
import { SentMessage } from "@models/chat.models";


const handleSelfDestruct = async (
  formattedMessage: any,
  expiresAfter: number
): Promise<number> => {
  const messageId = await redisClient.incr("messageId");
  await saveExpiryMessage(messageId, formattedMessage.chatId, expiresAfter);
  return messageId;
};

const handleNormalMessage = async (formattedMessage: any): Promise<number> => {
  const messageId = await saveChatMessage(formattedMessage);
  await setLastMessage(formattedMessage.chatId, messageId);

  return messageId;
};

export const sendMessage = async (
  userId: number,
  message: SentMessage<ChatMessage>
): Promise<ChatMessage | undefined> => {
  try {
    const formattedMessage = {
      ...message,
      senderId: userId,
      createdAt: new Date(),
    };

    let messageId: number = formattedMessage.selfDestruct
      ? await handleSelfDestruct(
          formattedMessage,
          formattedMessage.expiresAfter as number
        )
      : await handleNormalMessage(formattedMessage);

    return { id: messageId, ...formattedMessage };
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export default sendMessage;
