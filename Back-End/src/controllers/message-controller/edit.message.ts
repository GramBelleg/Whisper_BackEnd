import { Request, Response } from "express";
import { editChatMessage } from "@services/chat-service/chat.service";
import { editMessageSockets } from "@socket/web.socket";

export const editMessage = async (req: Request, res: Response) => {
  try {
    const { id, chatId, content } = req.body;

    if (!id || !content) {
      return res.status(400).json({ message: "Id and Content are required." });
    }

    await editChatMessage(id, content);

    const formattedMessage = {
      id,
      senderId: req.userId,
      chatId,
      content,
    };

    editMessageSockets(formattedMessage);

    return res.status(201).json({ id });
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default editMessage;
