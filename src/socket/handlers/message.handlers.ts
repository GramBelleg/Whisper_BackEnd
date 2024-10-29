import { Socket } from "socket.io";
import { getChatId } from "@services/chat/chat.service";
import { deleteMessagesForAllUsers } from "@controllers/chat/delete.message";
import { getChatParticipantsIds } from "@services/chat/chat.service";

export const sendToClient = async (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    if (clients.has(userId)) {
        const client = clients.get(userId);
        if (client) {
            client.emit(emitEvent, emitMessage);
        }
    }
};

export const broadCast = async (
    chatId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const participants: number[] = await getChatParticipantsIds(chatId);

        participants &&
            participants.forEach((participant) => {
                sendToClient(participant, clients, emitEvent, emitMessage);
            });
    } catch (error) {
        console.error(error);
    }
};

export const userBroadCast = async (
    userId: number,
    chatId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any[]
): Promise<void> => {
    try {
        const participants: number[] = await getChatParticipantsIds(chatId);

        const receivers = participants.filter((participant) => participant != userId);

        sendToClient(userId, clients, emitEvent, emitMessage[0]);

        console.log(emitMessage[0], emitMessage[1]);

        receivers &&
            receivers.forEach((receiver) => {
                sendToClient(receiver, clients, emitEvent, emitMessage[1]);
            });
    } catch (error) {
        console.error(error);
    }
};

export const notifyExpiry = async (key: string, clients: Map<number, Socket>): Promise<void> => {
    const match = key.match(/\d+/);
    if (!match) return;

    const id: number = Number(match[0]);
    const chatId = await getChatId(id);
    if (!chatId) return;
    await deleteMessagesForAllUsers([id], chatId);

    broadCast(chatId, clients, "expireMessage", id);
};
