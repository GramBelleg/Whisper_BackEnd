import { Request, Response } from "express";
import { draftMessage, getDraftedMessage } from "@services/chat/message.service";
import { DraftMessage } from "@models/messages.models";
import { buildDraftedMessage } from "./format.message";

export const handleDraftMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const message: DraftMessage & { chatId: number } = req.body;
    const { chatId } = message;
    const result = await draftMessage(userId, chatId, message);
    res.status(200).json(result);
};

export const handleGetDraftedMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const result = await getDraftedMessage(userId, chatId);
    if (!result || result?.draftContent === "") {
        res.status(404).json({ message: "No drafted message found" });
        return;
    }
    const draftedMessage = await buildDraftedMessage(userId, chatId, result);
    res.status(200).json(draftedMessage);
};
