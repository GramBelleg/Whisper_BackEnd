import db from "@DB";
import { ChatSummary, CreatedChat, LastMessage } from "@models/chat.models";
import { ChatType } from "@prisma/client";
import { getDraftedMessage, getMessage } from "./message.service";
import { MemberSummary } from "@models/chat.models";
import {
    getHasStory,
    getLastMessageSender,
    getPrivateProfilePic,
    getPrivateStatus,
} from "@services/user/user.service";
import { buildDraftedMessage } from "@controllers/messages/format.message";
import * as groupService from "@services/chat/group.service";
import * as channelService from "@services/chat/channel.service";
import HttpError from "@src/errors/HttpError";
import { areUsersBlocked } from "@services/user/prisma/find.service";

export const getAddableUsers = async (userId: number, chatId: number) => {
    const users = [];
    const chats = await db.chatParticipant.findMany({
        where: {
            userId,
            chat: { type: "DM" },
        },
        select: {
            chatId: true,
        },
    });
    for (const chat of chats) {
        users.push(
            await db.chatParticipant.findMany({
                where: {
                    chatId: chat.chatId,
                    userId: {
                        not: userId,
                    },
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            profilePic: true,
                        },
                    },
                },
            })
        );
    }
    const filteredUsers = [];
    for (const user of users) {
        const participant = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: { chatId, userId: user[0].user.id },
            },
        });
        if (!participant) filteredUsers.push(user[0].user);
    }
    return filteredUsers;
};
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
            isMuted: true,
            unreadMessageCount: true,
            chat: {
                select: {
                    type: true,
                    selfDestruct: true,
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
    try {
        await db.chatParticipant.update({
            where: { chatId_userId: { chatId, userId } },
            data: { isMuted: true },
        });
    } catch (err: any) {
        console.error(err);
    }
};

export const unmuteChat = async (chatId: number, userId: number): Promise<void> => {
    try {
        await db.chatParticipant.update({
            where: { chatId_userId: { chatId, userId } },
            data: { isMuted: false },
        });
    } catch (err: any) {
        console.error(err);
    }
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

export const messageExists = async (messageId: number): Promise<boolean> => {
    const result = await db.message.findFirst({
        where: { id: messageId },
    });
    return result ? true : false;
};

export const isDMChat = async (chatId: number): Promise<boolean> => {
    const result = await db.chat.findFirst({
        where: { id: chatId, type: "DM" },
    });
    return result ? true : false;
};

export const updateSelfDestruct = async (chatId: number, selfDestruct: number | null) => {
    await db.chat.update({
        where: { id: chatId },
        data: { selfDestruct },
    });
};

export const filterAllowedMessagestoRead = async (
    userId: number,
    messageIds: number[],
    chatId: number
) => {
    const results = await db.message.findMany({
        where: {
            id: { in: messageIds },
            NOT: { senderId: userId },
            chat: { id: chatId, participants: { some: { userId } } },
        },
        select: { id: true },
    });
    return results.map((result) => result.id);
};

export const filterAllowedMessagestoDelete = async (
    userId: number,
    messageIds: number[],
    chatId: number
) => {
    const results = await db.message.findMany({
        where: { id: { in: messageIds }, chat: { id: chatId, participants: { some: { userId } } } },
        select: { id: true },
    });
    return results.map((result) => result.id);
};

export const userIsSender = async (userId: number, messageId: number): Promise<boolean> => {
    const result = await db.message.findFirst({
        where: { id: messageId },
        select: { senderId: true },
    });
    return result!.senderId === userId ? true : false;
};

export const isUserAllowedToAccessMessage = async (userId: number, messageId: number) => {
    const result = await db.chat.findFirst({
        where: { messages: { some: { id: messageId } }, participants: { some: { userId } } },
    });
    return result ? true : false;
};

export const getChatMembers = async (userId: number, chatId: number): Promise<MemberSummary[]> => {
    //add privacy to last seen and hasStory
    const chatParticipants = await db.chatParticipant.findMany({
        where: { chatId },
        select: {
            user: {
                select: {
                    id: true,
                    userName: true,
                },
            },
        },
    });
    const members: MemberSummary[] = await Promise.all(
        chatParticipants.map(async (participant) => {
            const profilePic = await getPrivateProfilePic(userId, participant.user.id);
            const privateStatus = await getPrivateStatus(userId, participant.user.id);
            const hasStory = await getHasStory(userId, participant.user.id);

            return {
                id: participant.user.id,
                userName: participant.user.userName,
                profilePic: profilePic,
                hasStory: hasStory,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return members;
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

    const chatParticipantIds = await db.chatParticipant.findMany({
        where: {
            chatId,
        },
        select: {
            id: true,
            userId: true,
        },
    });
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
    return { id: chat.id, participants };
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
    return otherUserId?.participants[0].userId;
};
//TODO: Set condition on lastSeen and profilePic based on privacy
const getOtherChatParticipants = async (chatId: number, excludeUserId: number) => {
    const chatParticipants = await db.chatParticipant.findMany({
        where: {
            chatId,
            userId: {
                not: excludeUserId,
            },
        },
        select: {
            user: {
                select: {
                    id: true,
                    userName: true,
                },
            },
        },
    });
    const members: MemberSummary[] = await Promise.all(
        chatParticipants.map(async (participant) => {
            const profilePic = await getPrivateProfilePic(excludeUserId, participant.user.id);
            const privateStatus = await getPrivateStatus(excludeUserId, participant.user.id);
            const hasStory = await getHasStory(excludeUserId, participant.user.id);

            return {
                id: participant.user.id,
                userName: participant.user.userName,
                profilePic: profilePic,
                hasStory: hasStory,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return members;
};

const getDMContent = async (participant: any, chatId: number) => {
    const participantKeys = await getChatKeys(chatId);
    return {
        othersId: participant.id,
        name: participant.userName,
        picture: participant.profilePic,
        hasStory: participant.hasStory,
        lastSeen: participant.lastSeen,
        participantKeys,
        status: participant.status,
    };
};

const getTypeDependantContent = async (
    type: ChatType,
    participant: any,
    chatId: number,
    userId: number
) => {
    if (type === "DM") {
        return getDMContent(participant, chatId);
    } else if (type === "GROUP") {
        return groupService.getGroupContent(chatId, userId);
    } else {
        return channelService.getChannelContent(chatId, userId);
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
        userChat.chatId,
        userId
    );
    let isBlocked = false;
    if (await areUsersBlocked(userId, participant.id)) {
        isBlocked = true;
    }
    let makeBlocked = false;
    if (await areUsersBlocked(participant.id, userId)) {
        makeBlocked = true;
    }
    const chatSummary = {
        id: userChat.chatId,
        isMuted: userChat.isMuted,
        ...typeDependantContent,
        type: userChat.chat.type,
        selfDestruct: userChat.chat.selfDestruct,
        lastMessage,
        draftMessage,
        unreadMessageCount: userChat.unreadMessageCount,
        isBlocked,
        makeBlocked,
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
                    selfDestruct: true,
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
        const lastMessage = { ...result!.message, time: result!.time };
        const lastMessageSender = await getLastMessageSender(lastMessage.id);
        return { ...lastMessage, ...lastMessageSender! };
    }
    return null;
};

export const getSelfDestruct = async (chatId: number) => {
    const chat = await db.chat.findUnique({
        where: { id: chatId },
        select: { selfDestruct: true },
    });
    return chat?.selfDestruct;
};

export const setLastMessage = async (chatId: number, messageId: number): Promise<void> => {
    const messageStatuses = await db.messageStatus.findMany({
        where: { messageId },
        select: { id: true, userId: true },
    });
    for (const status of messageStatuses) {
        try {
            await db.chatParticipant.update({
                where: { chatId_userId: { chatId, userId: status.userId } },
                data: { lastMessageId: status.id },
            });
        } catch (err: any) {
            console.error(err);
        }
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
            try {
                await db.chatParticipant.update({
                    where: { chatId_userId: { chatId, userId: participantId } },
                    data: { lastMessageId: messageStatus.id },
                });
            } catch (err: any) {
                console.error(err);
            }
        }
    });
};

export const getChatType = async (id: number) => {
    const chat = await db.chat.findUnique({
        where: {
            id,
        },
        select: {
            type: true,
        },
    });
    if (!chat) throw new Error("Chat doesn't Exist");
    return chat.type;
};
