import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import { ChatMessage } from "@prisma/client";
import * as types from "@models/chat.models";
import * as sendMessageController from "@controllers/message-controller/send.message";
import * as editMessageController from "@controllers/message-controller/edit.message";
import * as deleteMessageController from "@controllers/message-controller/delete.message";
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
    socket.data.userId = validateCookie(socket) as number;

    const userId = socket.data.userId;

    connectionHandler.startConnection(userId, clients, socket);

    socket.on(
      "sendMessage",
      async (message: types.SentMessage<ChatMessage>) => {
        const savedMessage = await sendMessageController.sendMessage(
          userId,
          message
        );
        if (savedMessage) {
          messageHandler.broadCast(
            message.chatId,
            clients,
            "receiveMessage",
            message
          );
        }
      }
    );

    socket.on(
      "editMessage",
      async (
        message: types.OmitSender<types.EditChatMessages<ChatMessage>>
      ) => {
        const editedMessage = await editMessageController.editMessage(
          userId,
          message
        );
        if (editedMessage) {
          messageHandler.broadCast(
            message.chatId,
            clients,
            "editMessage",
            message
          );
        }
      }
    );

    socket.on("deleteMessage", async (id: number, chatId: number) => {
      await deleteMessageController.deleteMessage(id, chatId);
      messageHandler.broadCast(chatId, clients, "deleteMessage", id);;
    });

    socket.on("close", () => {
      connectionHandler.endConnection(userId, clients);
    });
  });
};
