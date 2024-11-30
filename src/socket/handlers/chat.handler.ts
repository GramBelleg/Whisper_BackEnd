import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import { newChat } from "@models/chat.models";

export const broadCast = async (
    newChat: newChat,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        if (participants) {
            for (const participant of participants) {
                sendToClient(participant, clients, emitEvent, emitMessage);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};
