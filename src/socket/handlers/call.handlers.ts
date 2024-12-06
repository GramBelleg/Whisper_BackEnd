import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { clients } from "@socket/web.socket"


export const call = async (
    participants: number[],
    chatId: any
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "call", chatId);
    }
};