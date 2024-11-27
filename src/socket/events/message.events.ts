import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/messages.models";
import * as sendController from "@controllers/messages/send.message";
import * as editController from "@controllers/messages/edit.message";
import * as deleteController from "@controllers/messages/delete.message";
import * as messageHandler from "@socket/handlers/message.handlers";
import { sendToClient } from "@socket/utils/socket.utils";

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
                message.id,
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
            const pinnedMessage = await editController.handlePinMessage(message.id);
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
            const unpinnedMessage = await editController.handleUnpinMessage(message.id);
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

    socket.on(
        "deliverMessage",
        socketWrapper(async ({ messageId, chatId }: { messageId: number; chatId: number }) => {
            const result = await editController.handleDeliverMessage(messageId, chatId);
            if (!result) return;
            sendToClient(result.senderId, clients, "deliverMessage", {
                chatId,
                messageIds: [messageId],
            });
        })
    );

    socket.on(
        "readMessage",
        socketWrapper(async ({ messages, chatId }: { messages: number[]; chatId: number }) => {
            await messageHandler.readAllUserMessages(userId, clients, messages, chatId);
        })
    );
};
