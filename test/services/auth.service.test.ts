import { Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { getToken, verifyUserToken, checkUserTokenExist } from "@services/auth/token.service";
import { deleteUserToken } from "@services/auth/prisma/delete.service";

jest.mock("@services/auth/token.service");
jest.mock("@services/auth/prisma/delete.service");

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
        try {
            getToken(req);
        } catch (err: any) {
            expect(err.message).toEqual("Token is not found");
        }
    });

    it("should throw an error if token is not found", () => {
        req = {
            cookies: {},
            headers: {},
        } as unknown as Request;
        try {
            getToken(req);
        } catch (err: any) {
            expect(err.message).toEqual("Token is not found");
        }
    });
});

describe("test verify user token", () => {
    // const userToken = "testToken";
    const userId = 1;

    beforeEach(() => {
        // (jwt.verify as jest.Mock).mockImplementation((token, secret, options) => {
        //     if (options && options.ignoreExpiration) {
        //         return { id: userId };
        //     }
        //     if (token === userToken) {
        //         return { id: userId };
        //     }
        //     throw new TokenExpiredError("jwt expired", new Date());
        // });
        jest.clearAllMocks();
        (checkUserTokenExist as jest.Mock).mockResolvedValue(undefined);
    });

    it("should verify user token and return userId", async () => {
        // (jwt.verify as jest.Mock).mockReturnValueOnce({ id: userId });
        const userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE as string,
        });
        const result = await verifyUserToken(userToken);
        expect(result).toEqual(userId);
        expect(checkUserTokenExist).toHaveBeenCalledWith(userId, userToken);
        expect(deleteUserToken).not.toHaveBeenCalled();
    });

    it("should throw an error if token is expired", async () => {
        (deleteUserToken as jest.Mock).mockResolvedValue(undefined);
        const userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: "1ms",
        });
        // (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        //     throw new TokenExpiredError("jwt expired", new Date());
        // });

        // await expect(verifyUserToken(userToken)).rejects.toThrow("Login again.");
        try {
            await verifyUserToken(userToken);
        } catch (err: any) {
            expect(err.message).toEqual("Login again.");
        }
        expect(deleteUserToken).toHaveBeenCalledWith(userId, userToken);
    });

    it("should throw an error if userId is not found in token", async () => {
        // (jwt.verify as jest.Mock).mockImplementationOnce(() => ({}));
        // await expect(verifyUserToken("tokenTest")).rejects.toThrow();
        try {
            await verifyUserToken("tokenTest");
        } catch (err: any) {
            expect(err.message).toEqual("Login again.");
        }
        expect(deleteUserToken).not.toHaveBeenCalled();
    });
});
