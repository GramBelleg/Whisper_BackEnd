import db from "@DB";
import jwt from "jsonwebtoken";
import { ChatUserSummary, CreatedChat, MemberSummary } from "@models/chat.models";
import HttpError from "@src/errors/HttpError";

export const getSettings = async (chatId: number) => {
    const channel = await db.channel.findUnique({
        where: {
            chatId,
        },
        select: {
            inviteLink: true,
            isPrivate: true,
        },
    });
    return { public: channel?.isPrivate, inviteLink: channel?.inviteLink };
};

export const getChannelMembers = async (chatId: number): Promise<MemberSummary[]> => {
    //add privacy to last seen and hasStory
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
            channelParticipant: {
                select: {
                    isAdmin: true,
                },
            },
        },
        orderBy: {
            channelParticipant: {
                isAdmin: "desc",
            },
        },
    });
    return chatParticipants.map((participant) => ({
        ...participant.user,
        isAdmin: participant.channelParticipant?.isAdmin,
    }));
};

export const getAdmins = async (chatId: number) => {
    try {
        const users = await db.chatParticipant.findMany({
            where: {
                chatId,
                channelParticipant: {
                    isAdmin: true,
                },
            },
            select: {
                userId: true,
            },
        });
        const userIds = users.map((user) => user.userId);
        return userIds;
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new HttpError("Channel Not Found", 404);
        }
        throw err;
    }
};

export const setChannelPrivacy = async (id: number, isPrivate: boolean) => {
    try {
        await db.chat.update({
            where: {
                id,
            },
            data: {
                channel: {
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
            throw new HttpError("Channel Not Found", 404);
        }
        throw err;
    }
};
export const setPermissions = async (userId: number, chatId: number, permissions: any) => {
    try {
        const participant = await db.chatParticipant.update({
            where: {
                chatId_userId: { chatId, userId },
            },
            data: {
                channelParticipant: {
                    update: {
                        data: {
                            canDownload: permissions.canDownload,
                            canComment: permissions.canComment,
                        },
                    },
                },
            },
        });
        if (!participant) throw new Error("Participant doesn't exist");
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Participant or channel participant not found.");
        }
        throw err;
    }
};

export const addUser = async (userId: number, chatId: number) => {
    try {
        await db.chatParticipant.create({
            data: {
                userId,
                chatId,
                channelParticipant: { create: {} },
            },
        });
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Chat Participant already exists.");
        }
        throw err;
    }
};

export const getPermissions = async (userId: number, chatId: number) => {
    try {
        const participant = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: { chatId, userId },
            },
            select: {
                channelParticipant: {
                    select: {
                        canDownload: true,
                        canComment: true,
                    },
                },
            },
        });
        if (!participant) throw new Error("Participant doesn't exist");
        return participant.channelParticipant;
    } catch (err: any) {
        throw err;
    }
};
export const isAdmin = async (admin: ChatUserSummary) => {
    try {
        const user = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: { chatId: admin.chatId, userId: admin.userId },
            },
            select: {
                channelParticipant: {
                    select: {
                        isAdmin: true,
                    },
                },
            },
        });
        if (!user || !user.channelParticipant) throw new Error("Group Participant not found");
        return user.channelParticipant.isAdmin;
    } catch (err: any) {
        throw err;
    }
};
export const addAdmin = async (admin: ChatUserSummary) => {
    try {
        await db.chatParticipant.update({
            where: {
                chatId_userId: { chatId: admin.chatId, userId: admin.userId },
            },
            data: {
                channelParticipant: {
                    update: {
                        data: {
                            isAdmin: true,
                        },
                    },
                },
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("ChatParticipant or channelParticipant not found.");
        }
        throw err;
    }
};
export const getChannelContent = async (chatId: number, userId: number) => {
    try {
        const channel = await db.channel.findUnique({
            where: { chatId },
            select: {
                name: true,
                picture: true,
            },
        });
        const participant = await db.chatParticipant.findUnique({
            where: { chatId_userId: { chatId, userId } },
            select: {
                channelParticipant: {
                    select: {
                        isAdmin: true,
                    },
                },
            },
        });
        if (!channel) throw new Error("Group not found.");
        return { ...channel, isAdmin: participant?.channelParticipant?.isAdmin };
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Channel not found for the specified chatId.");
        }
        throw err;
    }
};
const createInviteLink = (chatId: number) => {
    const token = jwt.sign({ chatId }, process.env.JWT_SECRET as string);
    const inviteLink = `${process.env.ROOT}/api/channels/invite?token=${token}`;
    return inviteLink;
};
export const createChannel = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    channel: CreatedChat,
    userId: number
) => {
    if (!channel.name) throw new Error("Channel name is missing");
    try {
        if (!channel.name) throw new Error("Channel name is missing");
        const chat = await db.channel.create({
            data: {
                chatId,
                picture: channel.picture,
                name: channel.name,
            },
        });
        const inviteLink = createInviteLink(chatId);
        await db.channel.update({
            where: {
                chatId: chat.chatId,
            },
            data: {
                inviteLink,
            },
        });
        await createChannelParticipants(participants, userId);
        return chat;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Channel with the specified chatId already exists.");
        }
        if (err.code === "P2025") {
            throw new Error("Channel not found for the specified chatId.");
        }
        throw err;
    }
};
const createChannelParticipants = async (
    participants: { id: number; userId: number }[],
    userId: number
) => {
    try {
        const channelParticipantsData = participants.map((participant) => ({
            id: participant.id,
            isAdmin: participant.userId === userId,
        }));

        await db.channelParticipant.createMany({
            data: channelParticipantsData,
        });
    } catch (err: any) {
        throw err;
    }
};