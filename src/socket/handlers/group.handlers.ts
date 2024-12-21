import { getPermissions } from "@services/chat/group.service";
import { isFilteredGroup } from "@services/admin/admin.service";
import { moderateText } from "@services/admin/text.filteration";
import { OmitSender, SentMessage } from "@models/messages.models";
import { ChatType } from "@prisma/client";

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

export const handleMessageSafety = async (
    chatId: number,
    message: OmitSender<SentMessage>,
    chatType: ChatType
) => {
    let isInappropriate = false;
    if (chatType === "GROUP" && (await isFilteredGroup(chatId))) {
        isInappropriate = await moderateText(message.content);
    }
    return { ...message, isSafe: !isInappropriate };
};
