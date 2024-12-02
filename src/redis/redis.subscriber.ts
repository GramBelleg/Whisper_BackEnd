import Redis from "ioredis";

class RedisSubscriber {
    private static instance: Redis | null = null;

    private constructor() {
        // Private constructor prevents instantiation
    }

    public static getInstance(): Redis {
        if (!RedisSubscriber.instance) {
            RedisSubscriber.instance = new Redis({
                host: process.env.REDIS_HOST as string || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT as string || '6379', 10),
            });

            RedisSubscriber.instance.on("connect", () => {
                console.log("Connected to Redis Subscriber!");
            });

            RedisSubscriber.instance.on("error", (err) => {
                console.error("Redis Subscriber connection error:", err);
            });
        }
        return RedisSubscriber.instance;
    }

    public static async quit(): Promise<void> {
        if (RedisSubscriber.instance) {
            await RedisSubscriber.instance.quit();
            RedisSubscriber.instance = null; // Reset instance after quitting
            console.log("Redis Subscriber connection closed.");
        }
    }
}

export default RedisSubscriber;
