import db from "@DB";
import { ChatSummary, CreatedChat, LastMessage } from "@models/chat.models";
import { ChatType } from "@prisma/client";
import { getDraftedMessage, getMessage } from "./message.service";
import { MemberSummary } from "@models/chat.models";
import { getLastMessageSender } from "@services/user/user.service";
import { buildDraftedMessage } from "@controllers/messages/format.message";
import * as groupService from "@services/chat/group.service";
import HttpError from "@src/errors/HttpError";

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

const createChatParticipants = async (
    users: number[],
    currentUserId: number,
    senderKey: null | number,
    chatId: number
) => {
    const participantsData = users.map((userId) => ({
        userId,
        chatId,
        keyId: currentUserId === userId ? senderKey : null,
    }));
    const chatParticipantIds = await db.$queryRawUnsafe<{ id: number; userId: number }[]>(`
        INSERT INTO "ChatParticipant" ("chatId", "userId")
        VALUES ${participantsData.map((p) => `(${p.chatId}, ${p.userId})`).join(", ")}
        RETURNING "id", "userId";
    `);

    return chatParticipantIds;
};

export const createChat = async (
    users: number[],
    userId: number,
    senderKey: null | number,
    type: ChatType
) => {
    const chat = await db.chat.create({
        data: {
            type,
        },
        select: {
            id: true,
        },
    });
    const participants = await createChatParticipants(users, userId, senderKey, chat.id);
    return { chatId: chat.id, participants };
};

export const getOtherUserId = async (excludedUserId: number, chatId: number) => {
    const otherUserId = await db.chat.findUnique({
        where: { id: chatId },
        select: {
            participants: {
                where: { userId: { not: excludedUserId } },
                select: {
                    userId: true,
                },
            },
        },
    });
    if (!otherUserId) return null;
    return otherUserId.participants[0].userId;
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

const getDMContent = async (participant: any, chatId: number) => {
    const participantKeys = await getChatKeys(chatId);
    return {
        othersId: participant.user.id,
        name: participant.user.userName,
        picture: participant.user.profilePic,
        hasStory: participant.user.hasStory,
        lastSeen: participant.user.lastSeen,
        participantKeys,
        status: participant.status,
    };
};

const getTypeDependantContent = async (type: ChatType, participant: any, chatId: number) => {
    if (type === "DM") {
        return getDMContent(participant, chatId);
    }
    if (type === "GROUP") {
        return groupService.getGroupContent(chatId);
    }
};

export const formatDraftedMessage = async (userId: number, chatId: number) => {
    const draftedMessage = await getDraftedMessage(userId, chatId);
    if (!draftedMessage) return null;
    return await buildDraftedMessage(userId, chatId, draftedMessage);
};

export const getChatKeys = async (chatId: number) => {
    const keyObjects = await db.chatParticipant.findMany({
        where: { chatId },
        select: { keyId: true },
    });
    return keyObjects.map((participant) => participant.keyId);
};

export const getChatSummary = async (
    userChat: any,
    userId: number
): Promise<ChatSummary | null> => {
    const participant = (await getOtherChatParticipants(userChat.chatId, userId))[0];
    const lastMessage = await getLastMessage(userId, userChat.chatId);
    const draftMessage = await formatDraftedMessage(userId, userChat.chatId);

    if (!participant) return null;
    const typeDependantContent = await getTypeDependantContent(
        userChat.chat.type,
        participant,
        userChat.chatId
    );
    if (!typeDependantContent) return null;
    const chatSummary = {
        id: userChat.chatId,
        ...typeDependantContent,
        type: userChat.chat.type,
        isMuted: userChat.isMuted,
        lastMessage,
        draftMessage,
        unreadMessageCount: userChat.unreadMessageCount,
    };
    return chatSummary;
};

const getUserChat = async (userId: number, chatId: number) => {
    return await db.chatParticipant.findFirst({
        where: { chatId, userId },
        select: {
            chatId: true,
            isMuted: true,
            unreadMessageCount: true,
            chat: {
                select: {
                    type: true,
                },
            },
        },
    });
};

export const getChat = async (userId: number, chatId: number): Promise<ChatSummary | null> => {
    const userChat = await getUserChat(userId, chatId);
    if (!userChat) return null;
    return await getChatSummary(userChat, userId);
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

export const setChatPrivacy = async (id: number, isPrivate: boolean) => {
    try {
        await db.chat.update({
            where: {
                id,
            },
            data: {
                group: {
                    update: {
                        data: {
                            isPrivate,
                        },
                    },
                },
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new HttpError("Group Not Found", 404);
        }
        throw err;
    }
};
