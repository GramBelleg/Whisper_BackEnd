import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { findUserByUserName } from "@services/auth/prisma/find.service";
import { addContact } from "@services/user/user.service";

// Mocking the services and utility functions
jest.mock("@services/user/user.service");
jest.mock("@services/auth/prisma/find.service");

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


describe("POST /contcat", () => {
    it("should throw error(no user with this userName)", async () => {
        (findUserByUserName as jest.Mock).mockResolvedValueOnce(null);
        const response = await request(app).post("/api/user/contact").send({ userName: "test" });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No user specified to add");
    });

    it("should throw error due to undefined contact", async () => {
        const contact = undefined;
        const response = await request(app).post("/api/user/contact").send({ userName: contact });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No user specified to add");
    });

    it("should throw error due to invalid contact", async () => {
        const contact = "1234567890";
        const response = await request(app).post("/api/user/contact").send({ contact });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No user specified to add");
    });

    it("should add the contact", async () => {
        (findUserByUserName as jest.Mock).mockResolvedValueOnce({ id: 2 });
        (addContact as jest.Mock).mockResolvedValueOnce(true);
        const response = await request(app).post("/api/user/contact").send({ userName: "test" });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User added successfully.");
    });

});