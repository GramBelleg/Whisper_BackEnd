import { MAX_GROUP_SIZE } from "@config/constants.config";
import { ChatUser, ChatUserSummary } from "@models/chat.models";
import { UserType } from "@models/user.models";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";
import { getAddPermission } from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";

export const getSettings = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    const settings = await groupService.getSettings(chatId);
    res.status(200).json(settings);
};

export const deleteGroup = async (userId: number, chatId: number) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    const participants = await getChatParticipantsIds(chatId);

    await groupService.deleteGroup(chatId);

    return participants;
};

const canUserBeAdded = async (chatUser: ChatUser, adderId: number) => {
    const addPermission = await getAddPermission(chatUser.user.id);
    const isAdmin = await groupService.isAdmin({ userId: adderId, chatId: chatUser.chatId });
    return (isAdmin && !addPermission) || addPermission;
};
export const leaveGroup = async (userId: number, chatId: number) => {
    const participants = getChatParticipantsIds(chatId);

    await groupService.removeUser(userId, chatId);

    return participants;
};
export const addAdmin = async (userId: number, admin: ChatUserSummary) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    await groupService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};
export const addUser = async (userId: number, chatUser: ChatUser) => {
    const userCanBeAdded = await canUserBeAdded(chatUser, userId);
    if (!userCanBeAdded) throw new Error("You Don't have permission to add this user");

    const participants = await getChatParticipantsIds(chatUser.chatId);

    const maxSize = await groupService.getSizeLimit(chatUser.chatId);
    if (participants.length == maxSize || participants.length == MAX_GROUP_SIZE)
        throw new Error("Can't Add User, Group size limit reached");

    await groupService.addUser(chatUser.user.id, chatUser.chatId);

    const userChat = await getChat(chatUser.user.id, chatUser.chatId);
    participants.push(chatUser.user.id);

    return { participants, userChat };
};
export const removeUser = async (userId: number, user: UserType, chatId: number) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    const participants = await getChatParticipantsIds(chatId);

    await groupService.removeUser(user.id, chatId);

    return participants;
};
export const getPermissions = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (!userId || isNaN(userId)) throw new HttpError("Invalid user id", 404);

    const chatId = Number(req.params.chatId);
    if (!chatId || isNaN(chatId)) throw new HttpError("Invalid user id", 404);

    const permissions = await groupService.getPermissions(userId, chatId);

    res.status(200).json(permissions);
};
export const setPermissions = async (req: Request, res: Response) => {
    const adminId = Number(req.userId);
    if (!adminId) throw new HttpError("User Not Authorized", 401);

    const userId = Number(req.params.userId);
    if (!userId) throw new HttpError("userId missing", 404);

    const chatId = Number(req.params.chatId);
    if (!chatId) throw new HttpError("chatId missing", 404);

    const isAdmin = await groupService.isAdmin({ userId: adminId, chatId });
    if (!isAdmin) throw new HttpError("You're not an admin", 401);

    const permissions = req.body;
    console.log(permissions);
    if (
        !permissions ||
        permissions.canDelete == undefined ||
        permissions.canDownload == undefined ||
        permissions.canEdit == undefined ||
        permissions.canPost == undefined
    )
        throw new HttpError("missing permissions", 404);
    await groupService.setPermissions(userId, chatId, permissions);

    res.status(200).json({ success: true, message: "User Permissions Updated Successfully" });
};

export const setSizeLimit = async (req: Request, res: Response) => {
    const adminId = Number(req.userId);
    if (!adminId || isNaN(adminId)) throw new HttpError("Invalid user id", 401);

    const chatId = Number(req.params.chatId);
    if (!chatId || isNaN(chatId)) throw new HttpError("Invalid user id", 404);

    const maxSize = Number(req.params.maxSize);
    if (!maxSize || isNaN(maxSize)) throw new HttpError("Invalid Size", 404);

    const isAdmin = await groupService.isAdmin({ userId: adminId, chatId });
    if (!isAdmin) throw new HttpError("You're not an admin", 401);

    await groupService.updateSizeLimit(chatId, maxSize);

    res.status(200).json({ message: "successfully updated group size limit" });
};
