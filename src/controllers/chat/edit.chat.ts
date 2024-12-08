import { Request, Response } from "express";
import { muteChat, unmuteChat } from "@services/chat/chat.service";
import { saveMuteDuration } from "@services/chat/redis.service";
import { validateChatAndUser } from "@validators/chat";

export const handleMuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    const duration = req.body.duration;
    await muteChat(chatId, userId);
    if (duration) await saveMuteDuration(userId, chatId, duration);
    res.status(200).json({ message: `Chat ${chatId} muted successfully` });
};

export const handleUnmuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;

    await unmuteChat(chatId, userId);
    res.status(200).json({ message: `Chat ${chatId} unmuted successfully` });
};
