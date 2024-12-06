import db from "@DB";
import { ChatUserSummary, CreatedChat } from "@models/chat.models";
export const removeUser = async (userId: number, chatId: number) => {
    console.log(chatId, userId);
    try {
        await db.chatParticipant.delete({
            where: {
                chatId_userId: { chatId, userId },
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            err.message = "ChatParticipant not found.";
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
        if (err.code == "P2002") err.message = "Chat Participant already exists";
        throw err;
    }
};
export const addAdmin = async (admin: ChatUserSummary) => {
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
export const getGroupContent = async (chatId: number) => {
    const group = db.group.findUnique({
        where: {
            chatId,
        },
        select: {
            name: true,
            picture: true,
        },
    });
    return group;
};

export const createGroup = async (
    chatId: number,
    participants: { id: number; userId: number }[],
    group: CreatedChat,
    userId: number
) => {
    const chat = await db.group.create({
        data: {
            chatId,
            picture: group.picture,
            name: group.name,
        },
    });
    await createGroupParticipants(participants, userId);
    return chat;
};

const createGroupParticipants = async (
    participants: { id: number; userId: number }[],
    userId: number
) => {
    const groupParticipantsData = participants.map((participant) => ({
        id: participant.id,
        isAdmin: participant.userId == userId ? true : false,
    }));

    await db.groupParticipant.createMany({
        data: groupParticipantsData,
    });
};
