import { MessageIndex } from "@models/es.models";
import { Request, Response } from "express";

const formatMessages = (messages: MessageIndex[]) => {
    return messages.map((message) => {
        const { messageId, senderId, userName, profilePic, ...rest } = message;
        delete rest.userId;
        return {
            id: messageId,
            sender: {
                id: senderId,
                userName,
                profilePic,
            },
            ...rest,
        };
    });
};

export const handleSearchMessages = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    const query = req.query.query as string;
    res.status(200).json();
};
