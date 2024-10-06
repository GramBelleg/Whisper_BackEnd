import WebSocket, { Server as WebSocketServer } from "ws";

interface Client {
  id: string;
  socket: WebSocket;
}
const clients: Client[] = [];
let wss: WebSocketServer;

export const initWebSocketServer = (server: any) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    let userId = req.url?.split("=")[1];

    //testing code
    if (clients.length == 0) userId = "Mohamed";
    else userId = "Youssef";

    if (!userId) {
      ws.close(1008, "Missing user ID");
      return;
    }

    console.log(`User ${userId} connected`);
    clients.push({ id: userId, socket: ws });

    ws.on("message", (message: string) => {
      const messageObject = JSON.parse(message);
      clients.forEach((client) => {
        if (client.id === messageObject.receiverID) {
          const responseMessage = JSON.stringify({
            timestamp: new Date().toISOString(),
            messageContent: messageObject.messageContent,
            senderID: messageObject.senderID,
          });

          client.socket.send(responseMessage);
        }
      });
    });

    ws.on("close", () => {
      console.log(`User ${userId} disconnected`);
      const index = clients.findIndex((client) => client.id === userId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });
};
