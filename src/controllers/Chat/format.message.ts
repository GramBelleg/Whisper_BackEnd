import { Message } from "@prisma/client";
import { ReceivedMessage } from "@models/chat.models";
import { getMessageStatus, getMessageSummary } from "@services/chat/message.service";

export const buildReceivedMessage = async (userId: number, message: Message): Promise<ReceivedMessage | null> => {
    const parentMessageId = message.parentMessageId;
    const parentMessage = parentMessageId ? await getMessageSummary(parentMessageId) : null;
    const time = (await getMessageStatus(userId, message.id));
    if(!time) return null;
    return {
        parentMessage,
        ...message,
        ...time,
    };
};
