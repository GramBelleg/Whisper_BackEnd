import redisClient from "@redis/redis.client";
import { ChatMessage } from "@prisma/client";
import { SaveableMessage } from "@models/message.models";

export const getChatId = async (messageId: number): Promise<number> => {
    const key: string = `tempMessageId:${messageId}`;
    const message = (await redisClient.get(key)) as string;
    return Number(message);
};

export const removeTempMessage = async (messageId: number): Promise<void> => {
    const key: string = `tempMessageId:${messageId}`;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Error removing temporary message ${messageId}:`, error);
    }
};

export const saveExpiryMessage = async (message: SaveableMessage): Promise<ChatMessage> => {
    try {
        const messageId = await redisClient.incr("messageId");

        const ToBeSavedMessage: ChatMessage = {
            id: messageId,
            ...message,
            createdAt: new Date(),
            read: null,
            delivered: null,
            pinned: false,
        };

        if (!message.expiresAfter) {
            throw new Error("Expiry time not provided");
        }

        await redisClient.setex(`messageId:${messageId}`, message.expiresAfter, "");
        await redisClient.set(`tempMessageId:${messageId}`, JSON.stringify(ToBeSavedMessage));

        return ToBeSavedMessage;
    } catch (error) {
        throw new Error("Error saving expiry message: " + error);
    }
};
