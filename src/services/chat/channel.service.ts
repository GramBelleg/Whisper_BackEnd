import db from "@DB";
import jwt from "jsonwebtoken";
import { ChatUserSummary, CreatedChat, MemberSummary } from "@models/chat.models";
import HttpError from "@src/errors/HttpError";
import { getHasStory, getPrivateProfilePic, getPrivateStatus } from "@services/user/user.service";

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
    if (!channel) throw new Error("Channel not found for the specified chatId.");

    return { public: !channel?.isPrivate, inviteLink: channel?.inviteLink };
};

export const getChannelMembers = async (
    userId: number,
    chatId: number
): Promise<MemberSummary[]> => {
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
    if (!chatParticipants.length) throw new Error("Channel not found");

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
                isAdmin: participant.channelParticipant?.isAdmin ?? false,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return members;
};

export const getAdmins = async (chatId: number) => {
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
    if (userIds.length == 0) throw new Error("Channel Admins not found");
    return userIds;
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
    }
};
export const setPermissions = async (userId: number, chatId: number, permissions: any) => {
    try {
        await db.chatParticipant.update({
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
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Participant or channel participant not found.");
        }
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
        } else if (err.code === "P2003") {
            throw new Error("User or Chat doesn't exist.");
        }
    }
};

export const getPermissions = async (userId: number, chatId: number) => {
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
};
export const isAdmin = async (admin: ChatUserSummary) => {
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
    if (!user || !user.channelParticipant) throw new Error("Channel Participant not found");
    return user.channelParticipant.isAdmin;
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
    }
};
export const getChannelContent = async (chatId: number, userId: number) => {
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
    if (!channel) throw new Error("Channel not found or user isn't in channel.");
    return { ...channel, isAdmin: participant?.channelParticipant?.isAdmin };
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
        const chat = await db.channel.create({
            data: {
                chatId,
                picture: channel.picture,
                name: channel.name,
            },
        });
        const inviteLink = createInviteLink(chatId);
        const updatedChannel = await db.channel.update({
            where: {
                chatId: chat.chatId,
            },
            data: {
                inviteLink,
            },
        });
        await createChannelParticipants(participants, userId);
        return updatedChannel;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Channel with the specified chatId already exists.");
        }
    }
};
export const createChannelParticipants = async (
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
        if (err.code === "P2003") {
            throw new Error("Chat participant doesn't exist.");
        }
    }
};
