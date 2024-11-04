import { Response } from "express";
import jwt from "jsonwebtoken";
import {
    createTokenCookie,
    clearTokenCookie,
    createAddToken,
    checkUserTokenExist,
} from "@services/auth/token.service";
import { createUserToken } from "@services/auth/prisma/create.service";
import { findUserByUserToken } from "@services/auth/prisma/find.service";

jest.mock("@services/auth/prisma/create.service");
jest.mock("@services/auth/prisma/find.service");
jest.mock("jsonwebtoken");

let res: Response;

beforeEach(() => {
    res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;
});

describe("test create token cookie", () => {
    it("should set a cookie with the token", () => {
        const token = "testToken";
        createTokenCookie(res, token);
        expect(res.cookie).toHaveBeenCalledWith("token", token, {
            expires: expect.any(Date),
            httpOnly: true,
            secure: false,
        });
    });
});

describe("test clearTokenCookie", () => {
    it("should clear the token cookie", () => {
        clearTokenCookie(res);
        expect(res.clearCookie).toHaveBeenCalledWith("token", {
            httpOnly: true,
        });
    });
});

describe("test create and add token in DB", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should create and add a token", async () => {
        const userId = 1;
        const userToken = "testToken";
        const expireAt = new Date(Date.now() + 3600 * 1000);
        (createUserToken as jest.Mock).mockResolvedValue(undefined);
        (jwt.sign as jest.Mock).mockReturnValue(userToken);
        const result = await createAddToken(userId);
        expect(createUserToken).toHaveBeenCalledWith(userToken, expect.any(Date), userId);
        expect(result).toEqual(userToken);
    });

    it("should throw an error if token creation fails", async () => {
        const userId = 1;
        (jwt.sign as jest.Mock).mockImplementation(() => {
            throw new Error("Token creation failed");
        });
        try {
            await createAddToken(userId);
        } catch (err: any) {
            expect(err.message).toEqual("User token creation failed");
        }
    });
});

describe("test check user token is exist", () => {
    it("should throw an error if user token does not exist", async () => {
        const userId = 1;
        const userToken = "testToken";
        (findTokenByUserIdToken as jest.Mock).mockResolvedValue(null);
        try {
            await checkUserTokenExist(userId, userToken);
        } catch (err: any) {
            expect(err.message).toBe("User token not found");
        }
    });

    it("should not throw an error if user token exists", async () => {
        const userId = 1;
        const userToken = "testToken";
        (findTokenByUserIdToken as jest.Mock).mockResolvedValue({ id: userId, token: userToken });
        const returnValue = await checkUserTokenExist(userId, userToken);
        expect(returnValue).toBeUndefined();
    });
});
