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

describe("PUT /setAutoDownloadSize", () => {
    it("should throw error due to null size", async () => {
        const newSize = null
        const response = await request(app).put("/api/user/setAutoDownloadSize").send({ size: newSize });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Automatic Download Size not specified");
    });

    it("should throw error due to undefined size", async () => {
        const newSize = undefined;
        const response = await request(app).put("/api/user/setAutoDownloadSize").send({ size: newSize });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Automatic Download Size not specified");
    });

    it("should throw error due to invalid size", async () => {
        const newSize = 100000;
        const response = await request(app).put("/api/user/setAutoDownloadSize").send({ size: newSize });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid file size specified");
    });

    it("should update the auto download size", async () => {
        const newSize = 500;
        const response = await request(app).put("/api/user/setAutoDownloadSize").send({ size: newSize });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Automatic download size updated.");
    });

});

