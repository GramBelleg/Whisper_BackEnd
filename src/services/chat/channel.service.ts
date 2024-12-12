import db from "@DB";
import { ChatUserSummary, CreatedChat } from "@models/chat.models";
import HttpError from "@src/errors/HttpError";

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
export const createChannel = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    channel: CreatedChat,
    userId: number
) => {
    try {
        if (!channel.name) throw new Error("Group name is missing");
        const chat = await db.channel.create({
            data: {
                chatId,
                picture: channel.picture,
                name: channel.name,
            },
        });
        await createChannelParticipants(participants, userId);
        return chat;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Channel with the specified chatId already exists.");
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
