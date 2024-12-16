import {
    DraftMessage,
    ReceivedDraftMessage,
    ReceivedMessage,
    ToBeFormattedMessage,
} from "@models/messages.models";
import { Message } from "@prisma/client";
import {
    getOtherMessageTime,
    getUserMessageTime,
    getMessageSummary,
    getForwardedFromMessage,
    getParentMessageContent,
    getMentions,
    getDraftParentMessageContent,
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
    const senderMessage = await addTimeHandler(getUserMessageTime, userId, message.id, message);
    const receiverMessage = await addTimeHandler(getOtherMessageTime, userId, message.id, message);
    const messages: ReceivedMessage[] = [senderMessage, receiverMessage].map((msg) => {
        const {
            forwardedFromUserId,
            parentMessageId,
            senderId,
            parentContent,
            parentMedia,
            parentExtension,
            parentType,
            ...rest
        } = msg;
        return { ...rest };
    });

    return messages;
};

export const formatParentMessage = async (parentMessage: any, parentMessageContent: any | null) => {
    if (!parentMessage) return null;
    if (!parentMessageContent) throw new Error("Parent message content not found");
    const senderInfo = {
        senderId: parentMessage.sender.id,
        senderName: parentMessage.sender.userName,
        senderProfilePic: parentMessage.sender.profilePic,
    };
    return {
        id: parentMessage.id,
        ...senderInfo,
        ...parentMessageContent,
    };
};

export const buildParentMessage = async (messageId: number, parentId: number | null) => {
    const parentSummary = await getMessageSummary(parentId);
    const parentMessageContent = await getParentMessageContent(messageId);
    return await formatParentMessage(parentSummary, parentMessageContent);
};

export const buildDraftParentMessage = async (
    userId: number,
    chatId: number,
    parentId: number | null
) => {
    const parentSummary = await getMessageSummary(parentId);
    const parentMessageContent = await getDraftParentMessageContent(userId, chatId);
    return await formatParentMessage(parentSummary, parentMessageContent);
};

export const buildReceivedMessage = async (
    userId: number,
    message: Message
): Promise<ReceivedMessage[]> => {
    const formattedParent = await buildParentMessage(message.id, message.parentMessageId);
    const sender = await getSenderInfo(message.senderId);

    const mentions = await getMentions(message.id);

    const forwardedFrom = await getForwardedFromMessage(
        message.forwarded,
        message.forwardedFromUserId
    );

    const result: ToBeFormattedMessage = {
        ...message,
        parentMessage: formattedParent,
        sender: sender!,
        mentions,
        forwardedFrom,
    };

    return buildMessageWithCustomObjects(userId, result);
};

export const buildDraftedMessage = async (
    userId: number,
    chatId: number,
    message: DraftMessage
): Promise<ReceivedDraftMessage> => {
    if (!message.draftParentMessageId) return { ...message, parentMessage: null };
    const formattedParent = await buildDraftParentMessage(
        userId,
        chatId,
        message.draftParentMessageId
    );
    return { ...message, parentMessage: formattedParent };
};
