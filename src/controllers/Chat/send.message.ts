import { saveChatMessage } from "@services/Chat/message.service";
import { setLastMessage } from "@services/Chat/chat.service";
import { ChatMessage } from "@prisma/client";
import { saveExpiringMessage } from "@services/redis/chat.service";
import { SaveableMessage } from "@models/chat.models";

const saveMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    const savedMessage: ChatMessage = await saveChatMessage(message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (message: SaveableMessage): Promise<ChatMessage | null> => {
    try {
        const savedMessage: ChatMessage | null = await saveMessage(message);

        if (message.selfDestruct) {
            await saveExpiringMessage(savedMessage);
        }

        return savedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
