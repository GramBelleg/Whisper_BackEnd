import { Message } from "@prisma/client";
import { ReceivedMessage } from "@models/chat.models";
import { getMessageStatus, getMessageSummary } from "@services/chat1/message.service";

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage> => {
    const parentMessageId = message.parentMessageId;
    const parentMessage = parentMessageId ? await getMessageSummary(parentMessageId) : null;
    const time = (await getMessageStatus(userId, message.id)) as { time: Date };

    return {
        parentMessage,
        ...message,
        ...time,
    };
};
