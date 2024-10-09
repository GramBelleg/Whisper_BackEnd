import { Socket } from "socket.io";
import { getChatParticipantsIDs } from "@services/chat-service/chat.participant.service";

export const sendMessage = async (
  message: string,
  clients: Map<number, Socket>
): Promise<void> => {
  try {
    const messageObject = JSON.parse(message);
    const participants: number[] = await getChatParticipantsIDs(
      messageObject.chatID
    );

    const receivers = participants.filter(
      (participant) => participant !== messageObject.senderID
    );

    receivers &&
      receivers.forEach((receiver) => {
        if (clients.has(receiver)) {
          const client = clients.get(receiver);
          if (client) {
            client.emit("receive", message);
          }
        }
      });
  } catch (error) {
    console.error(error);
  }
};
