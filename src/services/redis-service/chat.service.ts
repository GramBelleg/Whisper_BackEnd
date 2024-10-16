import redisClient from "@redis/redis.client";
import { ChatMessage } from "@prisma/client";

export const saveExpiringMessage = async (message: ChatMessage): Promise<void> => {
    try {
        if (!message.expiresAfter) {
            throw new Error("Expiry time not provided");
        }

        await redisClient.setex(`messageId:${message.id}`, message.expiresAfter, "");
    } catch (error) {
        throw new Error("Error saving expiry message: " + error);
    }
};
