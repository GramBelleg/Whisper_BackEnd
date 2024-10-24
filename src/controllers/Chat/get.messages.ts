import { Request, Response } from "express";
import { getMessages } from "@services/chat/message.service";

export const handleGetAllMessages = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId, 10);
    const messages = await getMessages(userId, chatId);
    res.status(200).json(messages);
};
