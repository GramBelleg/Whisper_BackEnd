import { saveMessage } from "@services/chat/message.service";
import { setLastMessage } from "@services/chat/chat.service";
import { Message } from "@prisma/client";
import { getMessage } from "@services/chat/message.service";
import { saveExpiringMessage } from "@services/redis/chat.service";
import { ReceivedMessage, SentMessage } from "@models/chat.models";

const handleSaveMessage = async (message: SentMessage): Promise<Message> => {
    const savedMessage: Message = await saveMessage(message);
    await setLastMessage(message.chatId, savedMessage.id);
    return savedMessage;
};

export const handleSend = async (message: SentMessage): Promise<ReceivedMessage | null> => {
    try {
        const savedMessage: Message | null = await handleSaveMessage(message);

        if (message.selfDestruct) {
            await saveExpiringMessage(savedMessage);
        }
        const parentMessage = message.parentMessageId
            ? await getMessage(message.parentMessageId)
            : null;

        const messageStatus = { read: null, delivered: null };
        return { parentMessage: parentMessage, messageStatus, ...savedMessage };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleSend;
