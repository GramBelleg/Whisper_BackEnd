import { editMessage, pinMessage, unpinMessage } from "@services/chat/message.service";
import { editMessageInES } from "@services/elasticsearch/message.service";

export const handleEditContent = async (messageId: number, content: string) => {
    try {
        const editedMessage = await editMessage(messageId, content);
        await editMessageInES(messageId, content);
        return { id: editedMessage.id, content: editedMessage.content };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handlePinMessage = async (messageId: number): Promise<number | null> => {
    try {
        const pinnedMessage = await pinMessage(messageId);
        return pinnedMessage.id;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleUnpinMessage = async (messageId: number): Promise<number | null> => {
    try {
        const unpinnedMessage = await unpinMessage(messageId);
        return unpinnedMessage.id;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleEditContent;
