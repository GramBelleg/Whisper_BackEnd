import { ReceivedMessage } from "@models/messages.models";
import { Message } from "@prisma/client";
import {
    getOtherMessageStatus,
    getUserMessageStatus,
    getMessageSummary,
} from "@services/chat/message.service";

export const buildMessageWithTime = async (
    userId: number,
    message: Omit<ReceivedMessage, "time">
): Promise<ReceivedMessage[]> => {
    const addTimeHandler = async (handler: Function) => {
        const timeData = await handler(userId, message.id);
        if (!timeData) {
            throw new Error("Time data is null");
        }
        return { ...message, ...timeData };
    };

    const senderMessage = await addTimeHandler(getUserMessageStatus);
    const receiverMessage = await addTimeHandler(getOtherMessageStatus);

    return [senderMessage, receiverMessage];
};

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage[]> => {
    const parentSummary = await getMessageSummary(message.parentMessageId);

    const { parentMessageId, ...messageWithoutParentId } = message;

    const result = { ...messageWithoutParentId, parentMessage: parentSummary };

    return buildMessageWithTime(userId, result);
};
