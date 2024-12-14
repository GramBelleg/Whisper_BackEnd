import db from "@DB";


const findBlockedUsers = async (userId: number) => {
    return await db.user.findMany({
        where: {
            relatedBy: {
                some: {
                    relatingId: userId,
                    isBlocked: true
                }
            }
        },
        select: {
            id: true,
            userName: true,
            profilePic: true
        }
    });
}

const areUsersBlocked = async (userId1: number, userId2: number) => {
    const blockedRelations = await db.relates.findMany({
        where: {
            relatingId: userId2,
            relatedById: userId1,
            isBlocked: true
        }
    })
    return blockedRelations.length > 0;
}

const findUsersByIds = async (userIds: number[]) => {
    return await db.user.findMany({
        where: {
            id: {
                in: userIds
            },
        },
        select: { id: true }
    });
}

const findChatByUsers = async (users: number[], userId: number) => {
    return await db.chat.findMany({
        where: {
            type: "DM",
            AND: {
                participants: {
                    some: {
                        userId
                    }
                },
                OR: users.map((user) => ({
                    participants: {
                        some: {
                            userId: user
                        }
                    }
                }))
            },
        },
        select: {
            id: true,
        }
    })
}

export { findBlockedUsers, findUsersByIds, findChatByUsers, areUsersBlocked };