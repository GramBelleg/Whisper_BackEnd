import { ReceivedMessage, ToBeFormattedMessage } from "@models/messages.models";
import { Message } from "@prisma/client";
import {
    getOtherMessageStatus,
    getUserMessageStatus,
    getMessageSummary,
    getForwardedFromMessage,
} from "@services/chat/message.service";

const addTimeHandler = async (
    handler: Function,
    userId: number,
    messageId: number,
    message: any
) => {
    const timeData = await handler(userId, messageId);
    if (!timeData) throw new Error("Time data is null");
    return { ...message, ...timeData };
};

export const buildMessageWithCustomObjects = async (
    userId: number,
    message: ToBeFormattedMessage
): Promise<ReceivedMessage[]> => {
    const senderMessage = await addTimeHandler(getUserMessageStatus, userId, message.id, message);
    const receiverMessage = await addTimeHandler(
        getOtherMessageStatus,
        userId,
        message.id,
        message
    );

    const forwardedFrom = await getForwardedFromMessage(
        message.forwarded,
        message.forwardedFromUserId
    );

    const messages = [senderMessage, receiverMessage].map((msg) => {
        const { forwardedFromUserId, parentMessageId, ...rest } = msg;
        return { ...rest, forwardedFrom };
    });

    return messages;
};

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage[]> => {
    const parentSummary = await getMessageSummary(message.parentMessageId);
    const result = { ...message, parentMessage: parentSummary };
    return buildMessageWithCustomObjects(userId, result);
};
