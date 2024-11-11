import { Request, Response } from "express";
import { getChatsSummaries } from "@services/chat/chat.service";

export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;

    let usersOnly = false;
    if (req.query.usersOnly === undefined) usersOnly = false;
    else usersOnly = Boolean(req.query.usersOnly);

    //TODO: implement unblockedOnly
    let unblockedOnly = false;
    if (req.query.unblockedOnly === undefined) unblockedOnly = true;
    else unblockedOnly = Boolean(req.query.unblockedOnly);

    let chats;
    const usersOnlyType = usersOnly ? "DM" : null;
    chats = await getChatsSummaries(userId, usersOnlyType);
    res.status(200).json(chats);
};
