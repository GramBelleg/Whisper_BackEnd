import {
    cacheData,
    getCachedData,
    setExpiration,
    getExpiration,
    createCode,
} from "@services/auth/confirmation.service";
import redis from "@src/redis/redis.client";
import RedisOperation from "@src/@types/redis.operation";
import randomstring from "randomstring";
afterAll(async () => {
    await redis.quit();
});
describe("cacheData and getCachedData functions", () => {
    it("should store and retrieve user data to and from Redis ", async () => {
        const userInfo = {
            name: "Test User",
            userName: "testuser",
            email: "testuser@example.com",
            phoneNumber: "1234567890",
            password: "testpassword",
        };
        const key = randomstring.generate({ length: 10 });
        await cacheData(RedisOperation.ConfirmEmail, key, userInfo);
        const storedData = await getCachedData(RedisOperation.ConfirmEmail, key);

        expect(storedData).toEqual(userInfo);
    });

    it("should retrieve no data from Redis ", async () => {
        const key = randomstring.generate({ length: 10 });
        const storedData = await getCachedData(RedisOperation.ConfirmEmail, key);

        expect(storedData).toEqual({});
    });
});

describe("setExpiration and getExpiration functions", () => {
    it("should set expriration time", async () => {
        const userInfo = {
            name: "Test User",
            userName: "testuser",
            email: "testuser@example.com",
            phoneNumber: "1234567890",
            password: "testpassword",
        };
        const key = randomstring.generate({ length: 10 });
        await cacheData(RedisOperation.ConfirmEmail, key, userInfo);

        const expiresIn = 60 * 10; //seconds
        await setExpiration(RedisOperation.ConfirmEmail, key, expiresIn);

        const timeToLive = await getExpiration(RedisOperation.ConfirmEmail, key);

        expect(timeToLive).toBeLessThanOrEqual(expiresIn);
        expect(timeToLive).toBeGreaterThan(expiresIn - 10); //assuming it wont take longer than 10 seconds to get here
    });
});


// describe("createCode function", () => {
//     it("should create and cache the verification code with the user's data", async () => {
//         const userInfo = {
//             name: "Test User",
//             userName: "testuser",
//             email: "testuser@example.com",
//             phoneNumber: "1234567890",
//             password: "testpassword",
//         };
//         const expiresIn = 60 * 5;
//     });
// });
