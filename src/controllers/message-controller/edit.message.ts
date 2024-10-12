import { editChatMessage } from "@services/chat-service/chat.service";
import { ChatMessage } from "@prisma/client";
import { EditChatMessages, OmitSender } from "@models/chat.models";

export const editMessage = async (
  userId: number,
  message: OmitSender<EditChatMessages<ChatMessage>>
): Promise<EditChatMessages<ChatMessage> | undefined> => {
  try {
    await editChatMessage(message.id, message.content);

    const formattedMessage = {
      ...message,
      senderId: userId,
    };

    return formattedMessage;
  } catch (error) {
    console.error("Error editing message:", error);
  }
};

export default editMessage;
