import { Socket } from "socket.io";

export const startConnection = (
  userId: number,
  clients: Map<number, Socket>,
  socket: Socket
): void => {
  console.log(`User ${userId} connected`);
  clients.set(userId, socket);
};

export const endConnection = (
  userId: number,
  clients: Map<number, Socket>
): void => {
  console.log(`User ${userId} disconnected`);
  if (clients.has(userId)) {
    clients.delete(userId);
  }
};
