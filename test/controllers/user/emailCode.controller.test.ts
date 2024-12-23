import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { createCode } from "@services/auth/code.service";
import HttpError from "@src/errors/HttpError";
import { validateEmail } from "@src/validators/auth";
import { sendCode } from "@src/services/auth/code.service";
import { findUserByEmail } from "@src/services/auth/prisma/find.service";
import RedisOperation from "@src/@types/redis.operation";

// Mocking the services and utility functions
jest.mock("@src/validators/auth");
jest.mock("@src/services/auth/prisma/find.service");
jest.mock("@services/auth/code.service");

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

describe("PUT /emailCode Route", () => {
    const email = "test@test.com";

    it("should throw error if the email is invalid", async () => {
        // Mock validateEmail to throw an error
        (validateEmail as jest.Mock).mockImplementation(() => {
            throw new HttpError("Invalid email format", 422);
        });

        const response = await request(app).post("/api/user/emailCode").send({ email });

        expect(response.status).toBe(422); // Expecting a 400 bad request error
        expect(response.body.message).toBe("Invalid email format"); // The error message should be from validateEmail
    });

    it("should throw error if the email already exists", async () => {
        // Mock findUserByEmail to simulate an email already being taken
        (findUserByEmail as jest.Mock).mockResolvedValue(true);
        (validateEmail as jest.Mock).mockImplementation(() => {return;});

        const response = await request(app).post("/api/user/emailCode").send({ email });

        expect(findUserByEmail).toHaveBeenCalledWith(email);
        expect(response.status).toBe(409); // Conflict, as the email already exists
        expect(response.body.message).toBe("Email already exists"); // Custom error message when email is found
    });

    it("should return success when email code is generated and sent", async () => {
        // Mock findUserByEmail to return null (email does not exist)
        (findUserByEmail as jest.Mock).mockResolvedValue(null);
        (validateEmail as jest.Mock).mockImplementation(() => {return;});

        // Mock createCode to return a generated code (e.g., "123456")
        const generatedCode = "123456";
        (createCode as jest.Mock).mockResolvedValue(generatedCode);

        // Mock sendCode to simulate successful sending of the code
        (sendCode as jest.Mock).mockResolvedValue(true); // No error during sending the email

        const response = await request(app).post("/api/user/emailCode").send({ email });

        expect(findUserByEmail).toHaveBeenCalledWith(email); // It should check if the email exists
        expect(createCode).toHaveBeenCalledWith(email, RedisOperation.ConfirmEmail, expect.any(Number)); // It should call createCode
        expect(sendCode).toHaveBeenCalledWith(email, "confirmation code", expect.any(String)); // It should send the email
        expect(response.status).toBe(200); // Should return success
        expect(response.body.status).toBe("success"); // Success status
    });
});