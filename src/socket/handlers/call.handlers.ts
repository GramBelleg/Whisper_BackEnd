import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";

export const call = async (
    clients: Map<number, Socket>,
    participants: number[],
    chatId: any
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "call", chatId);
    }
};