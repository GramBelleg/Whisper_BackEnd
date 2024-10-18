import Redis from "ioredis";

const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
});

redisSubscriber.on("connect", () => {
    console.log("Connected to Redis Subscriber!");
});

redisSubscriber.on("error", (err) => {
    console.error("Redis Subscriber connection error:", err);
});

export default redisSubscriber;
