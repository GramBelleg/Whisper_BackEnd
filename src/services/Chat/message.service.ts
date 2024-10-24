import db from "@DB";
import { Message } from "@prisma/client";
import { SaveableMessage } from "@models/chat.models";

export const getMessages = async (userId: number, chatId: number) => {
    const messages = await db.messageStatus.findMany({
        where: {
            userId,
            message: {
                chatId,
            },
            deleted: false,
        },
        include: {
            message: {
                include: {
                    sender: {
                        select: { id: true, profilePic: true, userName: true },
                    },
                },
            },
        },
        orderBy: {
            message: { createdAt: "asc" },
        },
    });
    return messages;
};
export const saveMessage = async (message: SaveableMessage): Promise<Message> => {
    const savedMessage = await db.message.create({
        data: { ...message },
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

export const deleteMessage = async (id: number): Promise<void> => {
    const message = await db.message.findUnique({
        where: { id },
    });

    if (message) {
        await db.message.delete({
            where: { id },
        });
    }
};
