import redisClient from "@src/redis/redis.client";

export const saveExpiringMessage = async (id: number, expiresAfter: number | null): Promise<void> => {
    if (!expiresAfter) {
        throw new Error("Expiry time not provided");
    }
    await redisClient.setex(`messageId:${id}`, expiresAfter, "");
};
