import { Request, Response } from "express";
import { getMessages } from "@services/chat/message.service";
import { buildReceivedMessage } from "./format.message";
import { getLastMessage } from "@services/chat/chat.service";

export const handleGetAllMessages = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const result = await getMessages(userId, chatId);

    const messages = await Promise.all(
        result.map(async (message) => {
            const senderIdx = userId === message.message.senderId ? 0 : 1;
            return (await buildReceivedMessage(userId, message.message))[senderIdx];
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
