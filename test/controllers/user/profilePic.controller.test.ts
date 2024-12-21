import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import * as userServices from "@services/user/user.service"; // Adjust path as needed


// Mocking the services and utility functions
jest.mock("@services/user/user.service");

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeApp();
});

describe("PUT /profilepic Route", () => {
    it("should return success when picture is changed", async () => {
        (userServices.changePic as jest.Mock).mockResolvedValue(undefined);
        const blobName = "testBlobName";
        const response = await request(app).put("/api/user/profilepic").send({ blobName });

        expect(userServices.changePic).toHaveBeenCalledWith(1, blobName); // It should call changePic with correct parameters
        expect(response.status).toBe(200); // Should return success
        expect(response.body.status).toBe("success"); // Success status
        expect(response.body.name).toBe(blobName); // Should return the blob name
    });

});
