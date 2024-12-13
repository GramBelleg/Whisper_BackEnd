import { Request, Response } from "express";
import { getChat, muteChat, unmuteChat, updateSelfDestruct } from "@services/chat/chat.service";
import { saveMuteDuration } from "@services/chat/redis.service";
import { validateChatAndUser } from "@validators/chat";
import { ChatSettings } from "@models/chat.models";

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

export const handleChatSettings = async (userId: number, chatSettings: ChatSettings) => {
    if (!(await validateChatAndUser(userId, chatSettings.id, null))) {
        throw new Error("User does not belong to chat");
    }
    if (chatSettings.selfDestruct !== undefined) {
        await updateSelfDestruct(chatSettings.id, chatSettings.selfDestruct);
    }
    //TODO: Add more settings like group settings or isBlocked
    return await getChat(userId, chatSettings.id);
};
