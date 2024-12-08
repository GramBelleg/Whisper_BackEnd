import { Request, Response } from "express";
import { getChatMembers } from "@services/chat/chat.service";
import { validateChatAndUser } from "@validators/chat";

export const handleGetChatMembers = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(req.userId, chatId, res))) return;
    const chatMembers = await getChatMembers(chatId);
    res.status(200).json(chatMembers);
};
