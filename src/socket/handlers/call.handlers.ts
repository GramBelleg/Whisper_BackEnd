import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { Message } from "@prisma/client";
import { buildReceivedMessage } from "@controllers/messages/format.message";

export const startCall = async (
    clients: Map<number, Socket>,
    participants: number[],
    tokens: string[],
    notification: any,
    message: Message,
    userId: number
    
): Promise<void> => {
    const builtMessage = await buildReceivedMessage(message.senderId, message);
    sendToClient(message.senderId, clients, "message", builtMessage[0]);
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "call", {token: tokens[i], ...notification});
        sendToClient(participants[i], clients, "message", builtMessage[1]);
    }
};

export const callLog = async (
    clients: Map<number, Socket>,
    participants: number[],
    message: any
): Promise<void> => {
    const builtMessage = await buildReceivedMessage(message.senderId, message);
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "editMessage", message);
    }
}


export const cancelCall = async (
    clients: Map<number, Socket>,
    participants: number[],
    message: Message
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "callCanceled", message);
    }
}