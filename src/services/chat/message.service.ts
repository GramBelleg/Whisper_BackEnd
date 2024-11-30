import db from "@DB";
import { Message } from "@prisma/client";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { ReceivedMessage, SentMessage } from "@models/messages.models";

//will be used with a web socket on(read) or on(delivered) for the status info view of the message
export const getOtherMessageStatus = async (excludeUserId: number, messageId: number) => {
    return await db.messageStatus.findFirst({
        where: { NOT: { userId: excludeUserId }, messageId },
        select: {
            time: true,
        },
    });
};

export const getForwardedFromMessage = async (
    forwarded: boolean,
    forwardedFromUserId: number | null
) => {
    if (!forwarded || !forwardedFromUserId) return null;
    const result = await db.user.findUnique({
        where: { id: forwardedFromUserId },
        select: {
            id: true,
            userName: true,
            profilePic: true,
        },
    });
    if (!result) return null;
    return result;
};

export const getMentions = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: {
            mentions: true,
        },
    });
    if (!result) return null;
    const userNames = await db.user.findMany({
        where: {
            id: {
                in: result.mentions,
            },
        },
        select: {
            userName: true,
        },
    });
    return userNames.map((user) => user.userName);
};

export const getParentMessageContent = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: {
            parentContent: true,
            parentMedia: true,
            parentType: true,
            parentExtension: true,
        },
    });
    if (!result) return null;
    const {
        parentContent: content,
        parentMedia: media,
        parentExtension: extension,
        parentType: type,
    } = result;
    return { content, media, extension, type };
};
export const getMessageSummary = async (id: number | null) => {
    if (!id) return null;
    const result = await db.message.findUnique({
        where: { id },
        select: {
            id: true,
            type: true,
            sender: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
            },
        },
    });
    return result;
};

export const getUserMessageStatus = async (userId: number, messageId: number) => {
    return await db.messageStatus.findFirst({
        where: { userId, messageId },
        select: {
            time: true,
        },
    });
};

export const getMessage = async (id: number) => {
    return await db.messageStatus.findUnique({
        where: { id },
        select: {
            message: {
                select: {
                    id: true,
                    content: true,
                    media: true,
                    type: true,
                    extension: true,
                    read: true,
                    delivered: true,
                },
            },
            time: true,
        },
    });
};

export const getPinnedMessages = async (chatId: number) => {
    return await db.message.findMany({
        where: {
            chatId,
            pinned: true,
        },
        select: {
            id: true,
            content: true,
        },
    });
};

export const getSingleMessage = async (userId: number, id: number) => {
    return await db.messageStatus.findUnique({
        where: {
            messageId_userId: {
                messageId: id,
                userId: userId,
            },
            deleted: false,
        },
        select: {
            message: true,
        },
    });
};

export const getMessages = async (userId: number, chatId: number) => {
    const messages = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                chatId,
            },
            deleted: false,
        },
        select: {
            message: true,
        },
        orderBy: {
            time: "asc",
        },
    });

    return messages.map((message) => message.message);
};

const saveMessageStatuses = async (userId: number, message: Message, participantIds: number[]) => {
    await db.messageStatus.createMany({
        data: participantIds.map((participantId) => ({
            userId: participantId,
            messageId: message.id,
            time: participantId == userId ? message.sentAt : new Date().toISOString(),
        })),
    });
};

const getMessageContent = async (messageId: number | null) => {
    if (!messageId) return null;
    const message = await db.message.findUnique({
        where: { id: messageId },
        select: { content: true, media: true, extension: true },
    });
    return message;
};

const enrichMessageWithParentContent = async (message: SentMessage) => {
    if (!message.parentMessageId) return message;

    const parentContentAndMedia = await getMessageContent(message.parentMessageId);
    if (!parentContentAndMedia) return message;

    return {
        ...message,
        parentContent: parentContentAndMedia.content,
        parentMedia: parentContentAndMedia.media,
        parentExtension: parentContentAndMedia.extension,
    };
};

export const saveMessage = async (userId: number, message: SentMessage): Promise<Message> => {
    const messageData = await enrichMessageWithParentContent(message);

    const savedMessage = await db.message.create({
        data: messageData,
    });

    const participantIds = await getChatParticipantsIds(message.chatId);
    await saveMessageStatuses(userId, savedMessage, participantIds);

    return savedMessage;
};

export const editMessage = async (id: number, content: string): Promise<Message> => {
    const editedMessage: Message = await db.message.update({
        where: { id },
        data: { content, edited: true },
    });
    return editedMessage;
};

export const pinMessage = async (id: number): Promise<Message> => {
    const pinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: true },
    });
    return pinnedMessage;
};

export const unpinMessage = async (id: number): Promise<Message> => {
    const unpinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: false },
    });
    return unpinnedMessage;
};

export const deleteMessagesForUser = async (userId: number, Ids: number[]): Promise<void> => {
    const existingMessages = await db.message.findMany({
        where: {
            id: { in: Ids },
        },
        select: { id: true },
    });

    const existingIds = existingMessages.map((message) => message.id);
    if (existingIds.length > 0) {
        await db.messageStatus.updateMany({
            where: {
                messageId: { in: existingIds },
                userId: userId,
            },
            data: { deleted: true },
        });
    }
};

export const deleteMessagesForAll = async (Ids: number[]): Promise<void> => {
    const existingMessages = await db.message.findMany({
        where: {
            id: { in: Ids },
        },
        select: { id: true },
    });

    const existingIds = existingMessages.map((message) => message.id);

    if (existingIds.length > 0) {
        await db.message.deleteMany({
            where: { id: { in: existingIds } },
        });
    }
};
