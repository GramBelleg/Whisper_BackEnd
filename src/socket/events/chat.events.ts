import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import * as createChatController from "@controllers/chat/create.chat";
import * as chatHandler from "@socket/handlers/chat.handlers";

export const setupChatEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "createChat",
        socketWrapper(async (chat: types.CreatedChat) => {
            const savedChat = await createChatController.handleCreateChat(userId, chat, chat.users);
            if (savedChat) {
                await chatHandler.userBroadCast(chat.users, clients, "createChat", savedChat);
            }
        })
    );
};
import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import { handleCreateChat } from "@controllers/chat/create.chat";
import * as chatHandler from "@socket/handlers/chat.handler";
export const setupChatEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "createChat",
        socketWrapper(async (newChat: types.newChat) => {
            const createdChatId = await handleCreateChat(userId, newChat);
            if (createdChatId) {
                await chatHandler.broadCast(newChat, clients, "createChat", savedMessage);
            }
        })
    );
};
