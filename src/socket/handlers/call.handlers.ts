import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";

export const call = async (
    clients: Map<number, Socket>,
    participants: number[],
    tokens: string[],
    channelName: string
): Promise<void> => {
    for (let i = 0; i < participants.length; i++) {
        sendToClient(participants[i], clients, "call", {token: tokens[i], channelName: channelName});
    }
};