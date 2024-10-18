import { editMessage, pinMessage, unpinMessage } from "@services/Chat/message.service";
import { Message } from "@prisma/client";
import { EditableMessage, MessageReference } from "@models/chat.models";

export const handleEditContent = async (message: EditableMessage): Promise<Message | null> => {
    try {
        const editedMessage = await editMessage(message.id, message.content);
        return editedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handlePinMessage = async (message: MessageReference): Promise<Message | null> => {
    try {
        const pinnedMessage = await pinMessage(message.id);
        return pinnedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleUnpinMessage = async (message: MessageReference): Promise<Message | null> => {
    try {
        const unpinnedMessage = await unpinMessage(message.id);
        return unpinnedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleEditContent;
