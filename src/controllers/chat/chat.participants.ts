import { Request, Response } from "express";
import { getChatMembers } from "@services/chat/chat.service";

export const handleGetChatMembers = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    const chatMembers = await getChatMembers(chatId);
    res.status(200).json(chatMembers);
};
