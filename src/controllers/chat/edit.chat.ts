import { Request, Response } from "express";
import { muteChat, unmuteChat } from "@services/chat/chat.service";
import { saveMuteDuration } from "@services/chat/redis.service";

export const handleMuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const type = req.body.type; //NOT NEEDED SINCE ONLY DMs ARE IMPLEMENTED
    const duration = req.body.duration;
    await muteChat(chatId, userId);
    if (duration) await saveMuteDuration(userId, chatId, duration);
    res.status(200).json({ Message: `Chat ${chatId} muted successfully` });
};

export const handleUnmuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    await unmuteChat(chatId, userId);
    res.status(200).json({ Message: `Chat ${chatId} unmuted successfully` });
};
