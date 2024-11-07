import { Request, Response } from "express";
import { getChatsSummaries } from "@services/chat/chat.service";

export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;
    //TODO: Implement usersOnly
    const usersOnly = req.query.usersOnly;
    //TODO: Implement Unblocked only
    const unblockedOnly = req.query.unblockedOnly;
    const chats = await getChatsSummaries(userId);
    res.status(200).json(chats);
};
