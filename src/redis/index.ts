import { createClient, RedisClientType } from 'redis';

const globalForRedis = global as unknown as { redis: RedisClientType };

const redis = globalForRedis.redis || createClient({
    url: process.env.REDIS_URL,
});

if (!globalForRedis.redis) {
    redis.connect().then(() => console.log('Start connection to Redis')).catch(error => console.error);
    globalForRedis.redis = redis;
}

redis.on('error', err => console.log('Redis Client Error', err));


export default redis;