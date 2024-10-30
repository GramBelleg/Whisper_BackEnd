import db from "@DB";
import redis from "@src/redis/redis.client";
import Randomstring from "randomstring";
import transporter from "@config/email.config";
import RedisOperation from "@src/@types/redis.operation";
import { User } from "@prisma/client";
import HttpError from "@src/errors/HttpError";
import { UserInfo } from "@models/user.models";

const setExpiration = async (operation: RedisOperation, key: string) => {
    await redis.expire(`${operation}:${key}`, 600); // expire in 10 minutes
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

const createCode = async (user: UserInfo, operation: RedisOperation) => {
    const firstCode: string = Randomstring.generate(8);
    const code = firstCode.replace(/[Il]/g, "s");
    const expireAt = new Date(Date.now() + 300000).toString(); // after 5 minutes

    await cacheData(operation, code, { ...user, expireAt });
    await setExpiration(operation, code);
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
    const userExpiration = await getCachedData(operation, code);
    if (Object.keys(userExpiration).length === 0 || userExpiration.email !== email) {
        throw new Error("Invalid code");
    }
    if (new Date() > new Date(userExpiration.expireAt)) {
        throw new Error("Expired code");
    }
    const { expireAt, ...user } = userExpiration;
    return user as UserInfo;
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
