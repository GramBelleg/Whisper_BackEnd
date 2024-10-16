import { deleteChatMessage } from "@services/chat-service/message.service";
import { setNewLastMessage } from "@services/chat-service/chat.service";

export const deleteMessage = async (id: number, chatId: number) => {
    try {
        await deleteChatMessage(id);
        await setNewLastMessage(chatId);
    } catch (error) {
        console.error("Error deleting message:", error);
    }
};

export default deleteMessage;
