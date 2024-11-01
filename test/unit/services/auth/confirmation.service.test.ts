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

describe("createCode function", () => {
    const user = {
        name: "Test User",
        userName: "testuser",
        email: "testuser@example.com",
        phoneNumber: "1234567890",
        password: "initialPassword",
    };
    const expiresIn = 300;
    const operation = RedisOperation.ConfirmEmail;

    it("should generate a code, hash the password, and call cacheData and setExpiration with correct values", async () => {
        const cacheDataMock = jest
            .spyOn(require("@services/auth/confirmation.service"), "cacheData")
            .mockResolvedValueOnce(undefined);
        const setExpirationMock = jest
            .spyOn(require("@services/auth/confirmation.service"), "setExpiration")
            .mockResolvedValueOnce(undefined);

        const mockCode = "ABCD1234";
        jest.spyOn(randomstring, "generate").mockReturnValue(mockCode);

        const code = await createCode(user, operation, expiresIn);

        expect(cacheDataMock).toHaveBeenCalledWith(operation, code, {
            ...user,
            password: expect.any(String), // hashed password
            expireAt: expect.any(String), // expiration date
        });
        expect(setExpirationMock).toHaveBeenCalledWith(operation, code, expiresIn);

        expect(code).toEqual(mockCode);

        cacheDataMock.mockRestore();
        setExpirationMock.mockRestore();
        jest.restoreAllMocks();
    });
});
