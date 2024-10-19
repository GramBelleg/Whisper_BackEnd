import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as types from "@models/chat.models";
import * as sendController from "@controllers/chat/send.message";
import * as editController from "@controllers/chat/edit.message";
import * as deleteController from "@controllers/chat/delete.message";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";

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
    
        const handleAndBroadcast = async (event: string, handler: Function, message: any) => {
            const result = await handler(message);
            if (result) {
                messageHandler.broadCast(message.chatId, clients, event, result);
            }
        };
    
        const eventHandlers: Record<string, Function> = {
            "send": async (message: types.OmitSender<types.SaveableMessage>) => {
                await handleAndBroadcast("receive", sendController.handleSend, { ...message, senderId: userId });
            },
            "edit": async (message: types.OmitSender<types.EditableMessage>) => {
                await handleAndBroadcast("edit", editController.handleEditContent, { ...message, senderId: userId });
            },
            "pin": async (message: types.MessageReference) => {
                await handleAndBroadcast("pin", editController.handlePinMessage, message);
            },
            "unpin": async (message: types.MessageReference) => {
                await handleAndBroadcast("unpin", editController.handleUnpinMessage, message);
            },
            "delete": async (Ids: number[], chatId: number) => {
                await deleteController.deleteMessagesForAllUsers(Ids, chatId);
                messageHandler.broadCast(chatId, clients, "delete", Ids);
            },
            "close": () => {
                connectionHandler.endConnection(userId, clients);
            },
        };
    
        Object.keys(eventHandlers).forEach(event => {
            socket.on(event, (...args: any[]) => eventHandlers[event](...args));
        });
    });
    
};
