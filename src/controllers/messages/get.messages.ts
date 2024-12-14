import { Request, Response } from "express";
import {
    getSingleMessage,
    getMessages,
    getPinnedMessages,
    getComments,
} from "@services/chat/message.service";
import { buildReceivedMessage } from "./format.message";
import { getLastMessage } from "@services/chat/chat.service";
import { Message } from "@prisma/client";
import { validateChatAndUser, validateMessageAndUser } from "@validators/chat";

export const handleGetComments = async (req: Request, res: Response) => {
    const userId = req.userId;
    const messageId = Number(req.params.messageId);
    const result = await getComments(userId, messageId);

    res.status(200).json(result);
};

const getPerUserMessage = async (userId: number, message: Message) => {
    const senderIdx = userId === message.senderId ? 0 : 1;
    return (await buildReceivedMessage(userId, message))[senderIdx];
};

export const handleGetAllMessages = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    const result = await getMessages(userId, chatId);

    const messages = await Promise.all(
        result.map(async (message) => {
            return await getPerUserMessage(userId, message);
        })
    );

    const pinnedMessages = await getPinnedMessages(chatId);

    const formattedMessages = { pinnedMessages, messages };

    res.status(200).json(formattedMessages);
};

export const handleGetMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const messageId = Number(req.params.messageId);
    if (!(await validateMessageAndUser(userId, messageId, res))) return;
    const result = await getSingleMessage(userId, messageId);
    const message = await getPerUserMessage(userId, result!.message);
    res.status(200).json(message);
};

export const handleGetLastMessage = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId, 10);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    const lastMessage = await getLastMessage(userId, chatId);
    res.status(200).json(lastMessage);
};
