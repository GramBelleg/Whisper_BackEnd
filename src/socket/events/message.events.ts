import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as types from "@models/messages.models";
import * as sendController from "@controllers/messages/send.message";
import * as editController from "@controllers/messages/edit.message";
import * as deleteController from "@controllers/messages/delete.message";
import * as messageHandler from "@socket/handlers/message.handlers";
import { sendToClient } from "@socket/utils/socket.utils";
import * as groupHandler from "@socket/handlers/group.handlers";
import * as channelHandler from "@socket/handlers/channel.handlers";
import { handleChatPermissions } from "@socket/handlers/chat.handlers";

export const setupMessageEvents = (
    socket: Socket,
    userId: number,
    clients: Map<number, Socket>
) => {
    socket.on(
        "message",
        socketWrapper(async (message: types.OmitSender<types.SentMessage>) => {
            await handleChatPermissions(
                userId,
                message.chatId,
                groupHandler.handlePostPermissions,
                channelHandler.handlePostPermissions
            );
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
            await handleChatPermissions(
                userId,
                message.chatId,
                groupHandler.handleEditPermissions,
                null
            );
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
            await handleChatPermissions(userId, chatId, groupHandler.handleDeletePermissions, null);
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

    socket.on(
        "comment",
        socketWrapper(async (comment: types.SentComment) => {
            await channelHandler.handleCommentPermissions(userId, comment.chatId);
            const sentComments = await sendController.saveComment(comment, userId);
            if (sentComments) {
                await messageHandler.userBroadCast(
                    userId,
                    comment.chatId,
                    clients,
                    "comment",
                    sentComments
                );
            }
        })
    );

    socket.on(
        "deleteComment",
        socketWrapper(async (comments: { ids: number[]; chatId: number }) => {
            await deleteController.deleteComments(comments.ids, userId);
            await messageHandler.broadCast(comments.chatId, clients, "deleteComment", comments);
        })
    );
};
