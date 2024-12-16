import { Request, Response } from "express";
import * as chatService from "@services/chat/chat.service";

export const getAddableUsers = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const users = await chatService.getAddableUsers(userId, chatId);
    res.status(200).json({ users });
};
export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;

    let usersOnly = false;
    if (req.query.usersOnly === undefined) usersOnly = false;
    else usersOnly = Boolean(req.query.usersOnly);

    let noKey: number | boolean = false;
    if (req.query.noKey === undefined) noKey = false;
    else noKey = parseInt(req.query.noKey as string);

    //TODO: implement unblockedOnly
    let unblockedOnly = false;
    if (req.query.unblockedOnly === undefined) unblockedOnly = true;
    else unblockedOnly = Boolean(req.query.unblockedOnly);

    let chats;
    const usersOnlyType = usersOnly ? "DM" : null;
    chats = await chatService.getChatsSummaries(userId, usersOnlyType, noKey);
    res.status(200).json(chats);
};
