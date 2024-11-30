import redis from "@src/redis/redis.client";
import RedisOperation from "@src/@types/redis.operation";

const setExpiration = async (operation: RedisOperation, key: string, expiresIn: number) => {
    await redis.expire(`${operation}:${key}`, expiresIn); // expire in 10 minutes
};
const cacheData = async (operation: RedisOperation, key: string, data: any) => {
    await redis.hmset(`${operation}:${key}`, data);
};
const getExpiration = async (operation: RedisOperation, key: string) => {
    const ttl = await redis.ttl(`${operation}:${key}`);
    return ttl;
};
const getCachedData = async (operation: RedisOperation, key: string) => {
    const data = await redis.hgetall(`${operation}:${key}`);
    return data;
};

export { cacheData, setExpiration, getCachedData, getExpiration };
