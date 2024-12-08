import { Response } from "express";
import { chatExists, isUserAMember } from "@services/chat/chat.service";
import { CreatedChat } from "@models/chat.models";

export const validateChatAndUser = async (
    userId: number,
    chatId: number,
    res: Response
): Promise<boolean> => {
    if (!(await chatExists(chatId))) {
        res.status(404).json({ message: "Chat not found" });
        return false;
    }
    if (!(await isUserAMember(userId, chatId))) {
        res.status(403).json({ message: "You are not a member of this chat" });
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
    }
};
