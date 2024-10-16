import db from "src/prisma/PrismaClient";
import { Chat } from "@prisma/client";

export const getChats = async (userId: number): Promise<Chat[]> => {
    try {
        const chats = await db.chat.findMany({
            where: { participants: { some: { userId } } },
            include: {
                lastMessage: {
                    select: { createdAt: true },
                },
            },
            orderBy: {
                lastMessage: { createdAt: "desc" },
            },
        });
        return chats;
    } catch (error) {
        throw new Error("Error getting chats: " + error);
    }
};

export const getChatId = async (messageId: number): Promise<number> => {
    try {
        const result = await db.chatMessage.findUnique({
            where: { id: messageId },
            select: { chatId: true },
        });
        if (!result) {
            throw new Error("Message not found");
        }

        return result.chatId;
    } catch (error) {
        throw new Error("Error getting chat id: " + error);
    }
};

export const getChatParticipantsIds = async (chatId: number): Promise<number[]> => {
    const chatParticipants: Array<{ userId: number }> = await db.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
    });
    return chatParticipants.map((participant) => participant.userId);
};

export const setLastMessage = async (chatId: number, messageId: number | null): Promise<void> => {
    try {
        await db.chat.update({
            where: { id: chatId },
            data: { lastMessageId: messageId },
        });
    } catch (error) {
        console.error("Error setting last message:", error);
    }
};

export const setNewLastMessage = async (chatId: number): Promise<number | null> => {
    try {
        const lastMessage = await db.chatMessage.findFirst({
            where: { chatId },
            orderBy: { createdAt: "desc" },
        });
        const lastMessageId = lastMessage ? lastMessage.id : null;

        await setLastMessage(chatId, lastMessageId);

        return lastMessageId;
    } catch (error) {
        console.error("Error setting new last message:", error);
        return null;
    }
};
