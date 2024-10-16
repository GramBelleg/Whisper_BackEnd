import { Request, Response } from "express";
import { getChats } from "@services/chat-service/chat.service";

export const getAllChats = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const chats = await getChats(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: "Error getting chats", error });
    }
};
