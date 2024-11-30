import request from "supertest";
import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import HttpError from "@src/errors/HttpError";
import app from "@src/app";
import { verifyUserToken, getToken, clearTokenCookie } from "@services/auth/token.service";
import userAuth from '@src/middlewares/auth.middleware';

jest.mock("@services/auth/token.service");


app.get("/userAuthTest", userAuth, (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        message: "User has been blocked or unblocked successfully.",
    });
});

beforeAll(() => {
    app.listen(5563);
});

describe("test user auth middleware", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should pass the user auth middleware", async () => {
        (getToken as jest.Mock).mockReturnValue("valid-token");
        (verifyUserToken as jest.Mock).mockResolvedValue(4);
        const response = await request(app).get("/userAuthTest").set("Authorization", `Bearer valid-token`);
        expect(getToken as jest.Mock).toHaveBeenCalled();
        expect(getToken as jest.Mock).toHaveReturnedWith("valid-token");
        expect(verifyUserToken as jest.Mock).toHaveBeenCalled();
        expect(verifyUserToken as jest.Mock).toHaveBeenCalledWith("valid-token");
        // expect(verifyUserToken as jest.Mock).toHaveReturnedWith(4);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "User has been blocked or unblocked successfully.",
        });
    });
});
