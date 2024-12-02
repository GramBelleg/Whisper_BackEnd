import { Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { getToken, verifyUserToken } from "@services/auth/token.service";
import { deleteUserToken } from "@services/auth/prisma/delete.service";
import { findTokenByUserIdToken } from "@services/auth/prisma/find.service";

jest.mock("@services/auth/prisma/delete.service");
jest.mock("@services/auth/prisma/find.service");

describe("test get token from request", () => {
    let req: Request;
    beforeEach(() => {
        req = {
            cookies: {},
            headers: {},
        } as unknown as Request;
    });

    it("should return token from cookies", () => {
        req = {
            cookies: { token: "testToken" },
            headers: {},
        } as unknown as Request;
        const token = getToken(req);
        expect(token).toEqual("testToken");
    });

    it("should return token from authorization header", () => {
        req = {
            cookies: {},
            headers: { authorization: "Bearer testToken" },
        } as unknown as Request;
        const token = getToken(req);
        expect(token).toEqual("testToken");
    });

    it("should throw an error if token header is not in correct form", () => {
        req = {
            cookies: {},
            headers: { authorization: "Beare testToken" },
        } as unknown as Request;
        expect(() => getToken(req)).toThrow("Token is not found");
    });

    it("should throw an error if token is not found", () => {
        req = {
            cookies: {},
            headers: {},
        } as unknown as Request;
        expect(() => getToken(req)).toThrow("Token is not found");
    });
});

describe("test verify user token", () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
        (findTokenByUserIdToken as jest.Mock).mockResolvedValue({ userId });
    });

    it("should verify user token and return userId", async () => {
        const userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
        });
        const result = await verifyUserToken(userToken);
        expect(result).toEqual(userId);
        expect(findTokenByUserIdToken).toHaveBeenCalledWith(userId, userToken);
        expect(deleteUserToken).not.toHaveBeenCalled();
    });

    it("should throw an error if token is expired", async () => {
        (deleteUserToken as jest.Mock).mockResolvedValue(undefined);
        const userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: "1ms",
        });

        await expect(verifyUserToken(userToken)).rejects.toThrow("Login again.");
        expect(deleteUserToken).toHaveBeenCalledWith(userId, userToken);
    });

    it("should throw an error if userId is not found in token", async () => {
        await expect(verifyUserToken("tokenTest")).rejects.toThrow("Login again.");
        expect(deleteUserToken).not.toHaveBeenCalled();
    });
});
