import { saveMessage } from "@services/chat/message.service";
import { setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/chat/redis.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";
import { buildReceivedMessage } from "../messages/format.message";

export const handleSaveMessage = async (userId: number, message: SentMessage) => {
    const savedMessage = await saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};


export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    try {
        const savedMessage = await handleSaveMessage(userId, message);
        if (message.selfDestruct || message.expiresAfter) {
            await saveExpiringMessage(savedMessage.id, savedMessage.expiresAfter);
        }
        const result = await buildReceivedMessage(userId, savedMessage);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
