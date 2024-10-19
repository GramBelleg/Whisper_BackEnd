import db from "@DB";
import { Message } from "@prisma/client";
import { SaveableMessage } from "@models/chat.models";

export const getChatMessages = async (chatId: number): Promise<Message[]> => {
    const messages = await db.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
    });
    return messages;
};

export const saveChatMessage = async (message: SaveableMessage): Promise<Message> => {
    const savedMessage = await db.message.create({
        data: { ...message },
    });
    return savedMessage;
};

export const editChatMessage = async (id: number, content: string): Promise<Message> => {
    const editedMessage: Message = await db.message.update({
        where: { id },
        data: { content },
    });
    return editedMessage;
};

export const pinChatMessage = async (id: number): Promise<Message> => {
    const pinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: true },
    });
    return pinnedMessage;
};

export const unpinChatMessage = async (id: number): Promise<Message> => {
    const unpinnedMessage: Message = await db.message.update({
        where: { id },
        data: { pinned: false },
    });
    return unpinnedMessage;
};

export const deleteChatMessage = async (id: number): Promise<void> => {
    const message = await db.message.findUnique({
        where: { id },
    });

    if (message) {
        await db.message.delete({
            where: { id },
        });
    }
};
