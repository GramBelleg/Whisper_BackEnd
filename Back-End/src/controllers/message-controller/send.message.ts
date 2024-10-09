import { Request, Response } from "express";
import { saveMessage } from "@services/chat-service/chat.service";

export const sendMessage = async (req: Request, res: Response) => {
  const { senderID, receiverID, message } = req.body;
  const formattedMessage = JSON.stringify({
    senderID: senderID,
    receiverID: receiverID,
    content: message,
    timestamp: new Date(),
  });
  await saveMessage(formattedMessage);
};

export default sendMessage;
