import { saveMessage } from "@services/chat/message.service";
import { setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/redis/chat.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";
import { buildMessageWithCustomObjects } from "../messages/format.message";

const handleSaveMessage = async (userId: number, message: SentMessage) => {
    const { parentMessage, ...messageWithoutParent } = message;
    const messageData = { ...messageWithoutParent, parentMessageId: parentMessage?.id };

    const savedMessage = await saveMessage(userId, messageData);

    const savedMessageWithReply = { ...savedMessage, parentMessage };

    await setLastMessage(message.chatId, savedMessage.id);

    return savedMessageWithReply;
};

export const handleSend = async (
    userId: number,
    message: SentMessage
): Promise<ReceivedMessage[] | null> => {
    try {
        const savedMessage = await handleSaveMessage(userId, message);
        if (message.selfDestruct) {
            await saveExpiringMessage(savedMessage.id, savedMessage.expiresAfter);
        }
        const result = await buildMessageWithCustomObjects(userId, savedMessage);

        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
