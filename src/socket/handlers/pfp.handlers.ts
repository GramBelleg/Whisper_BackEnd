import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import redisClient from "@src/redis/redis.client";
import { SaveableStory } from "@models/story.models";
import * as userServices from "@services/user/user.service";
import { PrismaClient, Privacy } from "@prisma/client";

const getAllowedUsers = async (userId: number, clients: Map<number, Socket>) => {
    //includes the user himslef is that right?
    const privacy = await userServices.getPfpPrivacy(userId);
    if (privacy == Privacy.Everyone) return Array.from(clients.keys());
    else if (privacy == Privacy.Contact) return await userServices.getUserContacts(userId);
    else return [userId];
};
export const broadCast = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const userIds = await getAllowedUsers(userId, clients);
        if (userIds) {
            for (const user of userIds) {
                sendToClient(user, clients, emitEvent, emitMessage);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
