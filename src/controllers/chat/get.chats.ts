import { Request, Response } from "express";
import { getChatsSummaries } from "@services/chat/chat.service";

export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chats = await getChatsSummaries(userId);
    res.status(200).json(chats);
};
