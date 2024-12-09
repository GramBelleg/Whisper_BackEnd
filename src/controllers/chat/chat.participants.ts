import { Request, Response } from "express";
import { getChatMembers, getChatType, getGroupMembers } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";

export const handleGetChatMembers = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    const type = await getChatType(chatId);
    let chatMembers;
    if (type == ChatType.DM) chatMembers = await getChatMembers(chatId);
    else if (type == ChatType.GROUP) chatMembers = await getGroupMembers(chatId);

    res.status(200).json(chatMembers);
};
