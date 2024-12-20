import { Request, Response } from "express";
import { muteChat, unmuteChat } from "@services/chat/chat.service";
import { saveMuteDuration } from "@services/chat/redis.service";
import { validateChatAndUser } from "@validators/chat";
import HttpError from "@src/errors/HttpError";

//duration = 1 => one week
//duration = 8 => 8 hours
export const handleMuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    let duration = req.body.duration;
    if (duration == 1) duration = 60 * 60 * 24 * 7;
    else if (duration == 8) duration = 60 * 60 * 8;
    else if (duration) throw new HttpError("Invalid duration", 400);
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
