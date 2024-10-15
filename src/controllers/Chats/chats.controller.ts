import { Request, Response } from "express";
import { getChatsService } from "@services/Chats/chats.service";

const getChats = async (req: Request, res: Response): Promise<void> => {
    try {
        //validate user data recieved from request body
        const userId = req.userId;

        await getChatsService(userId);

        res.status(200).json({
            status: "success",
            user_data: {},
        });
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export { getChats };
