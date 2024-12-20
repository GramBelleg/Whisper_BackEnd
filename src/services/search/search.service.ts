import db from "@DB";
import { MemberSummary } from "@models/chat.models";
import { getHasStory, getPrivateProfilePic, getPrivateStatus } from "@services/user/user.service";

export const getMembers = async (userId: number, chatId: number, query: string) => {
    const chatParticipants = await db.chatParticipant.findMany({
        where: {
            chatId: chatId,
            user: {
                userName: {
                    contains: query,
                    mode: "insensitive",
                },
            },
        },
        select: {
            userId: true,
            user: {
                select: {
                    id: true,
                    userName: true,
                },
            },
        },
    });
    const members = await Promise.all(
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

export const getGroups = async (userId: number, query: string) => {
    const groups = await db.group.findMany({
        where: {
            OR: [
                { isPrivate: false },
                {
                    chat: {
                        participants: {
                            some: { userId },
                        },
                    },
                },
            ],
            name: {
                contains: query, // Case-insensitive match
                mode: "insensitive",
            },
        },
        select: {
            name: true,
            picture: true,
            chatId: true, // Return chatId as 'id'
            chat: {
                select: {
                    type: true, // Selecting the 'type' from Chat
                },
            },
        },
    });
    return groups.map((group) => {
        return {
            id: group.chatId,
            name: group.name,
            picture: group.picture,
            type: group.chat.type,
        };
    });
};

export const getChannels = async (userId: number, query: string) => {
    const channels = await db.channel.findMany({
        where: {
            OR: [
                { isPrivate: false },
                {
                    chat: {
                        participants: {
                            some: { userId },
                        },
                    },
                },
            ],
            name: {
                contains: query, // Case-insensitive match
                mode: "insensitive",
            },
        },
        select: {
            name: true,
            picture: true,
            chatId: true, // Return chatId as 'id'
            chat: {
                select: {
                    type: true, // Selecting the 'type' from Chat
                },
            },
        },
    });
    return channels.map((channel) => {
        return {
            id: channel.chatId,
            name: channel.name,
            picture: channel.picture,
            type: channel.chat.type,
        };
    });
};
export const getDms = async (userId: number, query: string) => {
    const dms = await db.chat.findMany({
        where: {
            type: "DM", // Filter by DM type
            participants: {
                some: {
                    userId: userId, // Make sure the user is a participant
                },
            },
        },
        select: {
            id: true,
            participants: {
                where: {
                    userId: { not: userId }, // Exclude the current user
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            email: true,
                            phoneNumber: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    const users = await Promise.all(
        dms.map(async (dm) => {
            const user = dm.participants[0].user;
            if (
                !(
                    user.userName.toLowerCase().includes(query.toLowerCase()) ||
                    user.name?.toLowerCase().includes(query.toLowerCase()) ||
                    user.email.toLowerCase().includes(query.toLowerCase()) ||
                    user.phoneNumber?.includes(query)
                )
            )
                return null;
            const profilePic = await getPrivateProfilePic(userId, user.id);
            const privateStatus = await getPrivateStatus(userId, user.id);
            const hasStory = await getHasStory(userId, user.id);

            return {
                id: dm.id,
                othersId: user.id,
                name: user.userName,
                picture: profilePic,
                hasStory: hasStory,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return users;
};
export const getChats = async (userId: number, query: string) => {
    const groups = await getGroups(userId, query);
    const channels = await getChannels(userId, query);
    const dms = await getDms(userId, query);

    const chats = [...groups, ...channels, ...dms];

    return { chats };
};
