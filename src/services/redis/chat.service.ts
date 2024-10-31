import redisClient from "@src/redis/redis.client";
import { Message } from "@prisma/client";

export const saveExpiringMessage = async (message: Message): Promise<void> => {
    if (!message.expiresAfter) {
        throw new Error("Expiry time not provided");
    }
    await redisClient.setex(`messageId:${message.id}`, message.expiresAfter, "");
};
