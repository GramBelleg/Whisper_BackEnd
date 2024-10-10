import { Request, Response } from "express";
import { deleteChatMessage,  setNewLastMessage} from "@services/chat-service/chat.service";
import { deleteMessageSockets } from "@socket/web.socket";

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id, chatId } = req.body;

    if (!id || !chatId) {
      return res
        .status(400)
        .json({ message: "Id, chatId and Content are required." });
    }

    await deleteChatMessage(id);
    const lastMessageId = await setNewLastMessage(chatId);

    deleteMessageSockets( id, req.userId, chatId );

    return res.status(201).json({ lastMessageId });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default deleteMessage;
