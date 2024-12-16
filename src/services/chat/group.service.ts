import db from "@DB";
import { ChatUserSummary, CreatedChat, MemberSummary } from "@models/chat.models";
import HttpError from "@src/errors/HttpError";

export const getSettings = async (chatId: number) => {
    const channel = await db.group.findUnique({
        where: {
            chatId,
        },
        select: {
            maxSize: true,
            isPrivate: true,
        },
    });
    return { public: channel?.isPrivate, inviteLink: channel?.maxSize };
};

export const deleteGroup = async (chatId: number) => {
    try {
        await db.chat.delete({
            where: {
                id: chatId,
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};

export const getSizeLimit = async (chatId: number) => {
    try {
        const group = await db.group.findUnique({
            where: { chatId },
            select: { maxSize: true },
        });
        if (!group) throw new Error("Group not found for the specified chatId.");
        return group.maxSize;
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};

export const updateSizeLimit = async (chatId: number, maxSize: number) => {
    try {
        await db.group.update({
            where: { chatId },
            data: { maxSize },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};

export const setGroupPrivacy = async (id: number, isPrivate: boolean) => {
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

export const setPermissions = async (userId: number, chatId: number, permissions: any) => {
    try {
        const participant = await db.chatParticipant.update({
            where: {
                chatId_userId: { chatId, userId },
            },
            data: {
                groupParticipant: {
                    update: {
                        data: {
                            canDelete: permissions.canDelete,
                            canDownload: permissions.canDownload,
                            canEdit: permissions.canEdit,
                            canPost: permissions.canPost,
                        },
                    },
                },
            },
        });
        if (!participant) throw new Error("Participant doesn't exist");
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Participant or group participant not found.");
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
                groupParticipant: {
                    select: {
                        canDelete: true,
                        canDownload: true,
                        canEdit: true,
                        canPost: true,
                    },
                },
            },
        });
        if (!participant) throw new Error("Participant doesn't exist");
        return participant.groupParticipant;
    } catch (err: any) {
        throw err;
    }
};

export const removeUser = async (userId: number, chatId: number) => {
    try {
        await db.chatParticipant.delete({
            where: {
                chatId_userId: { chatId, userId },
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("ChatParticipant not found.");
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
                groupParticipant: { create: {} },
            },
        });
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Chat Participant already exists.");
        }
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
                groupParticipant: {
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
            throw new Error("ChatParticipant or groupParticipant not found.");
        }
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
                groupParticipant: {
                    select: {
                        isAdmin: true,
                    },
                },
            },
        });
        if (!user || !user.groupParticipant) throw new Error("Group Participant not found");
        return user.groupParticipant.isAdmin;
    } catch (err: any) {
        throw err;
    }
};

export const getGroupMembers = async (chatId: number): Promise<MemberSummary[]> => {
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
            groupParticipant: {
                select: {
                    isAdmin: true,
                },
            },
        },
    });
    return chatParticipants.map((participant) => ({
        ...participant.user,
        isAdmin: participant.groupParticipant?.isAdmin,
    }));
};

export const getGroupContent = async (chatId: number, userId: number) => {
    try {
        const group = await db.group.findUnique({
            where: { chatId },
            select: {
                name: true,
                picture: true,
            },
        });
        const participant = await db.chatParticipant.findUnique({
            where: { chatId_userId: { chatId, userId } },
            select: {
                groupParticipant: {
                    select: {
                        isAdmin: true,
                    },
                },
            },
        });
        if (!group) throw new Error("Group not found.");
        return { ...group, isAdmin: participant?.groupParticipant?.isAdmin };
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};
export const createGroup = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    group: CreatedChat,
    userId: number
) => {
    if (!group.name) throw new Error("Missing group name");
    try {
        if (!group.name) throw new Error("Group name is missing");
        const chat = await db.group.create({
            data: {
                chatId,
                picture: group.picture,
                name: group.name,
            },
        });
        await createGroupParticipants(participants, userId);
        return chat;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Group with the specified chatId already exists.");
        }
        throw err;
    }
};

const createGroupParticipants = async (
    participants: { id: number; userId: number }[],
    userId: number
) => {
    try {
        const groupParticipantsData = participants.map((participant) => ({
            id: participant.id,
            isAdmin: participant.userId === userId,
        }));

        await db.groupParticipant.createMany({
            data: groupParticipantsData,
        });
    } catch (err: any) {
        throw err;
    }
};
