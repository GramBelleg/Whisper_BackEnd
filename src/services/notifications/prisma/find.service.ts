import db from "@DB";

export const findDeviceTokens = async (userIds: number[]) => {
    const deviceToken = await db.userToken.findMany({
        where: {
            userId: {
                in: userIds,
            },
            expireAt: {
                gte: new Date(),
            },
        },
    });
    return deviceToken;
};

export const findUnmutedDMUsers = async (userIds: number[], chatId: number) => {
    const users = await db.chatParticipant.findMany({
        where: {
            userId: { in: userIds },
            chatId,
            chat: {
                type: "DM",
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

export const findUnmutedGroupUsers = async (userIds: number[], chatId: number) => {
    const users = await db.chatParticipant.findMany({
        where: {
            userId: { in: userIds },
            chatId,
            chat: {
                type: "GROUP",
            },
            isMuted: false,
        },
        select: {
            user: {
                select: {
                    id: true,
                },
            },
            chat: {
                select: {
                    group: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    if (users.length === 0) return { groupName: "", unmutedUsers: [] };
    return {
        groupName: users[0].chat.group?.name,
        unmutedUsers: users.map((user) => user.user.id),
    };
};

export const findUnmutedChannelUsers = async (userIds: number[], chatId: number) => {
    const users = await db.chatParticipant.findMany({
        where: {
            userId: { in: userIds },
            chatId,
            chat: {
                type: "CHANNEL",
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
