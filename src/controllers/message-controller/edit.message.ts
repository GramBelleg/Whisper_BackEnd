import { editChatMessage } from "@services/chat-service/chat.service";
import { ChatMessage } from "@prisma/client";
import { EditableMessage } from "@models/message.models";

export const editContent = async (message: EditableMessage): Promise<ChatMessage | null> => {
    try {
        const editedMessage = await editChatMessage(message.id, message.content);
        return editedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default editContent;
