import bcrypt from "bcrypt";
import { saveUserData } from "@services/auth1/signup.service"; // Import the function to test
import { checkEmailExistRedis, getTimeToLive } from "@services/auth1/confirmation.service";
import dotenv from "dotenv";
import redis from "@src/redis/redis.client"; // Import the redis client

dotenv.config({ path: "test.env" });

describe("saveUserData function", () => {
    afterAll(async () => {
        await redis.quit();
    });
    it("should store user data in Redis with an expiration time", async () => {
        const email = "testuser@example.com";
        const userData = {
            name: "Test User",
            userName: "testuser",
            email: email,
            phoneNumber: "1234567890",
            password: "testpassword",
        };

        await saveUserData(
            userData.name,
            userData.userName,
            userData.email,
            userData.phoneNumber,
            userData.password
        );
        const storedData = await checkEmailExistRedis(userData.email);

        expect(storedData.name).toEqual(userData.name);
        expect(storedData.userName).toEqual(userData.userName);
        expect(storedData.email).toEqual(userData.email);
        expect(storedData.phoneNumber).toEqual(userData.phoneNumber);
        expect(bcrypt.compareSync(userData.password, storedData.password)).toBe(true);

        const ttl = await getTimeToLive(userData.email);
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(10800);
    });
});
