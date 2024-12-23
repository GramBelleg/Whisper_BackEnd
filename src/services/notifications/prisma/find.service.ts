import db from "@DB";
import { ChatType } from "@prisma/client";

export const findDeviceTokens = async (userIds: number[]) => {
    const deviceToken = await db.userToken.findMany({
        where: {
            userId: {
                in: userIds,
            },
            expireAt: {
                gte: new Date(),
            },
            deviceToken: {
                not: null,
            },
        },
    });
    return deviceToken;
};

export const findUnperviewedMessageUsers = async (userIds: number[]) => {
    const users = await db.user.findMany({
        where: {
            id: { in: userIds },
            messagePreview: false,
        },
        select: {
            id: true,
        },
    });
    return users.map((user) => user.id);
};

export const findUserIdsByUsernames = async (usernames: string[]) => {
    const users = await db.user.findMany({
        where: {
            userName: { in: usernames },
        },
        select: {
            id: true,
        },
    });
    return users.map((user) => user.id);
};

export const findUnmutedUsers = async (userIds: number[], chatId: number, chatType: ChatType) => {
    const users = await db.chatParticipant.findMany({
        where: {
            userId: { in: userIds },
            chatId,
            chat: {
                type: chatType,
            },
            isMuted: false,
        },
        select: {
            user: {
                select: {
                    id: true,
                },
            },
        },
    });
    return users.map((user) => user.user.id);
};

export const findChatName = async (chatId: number, chatType: ChatType) => {
    const chat = await db.chat.findUnique({
        where: {
            id: chatId,
            type: chatType,
        },
        select: {
            channel: {
                select: {
                    name: true,
                },
            },
            group: {
                select: {
                    name: true,
                },
            },
        },
    });
    return { groupName: chat?.group?.name, channelName: chat?.channel?.name };
}


export const findNewActivityUsers = async () => {
    const users = await db.chatParticipant.findMany({
        where: {
            unreadMessageCount: {
                not: 0,
            },
            chat: {
                type: {
                    not: ChatType.DM,
                }
            }
        },
        select: {
            userId: true,
            chat: {
                select: {
                    group: { select: { name: true } },
                    channel: { select: { name: true } }
                }
            }
        },
    });
    return users;
}