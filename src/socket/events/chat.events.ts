import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import * as createChatController from "@controllers/chat/create.chat";
import * as groupController from "@controllers/chat/group.chat";
import * as channelController from "@controllers/chat/channel";
import * as chatHandler from "@socket/handlers/chat.handlers";
import { UserType } from "@models/user.models";
import { displayedUser } from "@services/user/user.service";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";
import { channel } from "diagnostics_channel";

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
        socketWrapper(async (admin: types.ChatUserSummary) => {
            let participants;
            const chatType = await getChatType(admin.chatId);

            if (chatType == ChatType.GROUP)
                participants = await groupController.addAdmin(userId, admin);
            else if (chatType == ChatType.CHANNEL)
                participants = await channelController.addAdmin(userId, admin);

            if (!participants) throw new Error("Error when adding Admin");
            for (let i = 0; i < participants.length; i++)
                await chatHandler.broadCast(participants[i], clients, "addAdmin", admin);
        })
    );
    socket.on(
        "addUser",
        socketWrapper(async (chatUser: types.ChatUser) => {
            let participants, userChat;
            const chatType = await getChatType(chatUser.chatId);

            if (chatType == ChatType.GROUP) {
                const data = await groupController.addUser(userId, chatUser);
                participants = data.participants;
                userChat = data.userChat;
            } else if (chatType == ChatType.CHANNEL) {
                const data = await channelController.addUser(userId, chatUser);
                participants = data.participants;
                userChat = data.userChat;
            }

            if (!participants) throw new Error("No participants found");

            for (let i = 0; i < participants.length; i++) {
                if (participants[i] !== chatUser.user.id) {
                    await chatHandler.broadCast(participants[i], clients, "addUser", chatUser);
                } else {
                    await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
                }
            }
        })
    );
    socket.on(
        "removeUser",
        socketWrapper(async (remove: { user: UserType; chatId: number }) => {
            let participants;
            const chatType = await getChatType(remove.chatId);
            if (chatType == ChatType.GROUP)
                participants = await groupController.removeUser(userId, remove.user, remove.chatId);
            else if (chatType == ChatType.CHANNEL)
                participants = await channelController.removeUser(
                    userId,
                    remove.user,
                    remove.chatId
                );
            if (!participants) throw new Error("No participants found");
            const user = await displayedUser(userId);
            for (let i = 0; i < participants.length; i++) {
                await chatHandler.broadCast(participants[i], clients, "removeUser", {
                    user: remove.user,
                    removerUserName: user.userName,
                    chatId: remove.chatId,
                });
            }
        })
    );
    socket.on(
        "leaveChat",
        socketWrapper(async (leave: { chatId: number }) => {
            const participants = await groupController.leaveGroup(userId, leave.chatId);
            const user = await displayedUser(userId);
            for (let i = 0; i < participants.length; i++) {
                await chatHandler.broadCast(participants[i], clients, "leaveChat", {
                    userName: user.userName,
                    chatId: leave.chatId,
                });
            }
        })
    );
    socket.on(
        "deleteChat",
        socketWrapper(async (deleted: { chatId: number }) => {
            const participants = await groupController.deleteGroup(userId, deleted.chatId);
            for (let i = 0; i < participants.length; i++) {
                await chatHandler.broadCast(participants[i], clients, "deleteChat", {
                    chatId: deleted.chatId,
                });
            }
        })
    );
    socket.on(
        "subscribe",
        socketWrapper(async (chatUser: types.ChatUser) => {
            const { participants, userChat } = await channelController.joinChannel(
                userId,
                chatUser.chatId
            );
            for (let i = 0; i < participants.length; i++) {
                if (participants[i] !== chatUser.user.id) {
                    await chatHandler.broadCast(participants[i], clients, "addUser", chatUser);
                } else {
                    await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
                }
            }
        })
    );
};
