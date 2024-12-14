import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { Message } from "@prisma/client";

export const startCall = async (
    clients: Map<number, Socket>,
    participants: number[],
    tokens: string[],
    notification: any,
    message: Message
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "call", {token: tokens[i], ...notification});
        sendToClient(participants[i], clients, "message", message);
    }
};

export const callLog = async (
    clients: Map<number, Socket>,
    participants: number[],
    message: Message
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "message", message);
    }
}