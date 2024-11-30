import { Request, Response } from "express";
import { createChat, createGroup } from "@services/chat/chat.service";
import { getUserId } from "@services/user/user.service";
import { newChat } from "@models/chat.models";

export const handleCreateChat = async (userId: number, newChat: newChat) => {
    if (!newChat.name) {
        throw new Error("Missing Chat Name");
    }
    const { chatId, participants } = await createChat(newChat.participants, newChat.type);
    if (newChat.type == "GROUP") await createGroup(chatId, newChat);

    return createdChat;
};
