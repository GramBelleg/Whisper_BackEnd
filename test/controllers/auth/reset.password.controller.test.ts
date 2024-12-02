import request from "supertest";
import { faker } from "@faker-js/faker";
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateCode,
} from "@validators/auth";
import { updatePassword } from "@services/auth/prisma/update.service";
import { checkEmailExistDB } from "@services/auth/login.service";
import { createCode, sendCode, verifyCode } from "@services/auth/code.service";
import { createAddToken, createTokenCookie } from "@services/auth/token.service";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import HttpError from "@src/errors/HttpError";
import { app, closeApp } from "@src/app";

jest.mock("@validators/auth");
jest.mock("@services/auth/prisma/update.service");
jest.mock("@services/auth/login.service");
jest.mock("@services/auth/code.service");
jest.mock("@services/auth/token.service");

afterAll(async () => {
    await closeApp();
});


describe("test send reset code controller", () => {
    const data = {
        email: faker.internet.email().toLowerCase(),
    };

    beforeEach(() => {
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (checkEmailExistDB as jest.Mock).mockResolvedValue(undefined);
        (createCode as jest.Mock).mockResolvedValue("123456");
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should send reset code be successfully", async () => {
        (sendCode as jest.Mock).mockResolvedValueOnce(undefined);
        const response = await request(app).post("/api/auth/sendResetCode").send(data);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
        });
    });
    it("should signup be unsuccessfully", async () => {
        (sendCode as jest.Mock).mockRejectedValueOnce(new HttpError("Error in sending code", 500));
        const response = await request(app).post("/api/auth/sendResetCode").send(data);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in sending code",
            stack: undefined,
        });
    });
});

describe("test reset password controller", () => {
    const data = {
        email: faker.internet.email().toLowerCase(),
        password: "123456789",
        confirmPassword: "123456789",
        code: "123456",
    };

    beforeEach(() => {
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (validatePassword as jest.Mock).mockReturnValue(undefined);
        (validateConfirmPassword as jest.Mock).mockReturnValue(undefined);
        (validateCode as jest.Mock).mockReturnValue(undefined);
        (checkEmailExistDB as jest.Mock).mockResolvedValue(undefined);
        (verifyCode as jest.Mock).mockResolvedValue(undefined);
        (createTokenCookie as jest.Mock).mockReturnValue(undefined);
        (createAddToken as jest.Mock).mockResolvedValueOnce("token");
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should send reset code be successfully", async () => {
        const user = await createRandomUser();
        (updatePassword as jest.Mock).mockResolvedValueOnce(user);
        const response = await request(app).post("/api/auth/resetPassword").send({ ...data, email: user.email });
        expect(response.status).toEqual(200);
        expect(response.body.status).toEqual("success");
        expect(response.body.user.email).toEqual(user.email);
        expect(response.body.userToken).toEqual("token");
    });
    it("should signup be unsuccessfully", async () => {
        (updatePassword as jest.Mock).mockRejectedValueOnce(
            new HttpError("Error in updating password", 500)
        );
        const response = await request(app).post("/api/auth/resetPassword").send(data);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in updating password",
            stack: undefined,
        });
    });
});
