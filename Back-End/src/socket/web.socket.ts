import { Server as IOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import * as messageHandler from "./handlers/message.handlers";
import * as connectionHandler from "./handlers/connection.handlers";

const clients: Map<number, Socket> = new Map();

export const initWebSocketServer = (server: HTTPServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket: Socket) => {
    let userID: number = parseInt(socket.handshake.query.userID as string, 10);

    connectionHandler.startConnection(userID, clients, socket);

    socket.on("send", (message: string) => {
      console.log(socket.handshake.headers.cookie);
      console.log(socket.request.headers.cookie);
      messageHandler.sendMessage(message, clients);
    });

    socket.on("close", () => {
      connectionHandler.endConnection(userID, clients);
    });
  });
};
