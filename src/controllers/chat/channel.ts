import { ChatUser, ChatUserSummary } from "@models/chat.models";
import * as channelService from "@services/chat/channel.service";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import { displayedUser, getAddPermission } from "@services/user/user.service";
import { getSocket } from "@socket/web.socket";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const invite = async (req: Request, res: Response) => {
    const token = req.query.token;
    const userId = req.userId;
    if (!userId) throw new HttpError("Unauthorized user", 401);
    if (!token || typeof token != "string") throw new HttpError("Invalid invite link", 404);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
        ignoreExpiration: true,
    }) as Record<string, any>;
    const chatId = decoded.chatId;

    const socket = getSocket(userId);
    if (!socket) throw new HttpError("Failed to retrieve user socket", 400);

    const user = displayedUser(userId);
    socket.emit("subscribe", { user, chatId });

    res.status(200).json({ chatId });
};

export const getPermissions = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (!userId || isNaN(userId)) throw new HttpError("Invalid user id", 404);

    const chatId = Number(req.params.chatId);
    if (!chatId || isNaN(chatId)) throw new HttpError("Invalid user id", 404);

    const permissions = await channelService.getPermissions(userId, chatId);

    res.status(200).json(permissions);
};

export const setPermissions = async (req: Request, res: Response) => {
    const adminId = Number(req.userId);
    if (!adminId) throw new HttpError("User Not Authorized", 401);

    const userId = Number(req.params.userId);
    if (!userId) throw new HttpError("userId missing", 404);

    const chatId = Number(req.params.chatId);
    if (!chatId) throw new HttpError("chatId missing", 404);

    const isAdmin = await channelService.isAdmin({ userId: adminId, chatId });
    if (!isAdmin) throw new HttpError("You're not an admin", 401);

    const permissions = req.body;
    console.log(permissions);
    if (!permissions || permissions.canDownload == undefined || permissions.canComment == undefined)
        throw new HttpError("missing permissions", 404);
    await channelService.setPermissions(userId, chatId, permissions);

    res.status(200).json({ success: true, message: "User Permissions Updated Successfully" });
};

export const addAdmin = async (userId: number, admin: ChatUserSummary) => {
    const isAdmin = await channelService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    await channelService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};
const canUserBeAdded = async (chatUser: ChatUser, adderId: number) => {
    const addPermission = await getAddPermission(chatUser.user.id);
    const isAdmin = await channelService.isAdmin({ userId: adderId, chatId: chatUser.chatId });
    return (isAdmin && !addPermission) || addPermission;
};
export const addUser = async (userId: number, chatUser: ChatUser) => {
    const userCanBeAdded = await canUserBeAdded(chatUser, userId);
    if (!userCanBeAdded) throw new Error("You Don't have permission to add this user");

    const participants = await getChatParticipantsIds(chatUser.chatId);

    await channelService.addUser(chatUser.user.id, chatUser.chatId);

    const userChat = await getChat(chatUser.user.id, chatUser.chatId);
    participants.push(chatUser.user.id);

    return { participants, userChat };
};
