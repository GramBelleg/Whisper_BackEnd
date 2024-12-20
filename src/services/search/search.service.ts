import db from "@DB";
import { MemberSummary } from "@models/chat.models";
import { MessageType } from "@prisma/client";
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
    const dms = await db.user.findMany({
        where: {
            OR: [
                {
                    userName: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    phoneNumber: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: {
            id: true,
            userName: true,
            email: true,
            phoneNumber: true,
            name: true,
        },
    });

    const users = await Promise.all(
        dms.map(async (dm) => {
            const user = dm;
            const profilePic = await getPrivateProfilePic(userId, user.id);
            const privateStatus = await getPrivateStatus(userId, user.id);
            const hasStory = await getHasStory(userId, user.id);

            return {
                id: null,
                othersId: user.id,
                name: user.userName,
                picture: profilePic,
                hasStory: hasStory,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
                type: "DM",
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

export const getMessages = async (userId: number, query: string, type: MessageType) => {
    const messages = await db.message.findMany({
        where: {
            type,
            OR: [
                {
                    content: {
                        contains: query,
                        mode: "insensitive",
                    },
                    OR: [
                        { chat: { type: "GROUP", group: { isPrivate: false } } },
                        { chat: { type: "CHANNEL", channel: { isPrivate: false } } },
                        {
                            chat: {
                                participants: {
                                    some: { userId },
                                },
                            },
                        },
                    ],
                },
                {
                    attachmentName: {
                        contains: query,
                        mode: "insensitive",
                    },
                    OR: [
                        { chat: { type: "GROUP", group: { isPrivate: false } } },
                        { chat: { type: "CHANNEL", channel: { isPrivate: false } } },
                        {
                            chat: {
                                participants: {
                                    some: { userId },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        select: {
            sender: {
                select: {
                    id: true,
                    userName: true,
                },
            },
            chat: {
                select: {
                    id: true,
                    type: true,
                },
            },
            type: true,
            media: true,
            content: true,
            id: true,
            attachmentName: true,
        },
    });
    const returnedMessages = await Promise.all(
        messages.map(async (message: any) => {
            if (message.chat.type == "GROUP") {
                const chat = await db.group.findUnique({
                    where: {
                        chatId: message.chat.id,
                    },
                    select: {
                        name: true,
                        picture: true,
                    },
                });
                message.chat.name = chat?.name;
                message.chat.picture = chat?.picture;
            } else if (message.chat.type == "CHANNEL") {
                const chat = await db.channel.findUnique({
                    where: {
                        chatId: message.chat.id,
                    },
                    select: {
                        name: true,
                        picture: true,
                    },
                });
                message.chat.name = chat?.name;
                message.chat.picture = chat?.picture;
            }
            return {
                id: message.id,
                content: message.content,
                media: message.media,
                type: message.type,
                chat: message.chat,
                sender: message.sender,
                attachmentName: message.attachmentName,
            };
        })
    );
    return { messages: returnedMessages };
};
