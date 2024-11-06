import { Socket } from "socket.io";
import * as userServices from "@services/user/user.service";
import { Privacy, Status } from "@prisma/client";
import { sendToClient } from "@socket/utils/socket.utils";
const getAllowedUsers = async (userId: number, clients: Map<number, Socket>) => {
    //includes the user himslef is that right?
    const privacy = await userServices.getLastSeenPrivacy(userId);
    if (privacy == Privacy.Everyone) return Array.from(clients.keys());
    else if (privacy == Privacy.Contact) return await userServices.getUserContacts(userId);
    else return [userId];
};

export const startConnection = async (
    userId: number,
    clients: Map<number, Socket>,
    socket: Socket
): Promise<void> => {
    console.log(`User ${userId} connected`);
    clients.set(userId, socket);
    await broadCast(userId, clients, Status.Online);
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

const broadCast = async (userId: number, clients: Map<number, Socket>, status: Status) => {
    try {
        const userIds = await getAllowedUsers(userId, clients);
        const lastSeen = await userServices.updateStatus(userId, status);
        if (userIds) {
            for (const user of userIds) {
                sendToClient(user, clients, "status", { userId, status, lastSeen });
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
