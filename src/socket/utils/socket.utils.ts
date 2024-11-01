import { Socket } from "socket.io";

export const sendToClient = (
    userId: number,
    clients: Map<number, Socket>,
    emitEvent: string,
    emitMessage: any
) => {
    if (clients.has(userId)) {
        const client = clients.get(userId);
        if (client) {
            client.emit(emitEvent, emitMessage);
        }
    }
};
