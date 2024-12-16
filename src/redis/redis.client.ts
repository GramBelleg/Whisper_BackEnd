import Redis from "ioredis";

class RedisClient {
    private static instance: Redis | null = null;

    private constructor() {
        // Private constructor prevents instantiation
    }

    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
                host: process.env.REDIS_HOST as string,
                port: parseInt((process.env.REDIS_PORT as string) || "6379", 10),
            });

            RedisClient.instance.on("connect", () => {});

            RedisClient.instance.on("error", (err) => {});
        }
        return RedisClient.instance;
    }

    public static async quit(): Promise<void> {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
            RedisClient.instance = null; // Reset instance after quitting
        }
    }
}

export default RedisClient;
