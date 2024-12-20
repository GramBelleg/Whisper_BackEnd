import request from "supertest";
import { app, closeApp } from "@src/app";
import * as userServices from "@services/user/user.service";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1; // Mock the authenticated user ID
        req.userRole = "User"; // Mock the authenticated user role
        next();
    });
});

jest.mock("@services/user/user.service");

jest.mock("@services/user/user.service");

afterAll(async () => {
    await closeApp();
});


describe("PUT /bio Route", () => {
    const bio = "This is my new bio";
    it("should update the bio and return success response", async () => {
        (userServices.updateBio as jest.Mock).mockResolvedValue(undefined);
        (userServices.updateBio as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/bio").send({ bio });

        // const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(userServices.updateBio).toHaveBeenCalledWith(1, bio);
        expect(userServices.updateBio).toHaveBeenCalledTimes(1);
        // const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(userServices.updateBio).toHaveBeenCalledWith(1, bio);
        expect(userServices.updateBio).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(bio);
        // expect(updatedUser?.bio).toBe(bio);
        // expect(updatedUser?.bio).toBe(bio);
    });
});