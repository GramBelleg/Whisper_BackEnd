import { Request, Response } from "express";
import { getChats } from "@services/Chat/chat.service";

export const getAllChats = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chats = await getChats(userId);
    res.status(200).json(chats);
};
