import { saveMessage } from "@services/chat/message.service";
import { setLastMessage, getSelfDestruct } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/chat/redis.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";
import { buildReceivedMessage } from "../messages/format.message";
import { validateChatAndUser } from "@validators/chat";


const handleSaveMessage = async (userId: number, message: SentMessage) => {
    message.expiresAfter = await getSelfDestruct(message.chatId);
    const savedMessage = await saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    if (!(await validateChatAndUser(userId, message.chatId, null))) {
        throw new Error("User can't access this chat");
    }
    const savedMessage = await handleSaveMessage(userId, message);
    if (message.expiresAfter) {
        await saveExpiringMessage(savedMessage.id, savedMessage.expiresAfter);
    }
    const result = await buildReceivedMessage(userId, savedMessage);
    return result;
};

export default handleSend;
