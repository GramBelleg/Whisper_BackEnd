import request from "supertest";
import { app } from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { validatePhoneNumber } from "@src/validators/auth";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import HttpError from "@src/errors/HttpError";
import * as userServices from "@services/user/user.service";

jest.mock("@services/user/user.service");

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

describe("PUT /userName Route", () => {
    const userName = "testUserName";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update the userName and return success response", async () => {
        (userServices.changeUserName as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/userName").send({ userName });

        expect(userServices.changeUserName).toHaveBeenCalled();
        expect(userServices.changeUserName).toHaveBeenCalledWith(1, userName);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(userName);
    });

    it("should give error due to the existed userName", async () => {
        (userServices.changeUserName as jest.Mock).mockRejectedValue(new HttpError("Username is already taken", 409));
        const response = await request(app)
            .put("/api/user/userName")
            .send({ userName });

        expect(userServices.changeUserName).toHaveBeenCalled();
        expect(userServices.changeUserName).toHaveBeenCalledWith(1, userName);
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Username is already taken");
    });

    it("should give error due to the empty userName", async () => {
        (userServices.changeUserName as jest.Mock).mockRejectedValue(new HttpError("Username is required", 400));
        const response = await request(app).put("/api/user/userName").send({ userName: "" });

        expect(userServices.changeUserName).toHaveBeenCalled();
        expect(userServices.changeUserName).toHaveBeenCalledWith(1, "");
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Username is required");
    });
});
