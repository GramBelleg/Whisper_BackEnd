import { Response } from "express";
import {
    chatExists,
    isUserAllowedToAccessMessage,
    isUserAMember,
    messageExists,
    userIsSender,
} from "@services/chat/chat.service";
import { CreatedChat } from "@models/chat.models";
import { MAX_GROUP_SIZE } from "@config/constants.config";

export const validateChatAndUser = async (
    userId: number,
    chatId: number,
    res: Response | null
): Promise<boolean> => {
    if (!(await chatExists(chatId))) {
        if (res) res.status(404).json({ message: "Chat not found" });
        return false;
    }
    if (!(await isUserAMember(userId, chatId))) {
        if (res) res.status(403).json({ message: "You are not a member of this chat" });
        return false;
    }
    return true;
};

export const validateMessageAndUser = async (
    userId: number,
    messageId: number,
    res: Response | null
): Promise<boolean> => {
    if (!(await messageExists(messageId))) {
        if (res) res.status(404).json({ message: "Message not found" });
        return false;
    }
    if (!(await isUserAllowedToAccessMessage(userId, messageId))) {
        if (res) res.status(403).json({ message: "You can't access this message" });
        return false;
    }
    return true;
};

export const validateUserisSender = async (
    userId: number,
    messageId: number,
    res: Response | null
): Promise<boolean> => {
    if (!(await userIsSender(userId, messageId))) {
        if (res) res.status(403).json({ message: "User isn't the message sender" });
        return false;
    }
    return true;
};

export const validateChatUserIds = (userId: number, users: number[], chat: CreatedChat) => {
    const uniqueUsers = new Set(users);
    if (!uniqueUsers.has(userId)) {
        throw new Error("You must be one of the users in the chat");
    }
    if (uniqueUsers.size !== users.length) {
        throw new Error("Users must be unique");
    }
    if (chat.type == "DM") {
        if (users.length != 2) {
            throw new Error("DM chat must have 2 users");
        }
    } else if (chat.type == "GROUP") {
        if (users.length > MAX_GROUP_SIZE) {
            throw new Error("Group size must be smaller");
        }
    }
};
