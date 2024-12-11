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
import {
    validateChatAndUser,
    validateMessageAndUser,
    validateUserisSender,
} from "@validators/chat";
import { filterAllowedMessagestoRead } from "@services/chat/chat.service";

export const handleGetMessageStatus = async (req: Request, res: Response) => {
    const userId = req.userId;
    const messageId = Number(req.params.messageId);
    if (!(await validateMessageAndUser(userId, messageId, res))) return;
    if (!(await validateUserisSender(userId, messageId, res))) return;
    const messageStatus = await getMessageStatus(userId, messageId);
    res.status(200).json(messageStatus);
};

export const handleEditContent = async (userId: number, messageId: number, content: string) => {
    if (!(await validateMessageAndUser(userId, messageId, null))) {
        throw new Error("User can't access this message");
    }
    if (!(await validateUserisSender(userId, messageId, null))) {
        throw new Error("User can't edit this message");
    }
    const editedMessage = await editMessage(messageId, content);
    return { id: editedMessage.id, content: editedMessage.content };
};

export const handlePinMessage = async (
    userId: number,
    messageId: number
): Promise<number | null> => {
    if (!(await validateMessageAndUser(userId, messageId, null))) {
        throw new Error("User can't access this message");
    }
    const pinnedMessage = await pinMessage(messageId);
    return pinnedMessage.id;
};

export const handleUnpinMessage = async (
    userId: number,
    messageId: number
): Promise<number | null> => {
    if (!(await validateMessageAndUser(userId, messageId, null))) {
        throw new Error("User can't access this message");
    }
    const unpinnedMessage = await unpinMessage(messageId);
    return unpinnedMessage.id;
};

export const handleDeliverAllMessages = async (userId: number) => {
    return await deliverAllMessages(userId);
};

export const handleDeliverMessage = async (userId: number, messageId: number) => {
    if (!(await validateMessageAndUser(userId, messageId, null))) {
        throw new Error("User can't access this message");
    }
    return await deliverMessage(userId, messageId);
};

export const handleReadMessages = async (userId: number, messages: number[], chatId: number) => {
    const messageIds = await filterAllowedMessagestoRead(userId, messages, chatId);
    return await readMessages(userId, messageIds, chatId);
};

export const handleReadAllMessages = async (userId: number, chatId: number) => {
    if (!(await validateChatAndUser(userId, chatId, null))) {
        throw new Error("User does not belong to chat");
    }
    return await readAllMessages(userId, chatId);
};

export default handleEditContent;
