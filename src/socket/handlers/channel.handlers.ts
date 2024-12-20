import { getPermissions, isAdmin } from "@services/chat/channel.service";

export const handlePostPermissions = async (userId: number, chatId: number) => {
    if (!(await isAdmin({ userId, chatId }))) throw new Error("You don't have post permission");
};

export const handleCommentPermissions = async (userId: number, chatId: number) => {
    const permissions = await getPermissions(userId, chatId);

    if (!permissions) throw new Error("Couldn't get User Permissions");
    if (!permissions.canComment) throw new Error("You don't have comment permission");
};
