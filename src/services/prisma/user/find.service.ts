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


export { findBlockedUsers, findUsersByIds };