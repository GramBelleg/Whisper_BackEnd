import { Socket } from "socket.io";
import { getChatId } from "@services/chat/chat.service";
import { sendToClient } from "@socket/utils/socket.utils";
import { deleteMessagesForAllUsers } from "@controllers/messages/delete.message";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import {
    handleDeliverAllMessages,
    handleReadAllMessages,
} from "@controllers/messages/edit.message";

export const broadCast = async (
    chatId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
): Promise<void> => {
    try {
        const participants: number[] = await getChatParticipantsIds(chatId);

        if (participants) {
            for (const participant of participants) {
                sendToClient(participant, clients, emitEvent, emitMessage);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
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

        if (receivers) {
            for (const receiver of receivers) {
                sendToClient(receiver, clients, emitEvent, emitMessage[1]);
            }
        }
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};

export const sendReadAndDeliveredGroups = async (
    clients: Map<number, Socket>,
    directTo: {
        chatId: number;
        messageIds: number[];
    }[][],
    emitEvent: string
): Promise<void> => {
    for (const key in directTo) {
        const senderId = parseInt(key);
        const groups = directTo[senderId];
        for (const group of groups) {
            sendToClient(senderId, clients, emitEvent, group);
        }
    }
};

export const readAllUserMessages = async (
    userId: number,
    clients: Map<number, Socket>,
    messages: number[]
) => {
    const directTo = await handleReadAllMessages(userId, messages);
    if (directTo) {
        sendReadAndDeliveredGroups(clients, directTo, "readMessage");
    }
};

export const deliverAllUserMessages = async (userId: number, clients: Map<number, Socket>) => {
    const directTo = await handleDeliverAllMessages(userId);
    if (directTo) {
        sendReadAndDeliveredGroups(clients, directTo, "deliverMessage");
    }
};

export const notifyExpiry = async (key: string, clients: Map<number, Socket>): Promise<void> => {
    try {
        const match = key.match(/\d+/);
        if (!match) return;

        const id: number = Number(match[0]);
        const chatId = await getChatId(id);
        if (!chatId) return;
        await deleteMessagesForAllUsers([id], chatId);

        broadCast(chatId, clients, "expireMessage", id);
    } catch (error: any) {
        throw new Error(`Error in notifyExpiry: ${error.message}`);
    }
};
