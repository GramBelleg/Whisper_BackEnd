import { saveChatMessage, setLastMessage } from "@services/chat-service/chat.service";
import { ChatMessage } from "@prisma/client";
import { saveExpiryMessage } from "@services/redis-service/chat.service";
import { SaveableMessage } from "@models/message.models";

const saveSelfDestructMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    const savedMessage = await saveExpiryMessage(message);
    return savedMessage;
};

const saveRegularMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    const savedMessage: ChatMessage = await saveChatMessage(message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (message: SaveableMessage): Promise<ChatMessage | null> => {
    try {
        const savedMessage: ChatMessage | null = message.selfDestruct
            ? await saveSelfDestructMessage(message)
            : await saveRegularMessage(message);

        return savedMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
