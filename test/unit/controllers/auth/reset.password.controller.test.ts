import request from "supertest";
import { faker } from "@faker-js/faker";
import { validateEmail, validateResetCode } from "@validators/confirm.reset";
import { updatePassword } from "@services/prisma/auth/update.service";
import { checkEmailExistDB } from "@services/auth/login.service";
import { createCode, sendCode, verifyCode } from "@services/auth/confirmation.service";
import { createAddToken, createTokenCookie } from "@services/auth/token.service";
import { createRandomUser } from "@src/services/prisma/auth/create.service";
import HttpError from "@src/errors/HttpError";
import app from "@src/app";

jest.mock("@validators/confirm.reset");
jest.mock("@services/prisma/auth/update.service");
jest.mock("@services/auth/login.service");
jest.mock("@services/auth/confirmation.service");
jest.mock("@services/auth/token.service");


beforeAll(() => {
    app.listen(5558);
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
        const response = await request(app)
            .post("/api/auth/sendResetCode")
            .send(data);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
        });
    });
    it("should signup be unsuccessfully", async () => {
        (sendCode as jest.Mock).mockRejectedValueOnce(new HttpError("Error in sending code", 500));
        const response = await request(app)
            .post("/api/auth/sendResetCode")
            .send(data);
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
        password: '123456789',
        confirmPassword: '123456789',
        code: '123456',
    };

    beforeEach(() => {
        (validateResetCode as jest.Mock).mockReturnValue(undefined);
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
        const response = await request(app)
            .post("/api/auth/resetPassword")
            .send(data);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                userName: user.userName,
                email: user.email,
            },
            userToken: "token",
        });
    });
    it("should signup be unsuccessfully", async () => {
        (updatePassword as jest.Mock).mockRejectedValueOnce(new HttpError("Error in updating password", 500));
        const response = await request(app)
            .post("/api/auth/resetPassword")
            .send(data);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in updating password",
            stack: undefined,
        });
    });
});