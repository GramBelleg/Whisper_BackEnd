import { saveMessage } from "@services/chat/message.service";
import { getChatParticipantsIds, setLastMessage } from "@services/chat/chat.service";
import { saveExpiringMessage } from "@services/chat/redis.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";
import { buildReceivedMessage } from "../messages/format.message";

const handleSaveMessage = async (userId: number, message: SentMessage) => {
    const savedMessage = await saveMessage(userId, message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

const indexMessage = async (userId: number, ReceivedMessage: ReceivedMessage) => {
    const {
        sender: { id: senderId, userName, profilePic },
        id: messageId,
        ...messageProps
    } = ReceivedMessage;

    const indexedMessage = {
        messageId,
        userId,
        senderId,
        userName,
        profilePic,
        media: messageProps.media,
        content: messageProps.content,
        chatId: messageProps.chatId,
        time: messageProps.time,
    };
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
        const result = await buildReceivedMessage(userId, savedMessage);

        const participants = await getChatParticipantsIds(savedMessage.chatId);
        for (const participant of participants) {
            const senderIdx = userId === participant ? 0 : 1;
            await indexMessage(participant, result[senderIdx]);
        }

        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
