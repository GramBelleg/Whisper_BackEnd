import { Socket } from "socket.io";
import {
  getChatId,
  removeTempMessage,
} from "@services/redis-service/chat.service";
import { getChatParticipantsIds } from "@services/chat-service/chat.participant.service";
import { ChatMessage } from "@prisma/client";
import { EditChatMessages } from "@models/chat.models";

const broadCast = async (
  chatId: number,
  clients: Map<number, Socket>,
  emitEvent: string,
  emitMessage: any,
  senderId: number,
  sendToAll: boolean = false
): Promise<void> => {
  try {
    const participants: number[] = await getChatParticipantsIds(chatId);

    const receivers = sendToAll
      ? participants
      : participants.filter((participant) => participant !== senderId);

    receivers &&
      receivers.forEach((receiver) => {
        if (clients.has(receiver)) {
          const client = clients.get(receiver);
          if (client) {
            client.emit(emitEvent, emitMessage);
          }
        }
      });
  } catch (error) {
    console.error(error);
  }
};

export const sendMessage = async (
  message: ChatMessage,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(
    message.chatId,
    clients,
    "receiveMessage",
    message,
    message.senderId
  );
};

export const editMessage = async (
  message: EditChatMessages<ChatMessage>,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(message.chatId, clients, "editMessage", message, message.senderId);
};

export const deleteMessage = async (
  id: number,
  senderId: number,
  chatId: number,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(chatId, clients, "deleteMessage", id, senderId);
};

export const notifyExpiry = async (
  key: string,
  clients: Map<number, Socket>
): Promise<void> => {
  const match = key.match(/\d+/);
  if (!match) return;

  const id: number = Number(match[0]);
  const chatId: number = await getChatId(id);
  await removeTempMessage(id);

  broadCast(chatId, clients, "deleteMessage", id, 0, true);
};
