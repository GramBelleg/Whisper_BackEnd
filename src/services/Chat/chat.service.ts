import db from "@DB";
import { ChatSummary } from "@models/chat.models";
import { ChatType } from "@prisma/client";

const getUserChats = async (userId: number) => {
    return await db.chatParticipant.findMany({
        where: { userId },
        select: {
            chatId: true,
            unreadMessageCount: true,
            chat: {
                select: {
                    type: true,
                },
            },
            lastMessage: {
                select: {
                    id: true,
                    content: true,
                    type: true,
                    createdAt: true,
                    sentAt: true,
                    read: true,
                    delivered: true,
                },
            },
        },
        orderBy: {
            lastMessage: {
                createdAt: "desc",
            },
        },
    });
};

const createChatParticipants = async (users: number[], chatId: number) => {
    const participantsData = users.map((userId) => ({
        userId,
        chatId,
    }));
    await db.chatParticipant.createMany({
        data: participantsData,
    });
};

export const createChat = async (users: number[], type: ChatType) => {
    const chat = await db.chat.create({
        data: {
            type,
        },
        select: {
            id: true,
        },
    });
    await createChatParticipants(users, chat.id);
    return chat;
};

const getOtherChatParticipant = async (chatId: number, excludeUserId: number) => {
    return await db.chatParticipant.findFirst({
        where: {
            chatId,
            userId: {
                not: excludeUserId,
            },
        },
        select: {
            isMuted: true,
            user: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                    lastSeen: true,
                    hasStory: true,
                },
            },
        },
    });
};

export const getChatSummary = async (
    userChat: any,
    userId: number
): Promise<ChatSummary | null> => {
    const participant = await getOtherChatParticipant(userChat.chatId, userId);
    if (!participant) return null;
    const chatSummary = {
        id: userChat.chatId,
        other: { ...participant.user, isMuted: participant.isMuted },
        type: userChat.chat.type,
        lastMessage: userChat.lastMessage,
        unreadMessageCount: userChat.unreadMessageCount,
    };
    return chatSummary;
};

export const getChatsSummaries = async (userId: number): Promise<ChatSummary[]> => {
    const userChats = await getUserChats(userId);
    const chatSummaries: ChatSummary[] = [];

    for (const userChat of userChats) {
        const chatSummary = await getChatSummary(userChat, userId);
        if (chatSummary) {
            chatSummaries.push(chatSummary);
        }
    }

    return chatSummaries;
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
    await db.chatParticipant.updateMany({
        where: { chatId },
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
