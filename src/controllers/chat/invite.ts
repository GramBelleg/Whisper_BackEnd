import { ChatUser, ChatUserSummary } from "@models/chat.models";
import * as channelService from "@services/chat/channel.service";
import * as groupService from "@services/chat/group.service";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import { displayedUser, getAddPermission } from "@services/user/user.service";
import { getClients } from "@socket/web.socket";
import HttpError from "@src/errors/HttpError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as chatHandler from "@socket/handlers/chat.handlers";
import { UserType } from "@models/user.models";
import { joinChannel } from "./channel";

export const invite = async (req: Request, res: Response) => {
    const redirect = String(process.env.GOOGLE_REDIRECT_URI);
    try {
        const token = req.query.token;
        const userId = req.userId;
        if (!userId) throw new HttpError("Unauthorized user", 401);
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
                    await chatHandler.broadCast(participants[i], clients, "addUser", {
                        user,
                        chatId,
                    });
                } else {
                    await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
                }
            }

        res.status(200).redirect(redirect);
    } catch (err: any) {
        res.status(err.status ? err.status : 400).redirect(redirect);
    }
};
