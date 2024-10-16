import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as types from "@models/message.models";
import * as sendController from "@controllers/message-controller/send.message";
import * as editController from "@controllers/message-controller/edit.message";
import * as deleteController from "@controllers/message-controller/delete.message";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";

const clients: Map<number, Socket> = new Map();

export const notifyExpiry = (key: string) => {
    messageHandler.notifyExpiry(key, clients);
};

export const initWebSocketServer = (server: HTTPServer) => {
    const io = new IOServer(server, {
        cors: {
            origin: "http://localhost:3000",
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
                messageHandler.broadCast(message.chatId, clients, "receive", savedMessage);
            }
        });

        socket.on("edit", async (message: types.OmitSender<types.EditableMessage>) => {
            const editedMessage = await editController.editContent({
                ...message,
                senderId: userId,
            });
            if (editedMessage) {
                messageHandler.broadCast(message.chatId, clients, "edit", editedMessage);
            }
        });

        socket.on("delete", async (id: number, chatId: number) => {
            await deleteController.deleteMessage(id, chatId);
            messageHandler.broadCast(chatId, clients, "delete", id);
        });

        socket.on("close", () => {
            connectionHandler.endConnection(userId, clients);
        });
    });
};
