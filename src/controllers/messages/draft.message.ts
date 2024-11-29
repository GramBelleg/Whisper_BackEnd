import { Request, Response } from "express";
import { draftMessage, getDraftedMessage, undraftMessage } from "@services/chat/message.service";
import { DraftMessage } from "@models/messages.models";
import { buildDraftedMessage } from "./format.message";

export const handleDraftMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const message: DraftMessage = req.body;
    await draftMessage(userId, chatId, message);
    res.status(200).json("Drafted message successfully");
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

export const handleUndraftMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    await undraftMessage(userId, chatId);
    res.status(200).json("Undrafted message successfully");
};
