import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as types from "@models/chat.models";
import * as storyTypes from "@models/story.models";
import * as sendController from "@controllers/chat/send.message";
import * as editController from "@controllers/chat/edit.message";
import * as deleteController from "@controllers/chat/delete.message";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";
import * as storyController from "@controllers/user/story.controller";
import { Story } from "@prisma/client";
import * as storyHandler from "./handlers/story.handlers";

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

        socket.on("send", async (message: types.OmitSender<types.SentMessage>) => {
            const savedMessage = await sendController.handleSend({
                ...message,
                senderId: userId,
            }) ;
            if (savedMessage) {
                messageHandler.broadCast(message.chatId, clients, "receive", savedMessage);
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

        socket.on("uploadStory", async (story: storyTypes.omitId) => {
            const createdStory = await storyController.setStory({
                ...story,
                userId,
            });
            if (createdStory) {
                storyHandler.broadCast(userId, clients, "recieveStory", createdStory);
            }
        });

        socket.on("deleteStory", async (storyId: number) => {
            const deletedStoryId = await storyController.deleteStory(storyId);
            storyHandler.broadCast(userId, clients, "deleteStory", storyId);
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

        socket.on("delete", async (Ids: number[], chatId: number) => {
            await deleteController.deleteMessagesForAllUsers(Ids, chatId);
            messageHandler.broadCast(chatId, clients, "delete", Ids);
        });
        socket.on("close", () => {
            connectionHandler.endConnection(userId, clients);
        });
    });
};