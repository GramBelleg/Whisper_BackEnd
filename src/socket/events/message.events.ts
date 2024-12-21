import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/messages.models";
import * as sendController from "@controllers/messages/send.message";
import * as editController from "@controllers/messages/edit.message";
import * as deleteController from "@controllers/messages/delete.message";
import * as messageHandler from "@socket/handlers/message.handlers";
import { sendToClient } from "@socket/utils/socket.utils";
import * as groupHandler from "@socket/handlers/group.handlers";
import { handleChatPermissions } from "@socket/handlers/chat.handlers";
import { getChatType } from "@services/chat/chat.service";

export const setupMessageEvents = (
    socket: Socket,
    userId: number,
    clients: Map<number, Socket>
) => {
    socket.on(
        "message",
        socketWrapper(async (message: types.OmitSender<types.SentMessage>) => {
            const chatType = await getChatType(message.chatId);
            if (chatType === "DM") {
                if (await messageHandler.handleBlockedMessages(userId, message)) return;
            }
            const filteredMessage = await groupHandler.handleMessageSafety(
                message.chatId,
                message,
                chatType
            );
            if (!filteredMessage.isSafe) {
                sendToClient(userId, clients, "message", filteredMessage);
                return;
            }
            message.isSafe = filteredMessage.isSafe;
            await handleChatPermissions(userId, message.chatId, groupHandler.handlePostPermissions);
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
            await handleChatPermissions(userId, message.chatId, groupHandler.handleEditPermissions);
            const editedMessage = await editController.handleEditContent(
                userId,
                message.id,
                message.content
            );
            if (editedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "editMessage", {
                    id: editedMessage.id,
                    content: editedMessage.content,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "pinMessage",
        socketWrapper(async (message: types.MessageReference) => {
            const pinnedMessage = await editController.handlePinMessage(userId, message.id);
            if (pinnedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "pinMessage", {
                    id: pinnedMessage,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "unpinMessage",
        socketWrapper(async (message: types.MessageReference) => {
            const unpinnedMessage = await editController.handleUnpinMessage(userId, message.id);
            if (unpinnedMessage) {
                await messageHandler.broadCast(message.chatId, clients, "unpinMessage", {
                    id: unpinnedMessage,
                    chatId: message.chatId,
                });
            }
        })
    );

    socket.on(
        "deleteMessage",
        socketWrapper(async ({ messages, chatId }: { messages: number[]; chatId: number }) => {
            await handleChatPermissions(userId, chatId, groupHandler.handleDeletePermissions);
            await deleteController.deleteMessagesForAllUsers(messages, chatId);
            await messageHandler.broadCast(chatId, clients, "deleteMessage", { messages, chatId });
        })
    );

    socket.on(
        "deliverMessage",
        socketWrapper(async ({ messageId }: { messageId: number }) => {
            const result = await editController.handleDeliverMessage(userId, messageId);
            if (!result) return;
            sendToClient(result.senderId, clients, "deliverMessage", {
                messageIds: [messageId],
                chatId: result.chatId,
            });
        })
    );

    socket.on(
        "readAllMessages",
        socketWrapper(async (chatId: number) => {
            const directTo = await editController.handleReadAllMessages(userId, chatId);
            if (directTo) {
                messageHandler.sendReadAndDeliveredGroups(clients, directTo, "readMessage");
            }
        })
    );

    socket.on(
        "readMessage",
        socketWrapper(async ({ messages, chatId }: { messages: number[]; chatId: number }) => {
            const directTo = await editController.handleReadMessages(userId, messages, chatId);
            if (directTo) {
                messageHandler.sendReadAndDeliveredGroups(clients, directTo, "readMessage");
            }
        })
    );
};
