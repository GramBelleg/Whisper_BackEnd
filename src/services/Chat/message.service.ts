import db from "@DB";
import { Message } from "@prisma/client";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { SentMessage } from "@models/chat.models";

//will be used with a web socket on(read) or on(delivered) for the status info view of the message
export const getMessageStatus = async (excludeUserId: number, messageId: number) => {
    return await db.messageStatus.findFirst({
        where: { NOT: { userId: excludeUserId }, messageId },
        select: {
            time: true,
        },
    });
};

export const getMessageSummary = async (id: number) => {
    return await db.message.findUnique({
        where: { id },
        select: {
            content: true,
            media: true,
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
                    type: true,
                    sentAt: true,
                }
            },
            time: true,
        }
    });
}

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

    return messages;
};

const saveMessageStatuses = async (
    userId: number,
    message: Message,
    participantIds: number[]
) => {
    await db.messageStatus.createMany({
        data: participantIds.map((participantId) => ({
            userId: participantId,
            messageId: message.id,
            ...(participantId === userId && { time: message.sentAt }),
        })),
    });
};

export const saveMessage = async (userId: number, message: SentMessage): Promise<Message> => {
    const savedMessage = await db.message.create({
        data: { ...message },
    });
    const participantIds = await getChatParticipantsIds(message.chatId);
    await saveMessageStatuses(userId, savedMessage, participantIds);

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
