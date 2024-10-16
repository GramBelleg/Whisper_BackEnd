import db from "src/prisma/PrismaClient";
import { Chat } from "@prisma/client";

export const getChats = async (userId: number): Promise<Chat[]> => {
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
};

export const getChatId = async (messageId: number): Promise<number> => {
    const result = await db.chatMessage.findUnique({
        where: { id: messageId },
        select: { chatId: true },
    });
    if (!result) {
        throw new Error("Message not found");
    }

    return result.chatId;
};

export const getChatParticipantsIds = async (chatId: number): Promise<number[]> => {
    const chatParticipants: Array<{ userId: number }> = await db.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
    });
    return chatParticipants.map((participant) => participant.userId);
};

export const setLastMessage = async (chatId: number, messageId: number | null): Promise<void> => {
    await db.chat.update({
        where: { id: chatId },
        data: { lastMessageId: messageId },
    });
};

export const setNewLastMessage = async (chatId: number): Promise<number | null> => {
    const lastMessage = await db.chatMessage.findFirst({
        where: { chatId },
        orderBy: { createdAt: "desc" },
    });
    const lastMessageId = lastMessage ? lastMessage.id : null;

    await setLastMessage(chatId, lastMessageId);

    return lastMessageId;
};
