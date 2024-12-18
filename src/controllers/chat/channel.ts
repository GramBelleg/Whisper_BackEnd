import { ChatUser, ChatUserSummary } from "@models/chat.models";
import * as channelService from "@services/chat/channel.service";
import * as groupService from "@services/chat/group.service";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import { displayedUser, getAddPermission } from "@services/user/user.service";
import { getClients } from "@socket/web.socket";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as chatHandler from "@socket/handlers/chat.handlers";
import { UserType } from "@models/user.models";

export const getSettings = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    const settings = await channelService.getSettings(chatId);
    res.status(200).json(settings);
};

export const getChannelMembers = async (userId: number, chatId: number) => {
    const isAdmin = await channelService.isAdmin({ userId, chatId });
    if (!isAdmin) throw new Error("You're not an admin");
    return channelService.getChannelMembers(userId, chatId);
};

export const deleteChannel = async (userId: number, chatId: number) => {
    const isAdmin = await channelService.isAdmin({ userId, chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    const participants = getChatParticipantsIds(chatId);

    await groupService.deleteGroup(chatId);

    return participants;
};

export const leaveChannel = async (userId: number, chatId: number) => {
    const participants = channelService.getAdmins(chatId);

    await groupService.removeUser(userId, chatId);

    return participants;
};

export const joinChannel = async (userId: number, chatId: number) => {
    const participants = await channelService.getAdmins(chatId);

    await channelService.addUser(userId, chatId);

    const userChat = await getChat(userId, chatId);
    participants.push(userId);
    return { participants, userChat };
};
export const invite = async (req: Request, res: Response) => {
    const token = req.query.token;
    const userId = req.userId;
    if (!userId) throw new HttpError("Unauthorized user", 401);
    if (!token || typeof token != "string") throw new HttpError("Invalid invite link", 404);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
        ignoreExpiration: true,
    }) as Record<string, any>;
    const chatId = decoded.chatId;

    const clients = getClients();
    if (!clients) throw new HttpError("Failed to retrieve clients", 400);

    const user = await displayedUser(userId);
    const { participants, userChat } = await joinChannel(userId, chatId);
    console.log(participants);
    console.log(userChat);
    for (let i = 0; i < participants.length; i++) {
        if (participants[i] !== userId) {
            await chatHandler.broadCast(participants[i], clients, "addUser", { user, chatId });
        } else {
            await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
        }
    }

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

    return channelService.getAdmins(admin.chatId);
};
const canUserBeAdded = async (chatUser: ChatUser, adderId: number) => {
    const addPermission = await getAddPermission(chatUser.user.id);
    const isAdmin = await channelService.isAdmin({ userId: adderId, chatId: chatUser.chatId });
    return (isAdmin && !addPermission) || addPermission;
};
export const addUser = async (userId: number, chatUser: ChatUser) => {
    const userCanBeAdded = await canUserBeAdded(chatUser, userId);
    if (!userCanBeAdded) throw new Error("You Don't have permission to add this user");

    const participants = await channelService.getAdmins(chatUser.chatId);

    await channelService.addUser(chatUser.user.id, chatUser.chatId);

    const userChat = await getChat(chatUser.user.id, chatUser.chatId);
    participants.push(chatUser.user.id);

    return { participants, userChat };
};

export const removeUser = async (userId: number, user: UserType, chatId: number) => {
    const isAdmin = await channelService.isAdmin({ userId, chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    const participants = await getChatParticipantsIds(chatId);

    await groupService.removeUser(user.id, chatId);

    return participants;
};
