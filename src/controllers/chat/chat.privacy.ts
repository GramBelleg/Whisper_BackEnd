import { setChatPrivacy } from "@services/chat/chat.service";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
export const handleSetChatPrivacy = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    if (!chatId) throw new HttpError("chatId missing", 404);

    const isPrivate = req.body.isPrivate;
    if (isPrivate == undefined) throw new HttpError("chatId missing", 404);

    await setChatPrivacy(chatId, isPrivate);

    res.status(200).json({
        success: true,
        message: "Chat Privacy updated successfully",
    });
};
