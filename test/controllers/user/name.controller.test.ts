import request from "supertest";
import { app } from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
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


describe("PUT /name Route", () => {
    let user: User;
    const name = "This is my new name";

    it("should update the name and return success response", async () => {
        (userServices.updateName as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app)
            .put("/api/user/name")
            .send({ name });

        expect(userServices.updateName).toHaveBeenCalledWith(1, name);
        expect(userServices.updateName).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(name);
    });

    it("should fail to update the name", async () => {
        (userServices.updateName as jest.Mock).mockRejectedValue(new HttpError("Name is required", 400));
        const response = await request(app)
            .put("/api/user/name")
            .send({ name: "" });

            expect(userServices.updateName).toHaveBeenCalledWith(1, "");
            expect(userServices.updateName).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Name is required");
    });
});
