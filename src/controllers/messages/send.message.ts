import { Message } from "@prisma/client";
import { saveMessage } from "@services/chat/message.service";
import { setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/redis/chat.service";
import { ReceivedMessage, SentMessage } from "@models/chat.models";
import { buildReceivedMessage } from "../messages/format.message";

const handleSaveMessage = async (userId: number, message: SentMessage): Promise<Message> => {
    const savedMessage: Message = await saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    try {
        const savedMessage: Message | null = await handleSaveMessage(userId, message);
        if (message.selfDestruct) {
            await saveExpiringMessage(savedMessage);
        }
        const result = await buildReceivedMessage(userId, savedMessage);

        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
