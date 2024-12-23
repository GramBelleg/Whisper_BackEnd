import { ChatType } from "@prisma/client";
import { setChannelPrivacy } from "@services/chat/channel.service";
import { getChatType } from "@services/chat/chat.service";
import { setGroupPrivacy } from "@services/chat/group.service";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
export const handleSetChatPrivacy = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    if (!chatId) throw new HttpError("chatId missing", 404);

    const isPrivate = req.body.isPrivate;
    if (isPrivate == undefined) throw new HttpError("privacy setting is missing", 404);
    const chatType = await getChatType(chatId);
    if (chatType == ChatType.GROUP) await setGroupPrivacy(chatId, isPrivate);
    if (chatType == ChatType.CHANNEL) await setChannelPrivacy(chatId, isPrivate);

    res.status(200).json({
        success: true,
        message: "Chat Privacy updated successfully",
    });
};
