import db from "@DB";
import { chatUser, CreatedChat } from "@models/chat.models";

export const addAdmin = async (admin: chatUser) => {
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
export const isAdmin = async (admin: chatUser) => {
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
