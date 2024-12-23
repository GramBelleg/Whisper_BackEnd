import { Socket } from "socket.io";
import * as userServices from "@services/user/user.service";
import { Privacy, Status } from "@prisma/client";
import { sendToClient } from "@socket/utils/socket.utils";
import { deliverAllUserMessages } from "./message.handlers";
import { isBanned } from "@services/user/user.service";

export const getAllowedUsers = async (userId: number, clients: Map<number, Socket>) => {
    //includes the user himslef is that right?
    const privacy = await userServices.getLastSeenPrivacy(userId);
    if (privacy == Privacy.Everyone) return Array.from(clients.keys());
    else if (privacy == Privacy.Contacts) return await userServices.getUserContacts(userId);
    else return [userId];
};

export const broadCast = async (userId: number, clients: Map<number, Socket>, status: Status) => {
    const userIds = await getAllowedUsers(userId, clients);
    const lastSeen = await userServices.updateStatus(userId, status);
    if (userIds) {
        for (const user of userIds) {
            sendToClient(user, clients, "status", { userId, status, lastSeen });
        }
    }
};

export const startConnection = async (
    userId: number,
    clients: Map<number, Socket>,
    socket: Socket
): Promise<void> => {
    if (await isBanned(userId)) return;
    console.log(`User ${userId} connected`);
    clients.set(userId, socket);
    await broadCast(userId, clients, Status.Online);
    await deliverAllUserMessages(userId, clients);
};

export const endConnection = async (
    userId: number,
    clients: Map<number, Socket>
): Promise<void> => {
    console.log(`User ${userId} disconnected`);
    await broadCast(userId, clients, Status.Offline);
    if (clients.has(userId)) {
        clients.delete(userId);
    }
};
