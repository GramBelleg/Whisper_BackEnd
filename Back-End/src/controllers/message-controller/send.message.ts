import { Request, Response } from "express";
import { saveMessage } from "@services/chat-service/chat.service";

export const sendMessage = async (req: Request, res: Response) => {
  const { senderId, receiverId, message } = req.body;
  console.log(req.header);
  console.log(req.body);
  // const formattedMessage = JSON.stringify({
  //   senderId: senderId,
  //   receiverId: receiverId,
  //   content: message,
  //   timestamp: new Date(),
  // });
  // await saveMessage(formattedMessage);
};

export default sendMessage;
