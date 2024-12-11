import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";

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

export const handleChatPermissions = async (userId: number, chatId: number, handler: any) => {
    const chatType = await getChatType(chatId);
    if (chatType == ChatType.GROUP || chatType == ChatType.CHANNEL) await handler(userId, chatId);
};
