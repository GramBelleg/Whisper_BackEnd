import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";
import * as storyHandler from "./handlers/story.handlers";
import { setupMessageEvents } from "./events/message.events";
import { setupStoryEvents } from "./events/story.events";

const clients: Map<number, Socket> = new Map();

export const notifyExpiry = (key: string) => {
    const keyParts = key.split(":")[0];
    if(keyParts === "messageId")    
        messageHandler.notifyExpiry(key, clients);
    if(keyParts === "storyExpired")    
        storyHandler.notifyExpiry(key, clients);
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

    io.on("connection", async (socket: Socket) => {
        socket.data.userId = await validateCookie(socket);

        const userId = socket.data.userId;

        connectionHandler.startConnection(userId, clients, socket);

        setupMessageEvents(socket, userId, clients);
        
        setupStoryEvents(socket, userId, clients);

        socket.on("close", () => {
            connectionHandler.endConnection(userId, clients);
        });
    });
};
