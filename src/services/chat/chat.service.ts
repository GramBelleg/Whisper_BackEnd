import db from "@DB";
import { ChatSummary, LastMessage, newChat } from "@models/chat.models";
import { ChatType } from "@prisma/client";
import { getMessage } from "./message.service";
import { MemberSummary } from "@models/chat.models";
import { getLastMessageSender } from "@services/user/user.service";

const getUserChats = async (userId: number, type: ChatType | null) => {
    const whereClause = !type ? { userId } : { userId, chat: { type } };
    return await db.chatParticipant.findMany({
        where: whereClause,
        select: {
            chatId: true,
            unreadMessageCount: true,
            chat: {
                select: {
                    type: true,
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

export const muteChat = async (chatId: number, userId: number): Promise<void> => {
    await db.chatParticipant.update({
        where: { chatId_userId: { chatId, userId } },
        data: { isMuted: true },
    });
};

export const unmuteChat = async (chatId: number, userId: number): Promise<void> => {
    await db.chatParticipant.update({
        where: { chatId_userId: { chatId, userId } },
        data: { isMuted: false },
    });
};

export const getChatMembers = async (chatId: number): Promise<MemberSummary[]> => {
    const chatParticipants = await db.chatParticipant.findMany({
        where: { chatId },
        select: {
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
    return chatParticipants.map((participant) => participant.user);
};

const createChatParticipants = async (users: number[], chatId: number) => {
    const participantsData = users.map((userId) => ({
        userId,
        chatId,
    }));
    const chatParticipantIds = await db.$queryRawUnsafe<{ id: number }[]>(`
        INSERT INTO "chatParticipant" ("chatId", "userId")
        VALUES ${participantsData.map((p) => `(${p.chatId}, ${p.userId})`).join(", ")}
        RETURNING "id";
    `);

    return chatParticipantIds.map((record) => record.id);
};
const createGroupParticipants = async (participantIds: number[], userId: number) => {
    const groupParticipantsData = participantIds.map((participantId) => ({
        id: participantId,
        isAdmin: participantId == userId ? true : false,
    }));

    await db.groupParticipant.createMany({
        data: groupParticipantsData,
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
    const participants = await createChatParticipants(users, chat.id);
    return { chatId: chat.id, participants };
};
export const createGroup = async (
    chatId: number,
    participants: number[],
    newGroup: newChat,
    userId: number
) => {
    const chat = await db.group.create({
        data: {
            chatId,
            picture: newGroup.picture,
            name: newGroup.name,
        },
    });
    await createGroupParticipants(participants, userId);
    return chat;
};

//TODO: Set condition on lastSeen and profilePic based on privacy
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

const getDMContent = async (participant: any) => {
    return {
        othersId: participant.user.id,
        name: participant.user.userName,
        picture: participant.user.profilePic,
        hasStory: participant.user.hasStory,
        lastSeen: participant.user.lastSeen,
        isMuted: participant.isMuted,
        status: participant.status,
    };
};

const getTypeDependantContent = async (type: ChatType, participant: any) => {
    if (type === "DM") {
        return getDMContent(participant);
    }
};

export const getChatSummary = async (
    userChat: any,
    userId: number
): Promise<ChatSummary | null> => {
    const participant = (await getOtherChatParticipants(userChat.chatId, userId))[0];
    const lastMessage = await getLastMessage(userId, userChat.chatId);
    if (!participant) return null;
    const typeDependantContent = await getTypeDependantContent(userChat.chat.type, participant);
    if (!typeDependantContent) return null;
    const chatSummary = {
        id: userChat.chatId,
        ...typeDependantContent,
        type: userChat.chat.type,
        lastMessage: lastMessage,
        unreadMessageCount: userChat.unreadMessageCount,
    };
    return chatSummary;
};

export const getChatsSummaries = async (
    userId: number,
    type: ChatType | null
): Promise<ChatSummary[]> => {
    const userChats = await getUserChats(userId, type);
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
        const messageId = chatParticipant.lastMessageId;
        const result = await getMessage(messageId);
        if (!result) return null;
        const lastMessage = { ...result.message, time: result.time };
        const lastMessageSender = await getLastMessageSender(messageId);
        if (!lastMessageSender) return null;
        return { ...lastMessage, ...lastMessageSender };
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
