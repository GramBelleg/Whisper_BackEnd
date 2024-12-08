import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";

export const broadCast = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        sendToClient(userId, clients, emitEvent, emitMessage);
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
