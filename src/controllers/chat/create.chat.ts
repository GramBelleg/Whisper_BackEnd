import { Request, Response } from "express";
import { createChat } from "@services/chat/chat.service";
import { getUserId } from "@services/user/user.service";

export const handleCreateChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    if(!req.query.userName) {
        res.status(400).json({ message: "Missing userName query parameter" });
        return;
    }
    const otherUserName = (req.query.userName).toString();
    const otherUserId = await getUserId(otherUserName);
    if (!otherUserId) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const users = [userId, otherUserId];
    const chat = await createChat(users, "DM");
    res.status(200).json(chat);
};
