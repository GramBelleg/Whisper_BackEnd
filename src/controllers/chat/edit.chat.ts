import { Request, Response } from "express";
import { isDMChat, muteChat, unmuteChat, updateSelfDestruct } from "@services/chat/chat.service";
import { saveMuteDuration } from "@services/chat/redis.service";
import { validateChatAndUser } from "@validators/chat";
import { updateChatSettings } from "@socket/web.socket";
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

export const handleSelfDestruct = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    if (!(await isDMChat(chatId))) {
        res.status(400).json({ message: "This feature is only available for DM chats" });
        return;
    }
    const duration = req.body.duration;
    await updateSelfDestruct(chatId, duration);
    await updateChatSettings(chatId);
    res.status(200).json({ message: `Chat ${chatId} self destruct time updated successfully` });
};
