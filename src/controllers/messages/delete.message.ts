import { Request, Response } from "express";
import { deleteMessagesForUser, deleteMessagesForAll } from "@services/chat/message.service";
import { setNewLastMessage } from "@services/chat/chat.service";
import {
    deleteMessagesForAllInES,
    deleteMessagesforUserInES,
} from "@services/elasticsearch/message.service";

export const deleteMessagesForCurrentUser = async (req: Request, res: Response) => {
    const userId = req.userId;
    const Ids = JSON.parse(req.query.Ids as string).map(Number);
    const chatId = Number(req.params.chatId);
    await deleteMessagesForUser(userId, Ids);
    await deleteMessagesforUserInES(userId, Ids);
    await setNewLastMessage(chatId);
    res.status(200).json({ Message: "Messages deleted successfully" });
};

export const deleteMessagesForAllUsers = async (Ids: number[], chatId: number) => {
    try {
        await deleteMessagesForAll(Ids);
        await deleteMessagesForAllInES(Ids);
        await setNewLastMessage(chatId);
    } catch (error) {
        console.error("Error deleting message:", error);
    }
};

export default deleteMessagesForAllUsers;
