import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/chat.models";
import * as createChatController from "@controllers/chat/create.chat";
import * as groupController from "@controllers/chat/group.chat";
import * as channelController from "@controllers/chat/group.chat";
import * as chatHandler from "@socket/handlers/chat.handlers";
import { UserType } from "@models/user.models";
import { displayedUser } from "@services/user/user.service";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";

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
        socketWrapper(async (ChatUser: types.ChatUser) => {
            const { participants, userChat } = await groupController.addUser(userId, ChatUser);
            for (let i = 0; i < participants.length; i++) {
                if (participants[i] != ChatUser.user.id)
                    await chatHandler.broadCast(participants[i], clients, "addUser", ChatUser);
                else await chatHandler.broadCast(participants[i], clients, "createChat", userChat);
            }
        })
    );
    socket.on(
        "removeUser",
        socketWrapper(async (remove: { user: UserType; chatId: number }) => {
            const participants = await groupController.removeUser(
                userId,
                remove.user,
                remove.chatId
            );
            const user = await displayedUser(userId);
            for (let i = 0; i < participants.length; i++) {
                await chatHandler.broadCast(participants[i], clients, "removeUser", {
                    user,
                    removerUserName: user.userName,
                    chatId: remove.chatId,
                });
            }
        })
    );
    socket.on(
        "leaveChat",
        socketWrapper(async (leave: { chatId: number }) => {
            const participants = await groupController.leave(userId, leave.chatId);
            const user = await displayedUser(userId);
            for (let i = 0; i < participants.length; i++) {
                await chatHandler.broadCast(participants[i], clients, "leaveChat", {
                    userName: user.userName,
                    chatId: leave.chatId,
                });
            }
        })
    );
};
