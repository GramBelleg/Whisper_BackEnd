import Client from "@socket/interfaces/client.interface";

export const sendMessage = (message: string, clients: Client[]): void => {
  const messageObject = JSON.parse(message);
  clients.forEach((client) => {
    if (client.id === messageObject.receiverID) {
      const responseMessage = JSON.stringify({
        timestamp: new Date().toISOString(),
        messageContent: messageObject.messageContent,
        senderID: messageObject.senderID,
      });
      client.socket.emit("receive", responseMessage);
    }
  });
};
