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
): Promise<void> => {
  try {
    const participants: number[] = await getChatParticipantsIds(chatId);

    console.log(participants);
    
    participants &&
    participants.forEach((participant) => {
        if (clients.has(participant)) {
          const client = clients.get(participant);
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
  );
};

export const editMessage = async (
  message: EditChatMessages<ChatMessage>,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(message.chatId, clients, "editMessage", message);
};

export const deleteMessage = async (
  id: number,
  senderId: number,
  chatId: number,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(chatId, clients, "deleteMessage", id);
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

  broadCast(chatId, clients, "deleteMessage", id);
};
