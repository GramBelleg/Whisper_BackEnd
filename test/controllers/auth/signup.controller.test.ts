import request from "supertest";
import { faker } from "@faker-js/faker";
import * as authValidator from "@validators/auth";
import { isUniqueUser, verifyRobotToken } from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/code.service";
import { cacheData, setExpiration } from "@services/auth/redis.service";
import HttpError from "@src/errors/HttpError";
import { app, closeApp } from "@src/app";

jest.mock("@validators/auth");
jest.mock("@services/auth/signup.service");
jest.mock("@services/auth/code.service");
jest.mock("@services/auth/redis.service");


afterAll(async () => {
    await closeApp();
});

describe("test signup controller", () => {
    const data = {
        email: faker.internet.email().toLowerCase(),
        userName: faker.internet.username().toLowerCase(),
        name: faker.person.fullName().toLowerCase(),
        password: '123456789',
        phoneNumber: faker.phone.number({ style: "international" }),
    };
    beforeEach(() => {
        (authValidator.validateSignUp as jest.Mock).mockReturnValue(undefined);
        (isUniqueUser as jest.Mock).mockResolvedValue(undefined);
        (verifyRobotToken as jest.Mock).mockResolvedValue(undefined);
        (createCode as jest.Mock).mockResolvedValue("123456");
        (cacheData as jest.Mock).mockResolvedValue(undefined);
        (setExpiration as jest.Mock).mockResolvedValue(undefined);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should signup be successfully", async () => {
        (sendCode as jest.Mock).mockResolvedValueOnce(undefined);
        const response = await request(app)
            .post("/api/auth/signup")
            .send(data);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            userData: {
                email: data.email,
                name: data.name,
            },
        });
    });
    it("should signup be unsuccessfully", async () => {
        (sendCode as jest.Mock).mockRejectedValueOnce(new HttpError("Error in sending code", 500));
        const response = await request(app)
            .post("/api/auth/signup")
            .send(data);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in sending code",
            stack: undefined,
        });
    });
});