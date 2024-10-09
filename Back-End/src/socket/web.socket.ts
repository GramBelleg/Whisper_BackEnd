import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import Client from "./interfaces/client.interface";
import { sendMessage } from "./handlers/message.handlers";
import { startConnection, endConnection } from "./handlers/connection.handlers";

const clients: Client[] = [];

export const initWebSocketServer = (server: HTTPServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    let userID: string = socket.handshake.query.userID as string;

    startConnection(userID);

    clients.push({ id: userID, socket: socket });

    socket.on("send", (message: string) => {
      sendMessage(message, clients);
    });

    socket.on("close", () => {
      endConnection(userID, clients);
    });
  });
};
