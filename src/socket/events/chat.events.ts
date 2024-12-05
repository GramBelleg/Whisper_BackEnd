import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import * as createChatController from "@controllers/chat/create.chat";
import * as groupController from "@controllers/chat/group.chat";
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
    socket.on(
        "addAdmin",
        socketWrapper(async (admin: types.chatUser) => {
            console.log(admin);
            const participants = await groupController.addAdmin(userId, admin);
            await chatHandler.broadCast(participants, clients, "addAdmin", admin);
        })
    );
};
