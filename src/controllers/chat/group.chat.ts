import { ChatUser, ChatUserSummary } from "@models/chat.models";
import { UserType } from "@models/user.models";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";

export const addAdmin = async (userId: number, admin: ChatUserSummary) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};
export const addUser = async (userId: number, ChatUser: ChatUser) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: ChatUser.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addUser(ChatUser.user.id, ChatUser.chatId);
    const participants = await getChatParticipantsIds(ChatUser.chatId);
    const userChat = await getChat(ChatUser.user.id, ChatUser.chatId);
    return { participants, userChat };
};
export const removeUser = async (userId: number, user: UserType, chatId: number) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId });
    if (!isAdmin) throw Error("You're not an admin");

    const participants = await getChatParticipantsIds(chatId);

    await groupService.removeUser(user.id, chatId);

    return participants;
};
export const getPermissions = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (!userId) throw new HttpError("userId missing", 404);

    const chatId = Number(req.params.chatId);
    if (!chatId) throw new HttpError("chatId missing", 404);

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
