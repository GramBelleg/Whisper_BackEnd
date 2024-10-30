import { Request, Response } from "express";
import { getMessages } from "@services/chat1/message.service";
import { buildReceivedMessage } from "./format.message";
import { getLastMessage } from "@services/chat1/chat.service";

export const handleGetAllMessages = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId, 10);
    const result = await getMessages(userId, chatId);

    const messages = await Promise.all(
        result.map(async (message) => {
            return await buildReceivedMessage(userId, message.message);
        })
    );

    res.status(200).json(messages);
};

export const handleGetLastMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId, 10);
    const lastMessage = await getLastMessage(userId, chatId);
    res.status(200).json(lastMessage);
};
