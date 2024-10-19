import { Request, Response } from "express";
import { getChats } from "@services/chat/chat.service";

export const handleGetAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chats = await getChats(userId);
    res.status(200).json(chats);
};
