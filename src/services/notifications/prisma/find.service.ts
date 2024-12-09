import db from '@DB';

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
                type: 'DM',
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
}

export const findUnmutedGroupUsers = async (userIds: number[], chatId: number) => {
    const users = await db.groupParticipant.findMany({
        where: {
            userId: { in: userIds },
            groupId: chatId,
            group: {
                chat: {
                    type: 'GROUP',
                }
            },
            isMuted: false,
        },
        select: {
            participant: {
                select: {
                    id: true,
                },
            },
            group: {
                select: {
                    name: true,
                }
            }
        },
    });
    return {groupName: users[0].group.name, unmutedUsers: users.map((user) => user.participant.id)};
}

export const findUnmutedChannelUsers = async (userIds: number[], chatId: number) => {
    const users = await db.channelParticipant.findMany({
        where: {
            userId: { in: userIds },
            channelId: chatId,
            Channel: {
                chat: {
                    type: 'CHANNEL',
                }
            },
            isMuted: false,
        },
        select: {
            participant: {
                select: {
                    id: true,
                },
            }
        },
    });
    return users.map((user) => user.participant.id);
}