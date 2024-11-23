import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/messages.models";
import * as sendController from "@controllers/messages/send.message";
import * as editController from "@controllers/messages/edit.message";
import * as deleteController from "@controllers/messages/delete.message";
import * as messageHandler from "@socket/handlers/message.handlers";

export const setupMessageEvents = (
    socket: Socket,
    userId: number,
    clients: Map<number, Socket>
) => {
    socket.on(
        "message",
        socketWrapper(async (message: types.OmitSender<types.SentMessage>) => {
            const savedMessage = await sendController.handleSend(userId, {
                ...message,
                senderId: userId,
            });
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

    socket.on(
        "editMessage",
        socketWrapper(async (message: types.OmitSender<types.EditableMessage>) => {
            const editedMessage = await editController.handleEditContent(
                message.messageId,
                message.content
            );
            if (editedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "editMessage", {
                    messageId: editedMessage.id,
                    content: editedMessage.content,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "pinMessage",
        socketWrapper(async (message: types.MessageReference) => {
            const pinnedMessage = await editController.handlePinMessage(message.messageId);
            if (pinnedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "pinMessage", {
                    messageId: pinnedMessage,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "unpinMessage",
        socketWrapper(async (message: types.MessageReference) => {
            const unpinnedMessage = await editController.handleUnpinMessage(message.messageId);
            if (unpinnedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "unpinMessage", {
                    messageId: unpinnedMessage,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "deleteMessage",
        socketWrapper(async ({ messages, chatId }: { messages: number[]; chatId: number }) => {
            await deleteController.deleteMessagesForAllUsers(messages, chatId);
            await messageHandler.broadCast(chatId, clients, "deleteMessage", { messages, chatId });
        })
    );
};
