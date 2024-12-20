import { Request, Response } from "express";
import * as searchService from "@services/search/search.service";

export const handleSearchMembers = async (req: Request, res: Response) => {
    const chatId: number = Number(req.params.chatId);
    const query: string = String(req.query.query);
    const users = searchService.getMembers(chatId, query);
    res.status(200).json(users);
};
