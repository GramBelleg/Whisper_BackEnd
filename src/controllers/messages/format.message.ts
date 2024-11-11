import { ReceivedMessage, ToBeFormattedMessage } from "@models/messages.models";
import { Message } from "@prisma/client";
import {
    getOtherMessageStatus,
    getUserMessageStatus,
    getMessageSummary,
    getForwardedFromMessage,
    getParentMessageContent,
    getMentions,
} from "@services/chat/message.service";

import { getSenderInfo } from "@services/user/user.service";

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

    const messages: ReceivedMessage[] = [senderMessage, receiverMessage].map((msg) => {
        const {
            forwardedFromUserId,
            parentMessageId,
            senderId,
            parentContent,
            parentMedia,
            ...rest
        } = msg;
        return { ...rest };
    });

    return messages;
};

const formatParentMessage = async (parentMessage: any | null, messageId: number) => {
    if (!parentMessage) return null;
    const parentMessageContent = await getParentMessageContent(messageId);
    if (!parentMessageContent) throw new Error("Parent message content not found");
    const senderInfo = {
        id: parentMessage.id,
        senderId: parentMessage.sender.id,
        senderName: parentMessage.sender.userName,
        senderProfilePic: parentMessage.sender.profilePic,
    };
    return { ...senderInfo, ...parentMessageContent };
};

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage[]> => {
    const parentSummary = await getMessageSummary(message.parentMessageId);
    const formattedParent = await formatParentMessage(parentSummary, message.id);
    const sender = await getSenderInfo(message.senderId);
    if (!sender) throw new Error("Sender not found");

    const mentions = await getMentions(message.id);

    const forwardedFrom = await getForwardedFromMessage(
        message.forwarded,
        message.forwardedFromUserId
    );

    const result: ToBeFormattedMessage = {
        ...message,
        parentMessage: formattedParent,
        sender,
        mentions,
        forwardedFrom,
    };
    return buildMessageWithCustomObjects(userId, result);
};
