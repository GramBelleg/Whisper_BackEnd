import { getPermissions, isAdmin } from "@services/chat/group.service";

export const handleDeletePermissions = async (userId: number, chatId: number) => {
    const permissions = await getPermissions(userId, chatId);

    if (!permissions) throw new Error("Couldn't get User Permissions");
    if (!permissions.canDelete) throw new Error("You don't have delete permission");
};

export const handleEditPermissions = async (userId: number, chatId: number) => {
    const permissions = await getPermissions(userId, chatId);

    if (!permissions) throw new Error("Couldn't get User Permissions");
    if (!permissions.canEdit) throw new Error("You don't have edit permission");
};

export const handlePostPermissions = async (userId: number, chatId: number) => {
    const permissions = await getPermissions(userId, chatId);

    if (!permissions) throw new Error("Couldn't get User Permissions");
    if (!permissions.canPost) throw new Error("You don't have post permission");
};
export const handlePinPermissions = async (userId: number, chatId: number) => {
    if (!(await isAdmin({ userId, chatId }))) throw new Error("You don't have pin permission");
};
