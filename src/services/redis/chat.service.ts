import redisClient from "@src/redis/redis.client";
import { ChatMessage } from "@prisma/client";

export const saveExpiringMessage = async (message: ChatMessage): Promise<void> => {
    if (!message.expiresAfter) {
        throw new Error("Expiry time not provided");
    }

    await redisClient.setex(`messageId:${message.id}`, message.expiresAfter, "");
};
