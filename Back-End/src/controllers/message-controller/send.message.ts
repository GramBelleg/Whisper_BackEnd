import { Request, Response } from "express";
import {
  saveChatMessage,
  setLastMessage,
} from "@services/chat-service/chat.service";
import { sendMessageSockets } from "@socket/web.socket";

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

    const messageId = await saveChatMessage(formattedMessage);
    await setLastMessage(chatId, messageId);

    sendMessageSockets({ id: messageId, ...formattedMessage });

    return res.status(201).json({ messageId });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default sendMessage;
