import { Request, Response } from "express";
import { validateChatAndUser } from "@validators/chat";
import { getChatMembers, getChatType } from "@services/chat/chat.service";
import { getGroupMembers } from "@services/chat/group.service";
import { getChannelMembers } from "@controllers/chat/channel";
import { ChatType } from "@prisma/client";

export const handleGetChatMembers = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(req.userId, chatId, res))) return;

    const type = await getChatType(chatId);
    let chatMembers;
    if (type == ChatType.DM) chatMembers = await getChatMembers(userId, chatId);
    else if (type == ChatType.GROUP) chatMembers = await getGroupMembers(userId, chatId);
    else if (type == ChatType.CHANNEL) chatMembers = await getChannelMembers(userId, chatId);
    res.status(200).json(chatMembers);
};
