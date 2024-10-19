import { Request, Response } from "express";
import { getMessages } from "@services/chat/message.service";

export const handleGetAllMessages = async (req: Request, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);
    const messages = await getMessages(chatId);
    res.status(200).json(messages);
};
