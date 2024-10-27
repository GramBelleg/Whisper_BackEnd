import Redis from "ioredis";

const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT as unknown as number,
});

redisSubscriber.on("connect", () => {
    console.log("Connected to Redis Subscriber!");
});

redisSubscriber.on("error", (err) => {
    console.error("Redis Subscriber connection error:", err);
});

export default redisSubscriber;
