import { Request, Response } from "express";
import { getChatMessages } from "@services/chat-service/message.service";

export const getAllMessages = async (req: Request, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);
    const messages = await getChatMessages(chatId);
    res.status(200).json(messages);
};
