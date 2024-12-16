import { Request, Response } from "express";
import * as messageService from "@services/chat/message.service";
import { filterAllowedMessagestoDelete, setNewLastMessage } from "@services/chat/chat.service";
import { validateChatAndUser } from "@validators/chat";

export const deleteComments = async (ids: number[], userId: number) => {
    await messageService.deleteComments(userId, ids);
};
export const deleteMessagesForCurrentUser = async (req: Request, res: Response) => {
    const userId = req.userId;
    let Ids: number[];
    try {
        Ids = JSON.parse(req.query.Ids as string).map(Number);
    } catch (error) {
        res.status(400).json({ Message: "Invalid Ids query parameter" });
        return;
    }
    const chatId = Number(req.params.chatId);
    if (!(await validateChatAndUser(userId, chatId, res))) return;
    const messageIds = await filterAllowedMessagestoDelete(userId, Ids, chatId);
    await messageService.deleteMessagesForUser(userId, messageIds);
    await setNewLastMessage(chatId);
    res.status(200).json({ Message: "Messages deleted successfully" });
};

export const deleteMessagesForAllUsers = async (Ids: number[], chatId: number) => {
    await messageService.deleteMessagesForAll(Ids);
    await setNewLastMessage(chatId);
};

export default deleteMessagesForAllUsers;
