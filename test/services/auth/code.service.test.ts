import RedisOperation from "@src/@types/redis.operation";
import { cacheData, getCachedData, setExpiration } from "@src/services/auth/redis.service";
import transporter from "@config/email.config";
import HttpError from "@src/errors/HttpError";
import { createCode, sendCode, verifyCode } from "@src/services/auth/code.service";
import Randomstring from "randomstring";
import { faker } from "@faker-js/faker";

jest.mock("@config/email.config");
jest.mock("@src/services/auth/redis.service");

describe("test createCode function", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a code", async () => {
        const email = faker.internet.email();
        const operation = RedisOperation.ConfirmEmail;
        const expiresIn = 60;
        (cacheData as jest.Mock).mockResolvedValueOnce(undefined);
        (setExpiration as jest.Mock).mockResolvedValueOnce(undefined);

        const code = await createCode(email, operation, expiresIn);
        expect(code).toBeDefined();
        expect(code.length).toBe(8);
        expect(cacheData).toHaveBeenCalledWith(operation, code, { email });
        expect(setExpiration).toHaveBeenCalledWith(operation, code, expiresIn);
    });

    it("should throw an error", async () => {
        const email = faker.internet.email();
        const operation = RedisOperation.ConfirmEmail;
        const expiresIn = 60;
        (cacheData as jest.Mock).mockRejectedValueOnce(new Error("Failed to cache data"));
        await expect(createCode(email, operation, expiresIn)).rejects.toThrow(new Error("Failed to cache data"));
        expect(cacheData).toHaveBeenCalledWith(operation, expect.any(String), { email });
        expect(setExpiration).not.toHaveBeenCalled();
    });
});

describe("test sendCode function", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send a code", async () => {
        const email = faker.internet.email();
        const emailSubject = faker.lorem.sentence();
        const emailBody = faker.lorem.paragraph();
        (transporter.sendMail as jest.Mock).mockResolvedValueOnce({});

        await sendCode(email, emailSubject, emailBody);
        expect(transporter.sendMail).toHaveBeenCalledWith({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: emailSubject,
            html: emailBody,
        });
    });

    it("should throw an error", async () => {
        const email = faker.internet.email();
        const emailSubject = faker.lorem.sentence();
        const emailBody = faker.lorem.paragraph();
        (transporter.sendMail as jest.Mock).mockRejectedValueOnce(new Error("Failed to send email"));

        await expect(sendCode(email, emailSubject, emailBody)).rejects.toThrow(new HttpError("Failed to send email"));
        expect(transporter.sendMail).toHaveBeenCalledWith({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: emailSubject,
            html: emailBody,
        });
    });

    it("should throw an error", async () => {
        const email = faker.internet.email();
        const emailSubject = faker.lorem.sentence();
        const emailBody = faker.lorem.paragraph();
        (transporter.sendMail as jest.Mock).mockResolvedValueOnce(undefined);

        await expect(sendCode(email, emailSubject, emailBody)).rejects.toThrow(new HttpError("Failed to send code to email"));
        expect(transporter.sendMail).toHaveBeenCalledWith({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: emailSubject,
            html: emailBody,
        });
    });
});

describe("test verifyCode function", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should verify the code", async () => {
        const email = faker.internet.email();
        const code = Randomstring.generate(8);
        const operation = RedisOperation.ConfirmEmail;
        (getCachedData as jest.Mock).mockResolvedValueOnce({ email });

        await verifyCode(email, code, operation);
        expect(getCachedData).toHaveBeenCalledWith(operation, code);
    });

    it("should throw an error", async () => {
        const email = faker.internet.email();
        const code = Randomstring.generate(8);
        const operation = RedisOperation.ConfirmEmail;
        (getCachedData as jest.Mock).mockResolvedValueOnce({});

        await expect(verifyCode(email, code, operation)).rejects.toThrow(new Error("Invalid code"));
        expect(getCachedData).toHaveBeenCalledWith(operation, code);
    });

    it("should throw an error", async () => {
        const email = faker.internet.email();
        const code = Randomstring.generate(8);
        const operation = RedisOperation.ConfirmEmail;
        (getCachedData as jest.Mock).mockResolvedValueOnce({ email: faker.internet.email() });

        await expect(verifyCode(email, code, operation)).rejects.toThrow(new Error("Invalid code"));
        expect(getCachedData).toHaveBeenCalledWith(operation, code);
    });
});