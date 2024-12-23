import db from "@DB";

export const banUser = async (bannedUserId: number, ban: boolean) => {
    await db.user.update({
        where: {
            id: bannedUserId,
        },
        data: {
            banned: ban,
        },
    });
};

export const filterGroup = async (groupId: number, filtered: boolean) => {
    await db.group.update({
        where: {
            chatId: groupId,
        },
        data: {
            filtered,
        },
    });
};

export const isFilteredGroup = async (chatId: number) => {
    try {
        const group = await db.group.findUnique({
            where: { chatId },
            select: { filtered: true },
        });
        if (!group) throw new Error("Group not found for the specified chatId.");
        return group.filtered;
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("Group not found for the specified chatId.");
        }
        throw err;
    }
};

export const getAllGroups = async () => {
    return await db.group.findMany();
};

export const getAllUsers = async () => {
    return await db.user.findMany({
        where: {
            role: {
                not: "Admin",
            },
        },
    });
};
