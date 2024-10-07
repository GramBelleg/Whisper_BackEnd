import Client from "@socket/interfaces/client.interface";

export const endConnection = (userId: string, clients: Client[]): void => {
  console.log(`User ${userId} disconnected`);
  const index = clients.findIndex((client) => client.id === userId);
  if (index !== -1) {
    clients.splice(index, 1);
  }
};
