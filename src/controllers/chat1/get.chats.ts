import { Request, Response } from "express";
import { getChatsSummaries } from "@services/chat1/chat.service";

export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chats = await getChatsSummaries(userId);
    console.log(chats);
    res.status(200).json(chats);
};
