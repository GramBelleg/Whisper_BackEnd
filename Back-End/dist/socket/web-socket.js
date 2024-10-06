"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = void 0;
const ws_1 = require("ws");
const clients = [];
let wss;
const initWebSocketServer = (server) => {
    wss = new ws_1.Server({ server });
    wss.on("connection", (ws, req) => {
        var _a;
        let userId = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split("=")[1];
        //testing code
        if (clients.length == 0)
            userId = "Mohamed";
        else
            userId = "Youssef";
        if (!userId) {
            ws.close(1008, "Missing user ID");
            return;
        }
        console.log(`User ${userId} connected`);
        clients.push({ id: userId, socket: ws });
        ws.on("message", (message) => {
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
exports.initWebSocketServer = initWebSocketServer;
