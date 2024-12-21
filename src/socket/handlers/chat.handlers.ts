import { Socket } from "socket.io";
import { sendToClient } from "@socket/utils/socket.utils";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";

export const broadCast = (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
) => {
    try {
        sendToClient(userId, clients, emitEvent, emitMessage);
    } catch (error: any) {
        throw new Error(`Error in broadCast: ${error.message}`);
    }
};

export const handleChatPermissions = async (
    userId: number,
    chatId: number,
    groupHandler: any,
    channelHandler: any
) => {
    const chatType = await getChatType(chatId);
    if (chatType == ChatType.GROUP && groupHandler) {
        await groupHandler(userId, chatId);
    } else if (chatType == ChatType.CHANNEL && channelHandler) {
        await channelHandler(userId, chatId);
    }
};
