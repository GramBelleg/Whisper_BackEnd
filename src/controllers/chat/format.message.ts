import { Message } from "@prisma/client";
import { ReceivedMessage } from "@models/chat.models";
import {
    getOtherMessageStatus,
    getUserMessageStatus,
    getMessageSummary,
} from "@services/chat/message.service";

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage[]> => {
    const parentMessageId = message.parentMessageId;
    const parentMessage = parentMessageId ? await getMessageSummary(parentMessageId) : null;
    const senderTime = (await getUserMessageStatus(userId, message.id)) as { time: Date };
    const receiverTime = (await getOtherMessageStatus(userId, message.id)) as { time: Date };

    const senderMessage = {
        parentMessage,
        ...message,
        ...senderTime,
    };
    const receiverMessage = {
        parentMessage,
        ...message,
        ...receiverTime,
    };
    return [senderMessage, receiverMessage];
};
