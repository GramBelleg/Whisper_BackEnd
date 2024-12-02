import redisClient from "@src/redis/redis.client";

export const saveExpiringMessage = async (
    id: number,
    expiresAfter: number | null
): Promise<void> => {
    if (!expiresAfter) {
        throw new Error("Expiry time not provided");
    }
    await redisClient.getInstance().setex(`messageId:${id}`, expiresAfter, "");
};

export const saveMuteDuration = async(
    userId: number,
    chatId: number,
    duration: number
): Promise<void> => {
    await redisClient.getInstance().setex(`chatId:${chatId}userId:${userId}`, duration, "");
}
