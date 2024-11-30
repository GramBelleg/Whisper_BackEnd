import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import { createChat } from "@controllers/chat/create.chat";
export const setupChatEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "createChat",
        socketWrapper(async (newChat: types.newChat) => {
            const createdChat = await createChat(userId, newChat);
            if (savedMessage) {
                await messageHandler.userBroadCast(
                    userId,
                    message.chatId,
                    clients,
                    "message",
                    savedMessage
                );
            }
        })
    );
};
