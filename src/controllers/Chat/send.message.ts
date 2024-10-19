import { saveMessage } from "@services/chat/message.service";
import { setLastMessage } from "@services/chat/chat.service";
import { Message } from "@prisma/client";
import { saveExpiringMessage } from "@services/redis/chat.service";
import { SaveableMessage } from "@models/chat.models";

const handleSaveMessage = async (message: SaveableMessage): Promise<Message> => {
    const savedMessage: Message = await saveMessage(message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (message: SaveableMessage): Promise<Message | null> => {
    try {
        const savedMessage: Message | null = await handleSaveMessage(message);

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
