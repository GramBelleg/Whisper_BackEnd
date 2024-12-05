import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";

export const userBroadCast = async (
    participants: number[],
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any[]
): Promise<void> => {
    try {
        for (let i = 0; i < participants.length; i++) {
            sendToClient(participants[i], clients, emitEvent, emitMessage[i]);
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
export const broadCast = async (
    participants: number[],
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        for (let i = 0; i < participants.length; i++) {
            sendToClient(participants[i], clients, emitEvent, emitMessage);
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
