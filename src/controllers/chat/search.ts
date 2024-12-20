import { Request, Response } from "express";
import * as searchService from "@services/search/search.service";

export const handleSearchMembers = async (req: Request, res: Response) => {
    const chatId: number = Number(req.params.chatId);
    const userId: number = req.userId;
    const query: string = String(req.query.query);
    const users = await searchService.getMembers(userId, chatId, query);
    res.status(200).json({ users });
};

export const handleSearchAllChats = async (req: Request, res: Response) => {
    const userId: number = req.userId;
    const query: string = String(req.query.query);
    const chats = await searchService.getChats(userId, query);
    res.status(200).json(chats);
};
