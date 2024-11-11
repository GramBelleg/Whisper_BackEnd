import { Request, Response } from "express";
import { muteChat } from "@services/chat/chat.service";

export const handleMuteChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const type = req.body.type; //TO BE DONE
    const duration = req.body.duration; //TO BE DONE
    await muteChat(chatId, userId);
    res.status(200).json({ Message: `Chat ${chatId} muted successfully` });
};
