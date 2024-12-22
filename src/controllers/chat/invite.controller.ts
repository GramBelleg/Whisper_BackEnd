import { getClients } from "@socket/web.socket";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { joinChannel } from "./channel";
import { displayedUser } from "@services/user/user.service";
import * as chatHandler from "@socket/handlers/chat.handlers";

export const invite = async (req: Request, res: Response) => {
    const token = req.query.token;
    const userId = req.userId;
    if (!token || typeof token != "string") throw new HttpError("Invalid invite link", 404);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
        ignoreExpiration: true,
    }) as Record<string, any>;
    const chatId = decoded.chatId;

    const clients = getClients();
    if (!clients) throw new HttpError("Failed to retrieve clients", 400);

    const { participants, userChat } = await joinChannel(userId, chatId);
    if (participants)
        for (let i = 0; i < participants.length; i++) {
            if (participants[i] !== userId) {
                const user = await displayedUser(participants[i], userId);
                await chatHandler.broadCast(participants[i], clients, "addUser", { user, chatId });
            } else {
                await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
            }
        }

    res.status(200).json({ chatId });
};
