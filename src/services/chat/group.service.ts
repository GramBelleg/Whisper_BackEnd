import db from "@DB";
import { ChatUserSummary, CreatedChat, MemberSummary } from "@models/chat.models";
import { getHasStory, getPrivateProfilePic, getPrivateStatus } from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";

export const getSettings = async (chatId: number) => {
    const group = await db.group.findUnique({
        where: {
            chatId,
        },
        select: {
            maxSize: true,
            isPrivate: true,
        },
    });
    if (!group) throw new Error("Group not found for the specified chatId.");
    return { public: !group?.isPrivate, maxSize: group?.maxSize };
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
    }
};

export const getSizeLimit = async (chatId: number) => {
    const group = await db.group.findUnique({
        where: { chatId },
        select: { maxSize: true },
    });
    if (!group) throw new Error("Group not found for the specified chatId.");
    return group.maxSize;
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
    }
};

export const getPermissions = async (userId: number, chatId: number) => {
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
        } else if (err.code === "P2003") {
            throw new Error("User or Chat doesn't exist.");
        }
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
    }
};

export const isAdmin = async (admin: ChatUserSummary) => {
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
};

export const getGroupMembers = async (userId: number, chatId: number): Promise<MemberSummary[]> => {
    const chatParticipants = await db.chatParticipant.findMany({
        where: { chatId },
        select: {
            user: {
                select: {
                    id: true,
                    userName: true,
                },
            },
            groupParticipant: {
                select: {
                    isAdmin: true,
                },
            },
        },
        orderBy: {
            groupParticipant: {
                isAdmin: "desc",
            },
        },
    });
    if (!chatParticipants.length) throw new Error("Group not found");

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
                isAdmin: participant.groupParticipant?.isAdmin ?? false,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return members;
};

export const getGroupContent = async (chatId: number, userId: number) => {
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
    if (!group || !participant) throw new Error("Group not found or user isn't in group.");
    return { ...group, isAdmin: participant?.groupParticipant?.isAdmin };
};
export const createGroup = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    group: CreatedChat,
    userId: number
) => {
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
    }
};

export const createGroupParticipants = async (
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
        if (err.code === "P2003") {
            throw new Error("Chat participant doesn't exist.");
        }
    }
};
