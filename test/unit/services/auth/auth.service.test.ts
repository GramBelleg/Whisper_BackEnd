import { faker } from "@faker-js/faker";
import { cacheData, getCachedData } from "@services/auth/confirmation.service";
import redis from "@src/redis/redis.client"; // Import the redis client
import RedisOperation from "@src/@types/redis.operation";
import dotenv from "dotenv";
dotenv.config({
    path: `../../../../.env.${process.env.NODE_ENV}`,
});
console.log(process.env.REDIS_HOST);
console.log(process.env.REDIS_PORT);
describe("cacheData and getCachedData functions", () => {
    afterAll(async () => {
        await redis.quit();
    });
    it("should store and retrieve user data to and from Redis ", async () => {
        const userData = {
            name: "Test User",
            userName: "testuser",
            email: "testuser@example.com",
            phoneNumber: "1234567890",
            password: "testpassword",
        };
        const key = faker.string.alphanumeric(10);
        await cacheData(RedisOperation.ConfirmEmail, key, userData);
        const storedData = await getCachedData(RedisOperation.ConfirmEmail, key);

        expect(storedData).toEqual(userData);
    });
});
