import { Response } from "express";

const clients: Map<number, Response> = new Map();

export const addClient = (clientId: number, res: Response): void => {
    clients.set(clientId, res);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    //console.log(`User ${clientId} subscribed to SSE`);

    sendMessage(clientId, "connected", "Successfully subscribed to SSE");

    res.on("close", () => {
        clients.delete(clientId);
    });
};

export const broadCast = (type: string, data: string): void => {
    for (const client of clients) {
        sendMessage(client[0], type, data);
    }
};
export const sendMessage = (clientId: number, type: string, data: string): void => {
    const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    if (clients.has(clientId)) {
        const client = clients.get(clientId);
        if (client) {
            client.write(message);
        }
    }
};
