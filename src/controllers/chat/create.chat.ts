import { Request, Response } from "express";
import { createChat, createGroup } from "@services/chat/chat.service";
import { getUserId } from "@services/user/user.service";
import { newChat } from "@models/chat.models";

export const handleCreateChat = async (userId: number, newChat: newChat) => {
    if (!newChat.name) throw new Error("Missing Chat Name");

    if (!newChat.type) throw new Error("Missing Chat type");

    if (!newChat.participants) throw new Error("Missing Chat participants");

    const { chatId, participants } = await createChat(newChat.participants, newChat.type);
    if (newChat.type == "GROUP") await createGroup(chatId, participants, newChat, userId);

    return chatId;
};
