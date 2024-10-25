import db from "@DB";
import { Chat, ChatParticipant } from "@prisma/client";
import { bool, number } from "joi";

export const getChats = async (userId: number): Promise<Chat[]> => {
    const chats = await db.chat.findMany({
        where: { participants: { some: { userId } } },
        include: {
            lastMessage: true,
        },
        orderBy: {
            lastMessage: { createdAt: "desc" },
        },
    });
    return chats;
};

export const getChatId = async (messageId: number): Promise<number | undefined> => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: { chatId: true },
    });
    if (result) {
        return result.chatId;
    }
};

export const getChatParticipantsIds = async (chatId: number): Promise<number[]> => {
    const chatParticipants: Array<{ userId: number }> = await db.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
    });
    return chatParticipants.map((participant) => participant.userId);
};

export const getStoryParticipant = async (userId: number, except: Array<number> = []): Promise<number[]> => {
    const contacts = await db.chat.findMany({
        where: {
            participants: {
                some: {
                    userId,
                    isContact: true,
                    NOT: { userId: { in: [...except, userId] } }
                }
            },
            type: "DM"
        },
        select: { participants: { select: { userId: true } } },
    });
    const results = contacts.flatMap((contact) => contact.participants.map((participant) => participant.userId));
    return results;
};


export const setLastMessage = async (chatId: number, messageId: number | null): Promise<void> => {
    await db.chat.update({
        where: { id: chatId },
        data: { lastMessageId: messageId },
    });
};

export const setNewLastMessage = async (chatId: number): Promise<number | null> => {
    const lastMessage = await db.message.findFirst({
        where: { chatId },
        orderBy: { createdAt: "desc" },
    });
    const lastMessageId = lastMessage ? lastMessage.id : null;

    await setLastMessage(chatId, lastMessageId);

    return lastMessageId;
};
