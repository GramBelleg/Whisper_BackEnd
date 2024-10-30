import { Request, Response } from "express";
import { deleteMessagesForUser, deleteMessagesForAll } from "@services/chat1/message.service";
import { setNewLastMessage } from "@services/chat1/chat.service";

export const deleteMessagesForCurrentUser = async (req: Request, res: Response) => {
    const userId = req.userId;
    const Ids = req.body.Ids;
    const chatId = Number(req.params.chatId);
    await deleteMessagesForUser(userId, Ids);
    await setNewLastMessage(chatId);
    res.status(200).json({ message: "Messages deleted" });
};

export const deleteMessagesForAllUsers = async (Ids: number[], chatId: number) => {
    try {
        await deleteMessagesForAll(Ids);
        await setNewLastMessage(chatId);
    } catch (error) {
        console.error("Error deleting message:", error);
    }
};

export default deleteMessagesForAllUsers;
