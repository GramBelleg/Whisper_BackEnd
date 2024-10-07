import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import Client from "./interfaces/client.interface";
import { sendMessage } from "./handlers/message.handlers";
import { endConnection } from "./handlers/connection.handlers";

const clients: Client[] = [];

export const initWebSocketServer = (server: HTTPServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    let userId: string | undefined;

    userId = socket.handshake.query.userId as string;

    //-----Testing code remove Block in production
    if (clients.length == 0) userId = "Mohamed";
    else userId = "Youssef";
    console.log(`User ${userId} connected`);
    clients.push({ id: userId, socket: socket });
    //-----End block

    socket.on("send", (message: string) => {
      sendMessage(message, clients);
    });

    socket.on("close", () => {
      endConnection(userId, clients);
    });
  });
};
