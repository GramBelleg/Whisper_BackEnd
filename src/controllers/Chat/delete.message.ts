import { deleteMessage } from "@services/chat/message.service";
import { setNewLastMessage } from "@services/chat/chat.service";

export const handleDeleteMessage = async (id: number, chatId: number) => {
    try {
        await deleteMessage(id);
        await setNewLastMessage(chatId);
    } catch (error) {
        console.error("Error deleting message:", error);
    }
};

export default deleteMessage;
