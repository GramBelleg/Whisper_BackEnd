import request from "supertest";
import { app, closeApp } from "@src/app";
jest.mock("@services/user/user.service");
import * as userServices from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});
afterEach(() => {
    jest.clearAllMocks();
});
jest.mock("@services/user/user.service");

afterAll(async () => {
    await closeApp();
});

describe("PUT /email Route", () => {
    const email = "test@test.com";

    it("should update the email and return success response", async () => {
        (userServices.updateEmail as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/email").send({ email, code: "123" });
        expect(userServices.updateEmail).toHaveBeenCalledWith(1, email, "123");
        expect(userServices.updateEmail).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(email);
    });

    it("should throw error due to unspecified email", async () => {
        (userServices.updateEmail as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/email").send({code: "1234"});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Email or code not specified");
    });
    it("should throw error due to unspecified code", async () => {
        (userServices.updateEmail as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/email").send({email:"test@test.com"});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Email or code not specified");
    });


});
