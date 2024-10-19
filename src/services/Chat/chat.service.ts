import db from "@DB";
import { ChatSummary } from "@models/chat.models";

const getUserChats = async (userId: number) => {
    return await db.userChat.findMany({
        where: { userId },
        select: {
            chatId: true,
            unreadMessageCount: true,
            lastMessage: {
                select: {
                    content: true,
                    createdAt: true,
                    messageStatus: {
                        where: {
                            userId,
                        },
                        select: {
                            read: true,
                            delivered: true,
                        },
                    },
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

const getOtherChatParticipant = async (chatId: number, excludeUserId: number) => {
    return await db.chatParticipant.findFirst({
        where: {
            chatId,
            userId: {
                not: excludeUserId,
            },
        },
        select: {
            user: {
                select: {
                    userName: true,
                },
            },
        },
    });
};

export const getChats = async (userId: number): Promise<ChatSummary[]> => {
    const userChats = await getUserChats(userId);
    const chatSummaries: ChatSummary[] = [];

    for (const userChat of userChats) {
        const participant = await getOtherChatParticipant(userChat.chatId, userId);

        if (participant?.user) {
            chatSummaries.push({
                chatName: participant.user.userName,
                lastMessage: userChat.lastMessage,
                unreadMessageCount: userChat.unreadMessageCount,
            });
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

export const setLastMessage = async (chatId: number, messageId: number | null): Promise<void> => {
    await db.userChat.updateMany({
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
