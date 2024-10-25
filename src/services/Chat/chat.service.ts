import db from "@DB";
import { ChatSummary, LastMessage } from "@models/chat.models";
import { ChatType } from "@prisma/client";
import { getMessage } from "./message.service";

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
                    message: {
                        select: {
                            id: true,
                            content: true,
                            type: true,
                            sentAt: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            lastMessage: {
                time: "desc",
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

const getOtherChatParticipants = async (chatId: number, excludeUserId: number) => {
    return await db.chatParticipant.findMany({
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
    const participant = (await getOtherChatParticipants(userChat.chatId, userId))[0];
    if (!participant) return null;
    const chatSummary = {
        id: userChat.chatId,
        other: { ...participant.user, isMuted: participant.isMuted },
        type: userChat.chat.type,
        lastMessage: { ...userChat.lastMessage.message, time: userChat.lastMessage.time },
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

export const getLastMessage = async (
    userId: number,
    chatId: number
): Promise<LastMessage | null> => {
    const chatParticipant = await db.chatParticipant.findFirst({
        where: { chatId, userId },
        select: { lastMessageId: true },
    });

    if (chatParticipant && chatParticipant.lastMessageId) {
        const result = await getMessage(chatParticipant.lastMessageId);
        if (!result) return null;
        const lastMessage = { ...result.message, time: result.time };
        return lastMessage;
    }
    return null;
};

export const setLastMessage = async (chatId: number, messageId: number): Promise<void> => {
    const messageStatus = await db.messageStatus.findFirst({
        where: { messageId },
        select: { id: true },
    });
    if (!messageStatus) return;
    await db.chatParticipant.updateMany({
        where: { chatId },
        data: { lastMessageId: messageStatus.id },
    });
};

export const setNewLastMessage = async (chatId: number): Promise<void> => {
    const participantsIds = await getChatParticipantsIds(chatId);

    participantsIds.forEach(async (participantId) => {
        const messageStatus = await db.messageStatus.findFirst({
            where: { userId: participantId, message: { chatId } },
            select: { id: true },
            orderBy: { time: "desc" },
        });
        if (messageStatus) {
            await db.chatParticipant.update({
                where: { chatId_userId: { chatId, userId: participantId } },
                data: { lastMessageId: messageStatus.id },
            });
        }
    });
};
