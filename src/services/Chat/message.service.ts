import db from "@DB";
import { ChatMessage } from "@prisma/client";
import { SaveableMessage } from "@models/chat.models";

export const getChatMessages = async (chatId: number): Promise<ChatMessage[]> => {
    const messages = await db.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
    });
    return messages;
};

export const saveChatMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    const savedMessage = await db.chatMessage.create({
        data: { ...message },
    });
    return savedMessage;
};

export const editChatMessage = async (id: number, content: string): Promise<ChatMessage> => {
    const editedMessage: ChatMessage = await db.chatMessage.update({
        where: { id },
        data: { content },
    });
    return editedMessage;
};

export const pinChatMessage = async (id: number): Promise<ChatMessage> => {
    const pinnedMessage: ChatMessage = await db.chatMessage.update({
        where: { id },
        data: { pinned: true },
    });
    return pinnedMessage;
};

export const unpinChatMessage = async (id: number): Promise<ChatMessage> => {
    const unpinnedMessage: ChatMessage = await db.chatMessage.update({
        where: { id },
        data: { pinned: false },
    });
    return unpinnedMessage;
};

export const deleteChatMessage = async (id: number): Promise<void> => {
    const message = await db.chatMessage.findUnique({
        where: { id },
    });

    if (message) {
        await db.chatMessage.delete({
            where: { id },
        });
    }
};
