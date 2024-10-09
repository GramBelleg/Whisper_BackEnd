import { Socket } from "socket.io";
import { getChatParticipantsIds } from "@services/chat-service/chat.participant.service";

export const sendMessage = async (
  senderId: number,
  message: { message: string; chatId: number },
  clients: Map<number, Socket>
): Promise<void> => {
  try {
    const participants: number[] = await getChatParticipantsIds(message.chatId);

    const receivers = participants.filter(
      (participant) => participant !== senderId
    );
    const messageSent = {
      ...message,
      senderId,
      createdAt: new Date().toISOString(),
    };
    receivers &&
      receivers.forEach((receiver) => {
        if (clients.has(receiver)) {
          const client = clients.get(receiver);
          if (client) {
            client.emit("receiveMessage", messageSent);
          }
        }
      });
  } catch (error) {
    console.error(error);
  }
};
