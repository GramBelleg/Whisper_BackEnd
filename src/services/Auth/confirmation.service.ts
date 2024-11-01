import db from "@DB";
import redis from "@src/redis/redis.client";
import Randomstring from "randomstring";
import transporter from "@config/email.config";
import RedisOperation from "@src/@types/redis.operation";
import { User } from "@prisma/client";
import HttpError from "@src/errors/HttpError";
import { UserInfo } from "@models/user.models";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const setExpiration = async (operation: RedisOperation, key: string, expiresIn: number) => {
    await redis.expire(`${operation}:${key}`, expiresIn); // expire in 10 minutes
};
const cacheData = async (operation: RedisOperation, key: string, data: any) => {
    await redis.hmset(`${operation}:${key}`, data);
};
const getExpiration = async (operation: RedisOperation, key: string) => {
    const ttl = await redis.ttl(`${operation}:${key}`);
    return ttl;
};
const getCachedData = async (operation: RedisOperation, key: string) => {
    const data = await redis.hgetall(`${operation}:${key}`);
    return data;
};

const createCode = async (email: string, operation: RedisOperation, expiresIn: number) => {
    const firstCode: string = Randomstring.generate(8);
    const code = firstCode.replace(/[Il]/g, "s");

    await cacheData(operation, code, { email });
    await setExpiration(operation, code, expiresIn);
    return code;
};

async function sendCode(email: string, emailSubject: string, emailBody: string) {
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

const verifyCode = async (email: string, code: string, operation: RedisOperation) => {
    const foundEmail = await redis.hgetall(`${operation}:${code}`);
    if (Object.keys(foundEmail).length === 0 || foundEmail.email !== email) {
        throw new Error("Invalid code");
    }
};

const addUser = async (cachedUser: UserInfo) => {
    const user: User = await db.user.create({
        data: { ...cachedUser },
    });
    return user;
};

export {
    createCode,
    sendCode,
    verifyCode,
    addUser,
    cacheData,
    setExpiration,
    getCachedData,
    getExpiration,
};
