import { Socket } from "socket.io";
import { getChatParticipantsIds } from "@services/chat-service/chat.participant.service";
import { OmitDate } from "../socket.types";
import { ChatMessage } from "@prisma/client";

const broadCast = async (
  senderId: number,
  chatId: number,
  clients: Map<number, Socket>,
  emitEvent: string,
  emitMessage: any
): Promise<void> => {
  try {
    const participants: number[] = await getChatParticipantsIds(chatId);

    const receivers = participants.filter(
      (participant) => participant !== senderId
    );
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
  broadCast(message.senderId, message.chatId, clients, "receiveMessage", message);
};

export const editMessage = async (
  message: OmitDate<ChatMessage>,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(message.senderId, message.chatId, clients, "editMessage", message);
};

export const deleteMessage = async (
  id: number,
  senderId: number,
  chatId: number,
  clients: Map<number, Socket>
): Promise<void> => {
  broadCast(senderId, chatId, clients, "deleteMessage", id );
};
