import redisClient from "@redis/redis.client";

export const getChatId = async (messageId: number): Promise<number> => {
  const key: string = `tempMessageId:${messageId}`;
  const message = (await redisClient.get(key)) as string;
  return Number(message);
};

export const removeTempMessage = async (messageId: number): Promise<void> => {
  const key: string = `tempMessageId:${messageId}`;
  await redisClient.del(key);
};

export const saveExpiryMessage = async (
  messageId: number,
  chatId: number,
  expiresAfter: number
): Promise<void> => {
  await redisClient.setex(`messageId:${messageId}`, expiresAfter, "");
  await redisClient.set(`tempMessageId:${messageId}`, chatId);
};
