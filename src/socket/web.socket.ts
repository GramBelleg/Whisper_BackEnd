import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as types from "@models/chat.models";
import * as sendController from "@controllers/chat/send.message";
import * as editController from "@controllers/chat/edit.message";
import * as deleteController from "@controllers/chat/delete.message";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";
import { getMessage } from "@services/chat/message.service";
const clients: Map<number, Socket> = new Map();

export const notifyExpiry = (key: string) => {
    messageHandler.notifyExpiry(key, clients);
};

export const initWebSocketServer = (server: HTTPServer) => {
    const io = new IOServer(server, {
        cors: {
            origin: (origin, callback) => {
                if (origin) {
                    callback(null, origin);
                } else {
                    callback(null, "*");
                }
            },
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        socket.data.userId = validateCookie(socket);

        const userId = socket.data.userId;

        connectionHandler.startConnection(userId, clients, socket);

        socket.on("send", async (message: types.OmitSender<types.SaveableMessage>) => {
            const savedMessage = await sendController.handleSend({
                ...message,
                senderId: userId,
            });
            if (savedMessage) {
                const temp = await getMessage(savedMessage.id);
                messageHandler.broadCast(message.chatId, clients, "receive", temp);
            }
        });

        socket.on("edit", async (message: types.OmitSender<types.EditableMessage>) => {
            const editedMessage = await editController.handleEditContent({
                ...message,
                senderId: userId,
            });
            if (editedMessage) {
                messageHandler.broadCast(message.chatId, clients, "edit", editedMessage);
            }
        });

        socket.on("pin", async (message: types.MessageReference) => {
            const pinnedMessage = await editController.handlePinMessage(message);
            if (pinnedMessage) {
                messageHandler.broadCast(message.chatId, clients, "pin", pinnedMessage);
            }
        });

        socket.on("unpin", async (message: types.MessageReference) => {
            const unpinnedMessage = await editController.handleUnpinMessage(message);
            if (unpinnedMessage) {
                messageHandler.broadCast(message.chatId, clients, "unpin", unpinnedMessage);
            }
        });

        socket.on("delete", async (id: number, chatId: number) => {
            await deleteController.handleDeleteMessage(id, chatId);
            messageHandler.broadCast(chatId, clients, "delete", id);
        });

        socket.on("close", () => {
            connectionHandler.endConnection(userId, clients);
        });
    });
};
