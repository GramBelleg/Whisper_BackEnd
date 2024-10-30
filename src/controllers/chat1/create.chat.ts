import { Request, Response } from "express";
import { createChat } from "@services/chat1/chat.service";
import { getUserId } from "@services/user1/user.service";

export const handleCreateChat = async (req: Request, res: Response) => {
    const userId = req.userId;
    const otherUserName = req.body.userName;
    const otherUserId = await getUserId(otherUserName);
    if (!otherUserId) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const users = [userId, otherUserId];
    const chat = await createChat(users, "DM");
    res.status(200).json(chat);
};
