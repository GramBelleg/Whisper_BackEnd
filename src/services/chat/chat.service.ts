import db from "@DB";
import { ChatSummary, LastMessage } from "@models/chat.models";
import { ChatType } from "@prisma/client";
import { getDraftedMessage, getMessage } from "./message.service";
import { MemberSummary } from "@models/chat.models";
import { getLastMessageSender } from "@services/user/user.service";
import { buildDraftedMessage } from "@controllers/messages/format.message";

const getUserChats = async (userId: number, type: ChatType | null, noKey: number | boolean) => {
    let whereClause: Record<string, any>;
    if (noKey) {
        whereClause = { userId, chat: { type: "DM" }, publicKey: null };
    } else if (!type) {
        whereClause = { userId };
    } else {
        whereClause = { userId, chat: { type } };
    }
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

export const chatExists = async (chatId: number): Promise<boolean> => {
    const result = await db.chat.findFirst({
        where: { id: chatId },
    });
    return result ? true : false;
};

export const isUserAMember = async (userId: number, chatId: number): Promise<boolean> => {
    const result = await db.chatParticipant.findFirst({
        where: { chatId, userId },
    });
    return result ? true : false;
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

export const createChatParticipants = async (
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
    await db.chatParticipant.createMany({
        data: participantsData,
    });
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
    await createChatParticipants(users, userId, senderKey, chat.id);
    return chat;
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
        isMuted: participant.isMuted,
        participantKeys,
        status: participant.status,
    };
};

const getTypeDependantContent = async (type: ChatType, participant: any, chatId: number) => {
    if (type === "DM") {
        return getDMContent(participant, chatId);
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
    type: ChatType | null,
    noKey: number | boolean
): Promise<ChatSummary[]> => {
    const userChats = await getUserChats(userId, type, noKey);
    const chatSummaries: ChatSummary[] = [];

    for (const userChat of userChats) {
        const chatSummary = await getChatSummary(userChat, userId);
        if (chatSummary) {
            chatSummaries.push(chatSummary);
        }
    }

    return chatSummaries;
};

export const getChatId = async (messageId: number): Promise<number | null> => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: { chatId: true },
    });
    if (result) {
        return result.chatId;
    } else return null;
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
    const messageStatuses = await db.messageStatus.findMany({
        where: { messageId },
        select: { id: true, userId: true },
    });
    if (!messageStatuses) return;
    for (const status of messageStatuses) {
        await db.chatParticipant.update({
            where: { chatId_userId: { chatId, userId: status.userId } },
            data: { lastMessageId: status.id },
        });
    }
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
