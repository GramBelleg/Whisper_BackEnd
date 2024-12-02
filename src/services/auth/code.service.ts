import RedisOperation from "@src/@types/redis.operation";
import { cacheData, getCachedData, setExpiration } from "./redis.service";
import transporter from "@config/email.config";
import HttpError from "@src/errors/HttpError";
import Randomstring from "randomstring";

export const createCode = async (email: string, operation: RedisOperation, expiresIn: number) => {
    const firstCode: string = Randomstring.generate(8);
    const code = firstCode.replace(/[Il]/g, "s");

    await cacheData(operation, code, { email });
    await setExpiration(operation, code, expiresIn);
    return code;
};

export async function sendCode(email: string, emailSubject: string, emailBody: string) {
    const info = await transporter.sendMail({
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: emailSubject,
        html: emailBody,
    });
    if (!info) {
        throw new HttpError("Failed to send code to email");
    }
}

export const verifyCode = async (email: string, code: string, operation: RedisOperation) => {
    const foundEmail = await getCachedData(operation, code);
    if (Object.keys(foundEmail).length === 0 || foundEmail.email !== email) {
        throw new Error("Invalid code");
    }
};
