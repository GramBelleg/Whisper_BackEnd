import db from "@DB";
import { Message } from "@prisma/client";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { SentMessage } from "@models/chat.models";

//will be used with a web socket on(read) or on(delivered) for the status info view of the message
export const getMessageStatus = async (messageId: number) => {
    return await db.messageStatus.findMany({
        where: { messageId },
        select: {
            userId: true,
            read: true,
            delivered: true,
        },
    });
};

export const getMessage = async (id: number) => {
    return await db.message.findUnique({
        where: { id },
        select: {
            content: true,
            media: true,
        },
    });
};

export const getMessages = async (userId: number, chatId: number) => {
    const result = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                chatId,
            },
            deleted: false,
        },
        select: {
            message: true,
            deleted: true,
        },
        orderBy: {
            message: { createdAt: "asc" },
        },
    });
    const messages = await Promise.all(
        result.map(async (messageStatus) => {
            const parentMessageId = messageStatus.message.parentMessageId;
            const parentMessage = parentMessageId ? await getMessage(parentMessageId) : null;
            return {
                ...messageStatus.message,
                parentMessage,
            };
        })
    );
    return messages;
};

export const saveMessage = async (message: SentMessage): Promise<Message> => {
    const savedMessage = await db.message.create({
        data: { ...message },
    });
    const participantIds = await getChatParticipantsIds(message.chatId);
    await db.messageStatus.createMany({
        data: participantIds.map((userId) => ({
            userId,
            messageId: savedMessage.id,
        })),
    });
    return savedMessage;
};

export const editMessage = async (id: number, content: string): Promise<Message> => {
    const editedMessage: Message = await db.message.update({
        where: { id },
        data: { content },
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
