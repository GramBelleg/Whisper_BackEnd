import { Request, Response } from "express";
import {
  saveMessage,
  setLastMessage,
} from "@services/chat-service/chat.service";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res
        .status(400)
        .json({ message: "Content and chatId are required." });
    }

    const formattedMessage = {
      content,
      chatId,
      senderId: req.userId,
      createdAt: new Date(),
    };

    const messageId = await saveMessage(formattedMessage);
    await setLastMessage(chatId, messageId);

    return res.status(201).json({ messageId, ...formattedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default sendMessage;
