import { Request, Response } from "express";
import { searchMessagesInES } from "@services/elasticsearch/message.service";
import { MessageIndex } from "@models/es.models";

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
    const messages = await searchMessagesInES(userId, chatId, query);
    const results = formatMessages(messages);
    res.status(200).json(results);
};
