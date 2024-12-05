import { Request, Response } from "express";
import {
    editMessage,
    pinMessage,
    unpinMessage,
    deliverAllMessages,
    deliverMessage,
    readMessages,
    readAllMessages,
    getMessageStatus,
} from "@services/chat/message.service";

export const handleGetMessageStatus = async (req: Request, res: Response) => {
    const messageId = Number(req.params.messageId);
    const messageStatus = await getMessageStatus(messageId);
    if (!messageStatus) {
        res.status(404).json({ message: "Message not found" });
        return;
    }
    res.status(200).json(messageStatus);
};

export const handleEditContent = async (messageId: number, content: string) => {
    try {
        const editedMessage = await editMessage(messageId, content);
        return { id: editedMessage.id, content: editedMessage.content };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handlePinMessage = async (messageId: number): Promise<number | null> => {
    try {
        const pinnedMessage = await pinMessage(messageId);
        return pinnedMessage.id;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleUnpinMessage = async (messageId: number): Promise<number | null> => {
    try {
        const unpinnedMessage = await unpinMessage(messageId);
        return unpinnedMessage.id;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleDeliverAllMessages = async (userId: number) => {
    try {
        return await deliverAllMessages(userId);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleDeliverMessage = async (userId: number, messageId: number) => {
    try {
        return await deliverMessage(userId, messageId);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleReadMessages = async (userId: number, messages: number[], chatId: number) => {
    try {
        return await readMessages(userId, messages, chatId);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleReadAllMessages = async (userId: number, chatId: number) => {
    try {
        return await readAllMessages(userId, chatId);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default handleEditContent;
