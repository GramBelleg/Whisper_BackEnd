import { Socket } from "socket.io";
import * as types from "@models/chat.models";
import * as sendController from "@controllers/chat/send.message";
import * as editController from "@controllers/chat/edit.message";
import * as deleteController from "@controllers/chat/delete.message";
import * as messageHandler from "@socket/handlers/message.handlers";

export const setupMessageEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on("sendMessage", async (message: types.OmitSender<types.SentMessage>) => {
        const savedMessage = await sendController.handleSend(userId, {
            ...message,
            senderId: userId,
        });
        if (savedMessage) {
            messageHandler.broadCast(message.chatId, clients, "receiveMessage", savedMessage);
        }
    });

    socket.on("editMessage", async (message: types.OmitSender<types.EditableMessage>) => {
        const editedMessage = await editController.handleEditContent(message.id, message.content);
        if (editedMessage) {
            messageHandler.broadCast(message.chatId, clients, "editMessage", editedMessage);
        }
    });

    socket.on("pinMessage", async (message: types.MessageReference) => {
        const pinnedMessage = await editController.handlePinMessage(message.id);
        if (pinnedMessage) {
            messageHandler.broadCast(message.chatId, clients, "pinMessage", pinnedMessage);
        }
    });

    socket.on("unpinMessage", async (message: types.MessageReference) => {
        const unpinnedMessage = await editController.handleUnpinMessage(message.id);
        if (unpinnedMessage) {
            messageHandler.broadCast(message.chatId, clients, "unpinMessage", unpinnedMessage);
        }
    });

    socket.on("deleteMessage", async (Ids: number[], chatId: number) => {
        await deleteController.deleteMessagesForAllUsers(Ids, chatId);
        messageHandler.broadCast(chatId, clients, "deleteMessage", Ids);
    });
};
