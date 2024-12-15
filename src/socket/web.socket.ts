import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";
import * as storyHandler from "./handlers/story.handlers";
import * as callHandler from "./handlers/call.handlers";
import { setupMessageEvents } from "./events/message.events";
import { setupStoryEvents } from "./events/story.events";
import { socketWrapper } from "./handlers/error.handler";
import { setupPfpEvents } from "./events/pfp.events";
import { setupStatusEvents } from "./events/status.events";
import { setupChatEvents } from "./events/chat.events";
import { Message } from "@prisma/client";

type HandlerFunction = (key: string, clients: Map<number, Socket>) => any;
const clients: Map<number, Socket> = new Map();

const handlers: Record<string, HandlerFunction> = {
    messageId: messageHandler.notifyExpiry,
    storyExpired: storyHandler.notifyExpiry,
    chatId: messageHandler.notifyUnmute,
};

export const notifyExpiry = (key: string) => {
    const keyParts: string = key.split(":")[0];
    const handler = handlers[keyParts];

    if (handler) {
        handler(key, clients);
    } else {
        console.warn(`No handler found for key: ${key}`);
    }
};

export const callSocket = (participants: number[],tokens: string[], notification: any, message: Message, userId: number) => {
    callHandler.startCall(clients, participants, tokens, notification, message, userId);
};

export const callLog = (participants: number[], message: any) => {
    callHandler.callLog(clients, participants, message);
}

export const cancelCall = (participants: number[], message: any) => {
    callHandler.cancelCall(clients, participants, message);
}

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

    io.on("connection", async (socket: Socket) => {
        socket.data.userId = await socketWrapper(validateCookie)(socket);

        const userId = socket.data.userId;
        if (!userId) {
            socket.disconnect(true);
            return;
        }
        await connectionHandler.startConnection(userId, clients, socket);

        setupMessageEvents(socket, userId, clients);

        setupChatEvents(socket, userId, clients);

        setupStoryEvents(socket, userId, clients);

        setupPfpEvents(socket, userId, clients);

        setupStatusEvents(socket, userId, clients);

        socket.on(
            "disconnect",
            socketWrapper(async () => {
                if (userId) await connectionHandler.endConnection(userId, clients);
            })
        );
    });
};
