import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { validateCookie } from "@validators/socket";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";

const clients: Map<number, Socket> = new Map();

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

    socket.on("sendMessage", (message: { message: string; chatId: number }) => {
      messageHandler.sendMessage(userId, message, clients);
    });

    socket.on("close", () => {
      connectionHandler.endConnection(userId, clients);
    });
  });
};
