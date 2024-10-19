import { editChatMessage, pinChatMessage, unpinChatMessage } from "@services/chat/message.service";
import { Message } from "@prisma/client";
import { EditableMessage, MessageReference } from "@models/chat.models";

export const editContent = async (message: EditableMessage): Promise<Message | null> => {
    try {
        const editedMessage = await editChatMessage(message.id, message.content);
        return editedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const pinMessage = async (message: MessageReference): Promise<Message | null> => {
    try {
        const pinnedMessage = await pinChatMessage(message.id);
        return pinnedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const unpinMessage = async (message: MessageReference): Promise<Message | null> => {
    try {
        const unpinnedMessage = await unpinChatMessage(message.id);
        return unpinnedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default editContent;
