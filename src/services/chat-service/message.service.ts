import db from "src/prisma/PrismaClient";
import { ChatMessage } from "@prisma/client";
import { SaveableMessage } from "@models/chat.models";

export const getChatMessages = async (chatId: number): Promise<ChatMessage[]> => {
    try {
        const messages = await db.chatMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });
        return messages;
    } catch (error) {
        throw new Error("Error getting chat messages: " + error);
    }
};

export const saveChatMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    try {
        const savedMessage = await db.chatMessage.create({
            data: { ...message },
        });
        return savedMessage;
    } catch (error) {
        throw new Error("Error saving chat message: " + error);
    }
};

export const editChatMessage = async (id: number, content: string): Promise<ChatMessage> => {
    try {
        const editedMessage: ChatMessage = await db.chatMessage.update({
            where: { id },
            data: { content },
        });
        return editedMessage;
    } catch (error) {
        throw new Error("Error editing chat message: " + error);
    }
};

export const pinChatMessage = async (id: number): Promise<ChatMessage> => {
    try {
        const pinnedMessage: ChatMessage = await db.chatMessage.update({
            where: { id },
            data: { pinned: true },
        });
        return pinnedMessage;
    } catch (error) {
        throw new Error("Error pinning chat message: " + error);
    }
};

export const unpinChatMessage = async (id: number): Promise<ChatMessage> => {
    try {
        const unpinnedMessage: ChatMessage = await db.chatMessage.update({
            where: { id },
            data: { pinned: false },
        });
        return unpinnedMessage;
    } catch (error) {
        throw new Error("Error unpinning chat message: " + error);
    }
}

export const deleteChatMessage = async (id: number): Promise<void> => {
    try {
        await db.chatMessage.delete({
            where: { id },
        });
    } catch (error) {
        throw new Error("Error deleting chat message: " + error);
    }
};
