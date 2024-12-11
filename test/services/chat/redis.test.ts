import { saveExpiringMessage } from "@services/chat/redis.service"; // Update with the correct import path
import redisClient from "@src/redis/redis.client";
import { closeApp } from "@src/app";

describe("redisChatService", () => {
    afterAll(async () => {
        await closeApp();
    });

    it("should save expiry message", async () => {
        const id = 5;
        const expiry = 10;
        await saveExpiringMessage(id, expiry);
        const result = await redisClient.getInstance().get(`messageId:${id}`);
        expect(result).toEqual("");
    });
    it("should throw an error", async () => {
        const id = 5;
        const expiry = null;
        try {
            await saveExpiringMessage(id, expiry);
        } catch (error) {
            if (error instanceof Error) {
                expect(error.message).toEqual("Expiry time not provided");
            }
        }
    });
});
