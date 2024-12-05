import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import * as createChatController from "@controllers/chat/create.chat";
import * as groupController from "@controllers/chat/group.chat";
import * as chatHandler from "@socket/handlers/chat.handlers";
import { E } from "@faker-js/faker/dist/airline-BLb3y-7w";

export const setupChatEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "createChat",
        socketWrapper(async (chat: types.CreatedChat) => {
            const savedChat = await createChatController.handleCreateChat(userId, chat, chat.users);
            if (savedChat) {
                for (let i = 0; i < chat.users.length; i++)
                    await chatHandler.broadCast(chat.users[i], clients, "createChat", savedChat[i]);
            }
        })
    );
    socket.on(
        "addAdmin",
        socketWrapper(async (admin: types.chatUserSummary) => {
            const participants = await groupController.addAdmin(userId, admin);
            for (let i = 0; i < participants.length; i++)
                await chatHandler.broadCast(participants[i], clients, "addAdmin", admin);
        })
    );
    socket.on(
        "addUser",
        socketWrapper(async (chatUser: types.chatUser) => {
            const { participants, userChat } = await groupController.addUser(userId, chatUser);
            for (let i = 0; i < participants.length; i++) {
                if (participants[i] != chatUser.user.id)
                    await chatHandler.broadCast(participants[i], clients, "addUser", chatUser);
                else await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
            }
        })
    );
};
