import bcrypt from "bcrypt";
import { saveUserData } from "@services/auth/signup.service"; // Import the function to test
import { checkEmailExistRedis, getTimeToLive } from "@services/auth/confirmation.service";
import dotenv from "dotenv";

dotenv.config({ path: "test.env" });

describe("saveUserData function", () => {
    beforeAll(async () => {});

    afterAll(async () => {});

    it("should store user data in Redis with an expiration time", async () => {
        const email = "testuser@example.com";
        const userData = {
            name: "Test User",
            userName: "testuser",
            email: email,
            phoneNumber: "1234567890",
            password: "testpassword",
        };

        // Call the saveUserData function
        await saveUserData(
            userData.name,
            userData.userName,
            userData.email,
            userData.phoneNumber,
            userData.password
        );
        const storedData = await checkEmailExistRedis(userData.email);
        // Verify that the data was stored in Redis

        expect(storedData.name).toEqual(userData.name);
        expect(storedData.userName).toEqual(userData.userName);
        expect(storedData.email).toEqual(userData.email);
        expect(storedData.phoneNumber).toEqual(userData.phoneNumber);
        // Ensure that the password is hashed
        expect(bcrypt.compareSync(userData.password, storedData.password)).toBe(true);

        // Verify the TTL (Time to Live) is set to 3 hours (10800 seconds)
        const ttl = await getTimeToLive(userData.email);
        expect(ttl).toBeGreaterThan(0); // TTL should be greater than 0 if it was set correctly
        expect(ttl).toBeLessThanOrEqual(10800); // Shouldn't be more than 3 hours
    });
});
