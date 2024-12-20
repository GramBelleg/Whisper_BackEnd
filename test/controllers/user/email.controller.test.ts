import request from "supertest";
import { app, closeApp } from "@src/app";
jest.mock("@services/user/user.service");
import * as userServices from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";



jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        req.userRole = "User"; // Mock the authenticated user role
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
        const response = await request(app)
            .put("/api/user/email")
            .send({ email });
        console.log(response.body);
        expect(userServices.updateEmail).toHaveBeenCalledWith(1, email, "");
        expect(userServices.updateEmail).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(email);
    });

    it("should fail to update the email", async () => {
        (userServices.updateEmail as jest.Mock).mockRejectedValue(new HttpError("Email is required", 400));
        const response = await request(app)
            .put("/api/user/email")
            .send({ email: "" });
            expect(userServices.updateEmail).toHaveBeenCalledWith(1, "", "");
            expect(userServices.updateEmail).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Email is required");
    });
});
