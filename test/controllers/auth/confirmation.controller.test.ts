import request from "supertest";
import { faker } from "@faker-js/faker";
import { app, closeApp } from "@src/app";
import { validateEmail, validateCode } from "@validators/auth";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { createCode, sendCode, verifyCode } from "@services/auth/code.service";
import { getCachedData } from "@services/auth/redis.service";
import { addUser } from "@services/auth/prisma/create.service";
import RedisOperation from "@src/@types/redis.operation";
import HttpError from "@src/errors/HttpError";

jest.mock("@validators/auth");
jest.mock("@services/auth/token.service");
jest.mock("@services/auth/code.service");
jest.mock("@services/auth/redis.service");
jest.mock("@services/auth/prisma/create.service");

afterAll(async () => {
    await closeApp();
});

describe("test resend cofirm code controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should resend confirm code be successfully", async () => {
        const email = faker.internet.email().toLowerCase();
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (createCode as jest.Mock).mockResolvedValue("code");
        (sendCode as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app).post("/api/auth/resendConfirmCode").send({ email });
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
        });
        const codeExpiry = parseInt(process.env.CODE_EXPIRES_IN as string);
        expect(validateEmail).toHaveBeenCalled();
        expect(validateEmail).toHaveBeenCalledWith(email);
        expect(createCode).toHaveBeenCalled();
        expect(createCode).toHaveBeenCalledWith(email, RedisOperation.ConfirmEmail, codeExpiry);
        expect(sendCode).toHaveBeenCalled();
        expect(sendCode).toHaveBeenCalledWith(email, "Email confirmation", expect.any(String));
    });

    it("should resend confirm code be unsuccessfully", async () => {
        const email = faker.internet.email().toLowerCase();
        (validateEmail as jest.Mock).mockImplementation(() => {
            throw new HttpError("Error in validating email", 422);
        });

        const response = await request(app).post("/api/auth/resendConfirmCode").send({ email });
        expect(response.status).toEqual(422);
        expect(response.body).toEqual({
            success: false,
            message: "Error in validating email",
        });
        expect(validateEmail).toHaveBeenCalled();
        expect(validateEmail).toHaveBeenCalledWith(email);
        expect(createCode).not.toHaveBeenCalled();
        expect(sendCode).not.toHaveBeenCalled();
    });
});

describe("test confirm email controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should confirm email be successfully", async () => {
        const email = faker.internet.email().toLowerCase();
        const code = '123456';
        const user = {
            id: 555,
            email,
            name: faker.person.fullName().toLowerCase(),
            userName: faker.internet.username().toLowerCase(),
            password: "123456789",
        };
        (getCachedData as jest.Mock).mockResolvedValue(user);
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (validateCode as jest.Mock).mockReturnValue(undefined);
        (verifyCode as jest.Mock).mockResolvedValue(undefined);
        (addUser as jest.Mock).mockResolvedValue(user);
        (createAddToken as jest.Mock).mockResolvedValue("token");

        const response = await request(app).post("/api/auth/confirmEmail").send({ email, code });
        expect(response.status).toEqual(200);
        expect(response.body.status).toEqual("success");
        expect(response.body.userToken).toEqual("token");
        expect(response.body.user.id).toEqual(user.id);
        expect(response.body.user.email).toEqual(user.email);
        expect(response.body.user.name).toEqual(user.name);
        expect(response.body.user.userName).toEqual(user.userName);
        expect(validateEmail).toHaveBeenCalled();
        expect(validateEmail).toHaveBeenCalledWith(email);
        expect(validateCode).toHaveBeenCalled();
        expect(validateCode).toHaveBeenCalledWith(code);
        expect(verifyCode).toHaveBeenCalled();
        expect(verifyCode).toHaveBeenCalledWith(email, code, RedisOperation.ConfirmEmail);
        expect(getCachedData).toHaveBeenCalled();
        expect(getCachedData).toHaveBeenCalledWith(RedisOperation.AddNewUser, email);
        expect(addUser).toHaveBeenCalled();
        expect(addUser).toHaveBeenCalledWith(user);
        expect(createAddToken).toHaveBeenCalled();
        expect(createAddToken).toHaveBeenCalledWith(user.id, undefined);
        expect(createTokenCookie).toHaveBeenCalled();
    });

    it("should confirm email be unsuccessfully", async () => {
        const email = faker.internet.email().toLowerCase();
        const code = '123456';
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (validateCode as jest.Mock).mockReturnValue(undefined);
        (verifyCode as jest.Mock).mockImplementation(() => {
            throw new HttpError("Error in verifying code", 422);
        });

        const response = await request(app).post("/api/auth/confirmEmail").send({ email, code });
        expect(response.status).toEqual(422);
        expect(response.body).toEqual({
            success: false,
            message: "Error in verifying code",
        });
        expect(validateEmail).toHaveBeenCalled();
        expect(validateEmail).toHaveBeenCalledWith(email);
        expect(validateCode).toHaveBeenCalled();
        expect(validateCode).toHaveBeenCalledWith(code);
        expect(verifyCode).toHaveBeenCalled();
        expect(verifyCode).toHaveBeenCalledWith(email, code, RedisOperation.ConfirmEmail);
        expect(getCachedData).not.toHaveBeenCalled();
        expect(addUser).not.toHaveBeenCalled();
        expect(createAddToken).not.toHaveBeenCalled();
        expect(createTokenCookie).not.toHaveBeenCalled();
    });

    it("should confirm email be unsuccessfully when user not found", async () => {
        const email = faker.internet.email().toLowerCase();
        const code = '123456';
        (validateEmail as jest.Mock).mockReturnValue(undefined);
        (validateCode as jest.Mock).mockReturnValue(undefined);
        (verifyCode as jest.Mock).mockResolvedValue(undefined);
        (getCachedData as jest.Mock).mockResolvedValue({});

        const response = await request(app).post("/api/auth/confirmEmail").send({ email, code });
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Email verification took too long, Please Sign up again",
        });
        expect(validateEmail).toHaveBeenCalled();
        expect(validateEmail).toHaveBeenCalledWith(email);
        expect(validateCode).toHaveBeenCalled();
        expect(validateCode).toHaveBeenCalledWith(code);
        expect(verifyCode).toHaveBeenCalled();
        expect(verifyCode).toHaveBeenCalledWith(email, code, RedisOperation.ConfirmEmail);
        expect(getCachedData).toHaveBeenCalled();
        expect(addUser).not.toHaveBeenCalled();
        expect(createAddToken).not.toHaveBeenCalled();
        expect(createTokenCookie).not.toHaveBeenCalled();
    });
});
