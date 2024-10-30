import db from "@DB";
import redis from "@src/redis/redis.client";
import Randomstring from "randomstring";
import transporter from "@config/email.config";
import RedisOperation from "@src/@types/redis.operation";
import { User } from "@prisma/client";
import HttpError from "@src/errors/HttpError";

// Check if there is a data for this email (signup data) in redis for new account
const getCachedUser = async (email: string) => {
    const foundUser = await redis.hgetall(`${RedisOperation.AddNewUser}:${email}`);
    if (Object.keys(foundUser).length === 0) {
        throw new HttpError("Invalid Code", 410);
    }
    return foundUser;
};

async function createCode(email: string, operation: RedisOperation) {
    const firstCode: string = Randomstring.generate(8);
    const code = firstCode.replace(/[Il]/g, "s");
    const expireAt = new Date(Date.now() + 300000).toString(); // after 5 minutes

    await redis.hmset(`${operation}:${code}`, { email, expireAt });
    await redis.expire(`${operation}:${code}`, 600); // expire in 10 minutes
    return code;
}

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
    // check if the code exists and is related to this email and not expired
    const foundEmail = await redis.hgetall(`${operation}:${code}`);
    if (Object.keys(foundEmail).length === 0 || foundEmail.email !== email) {
        throw new Error("Invalid code");
    }
    if (new Date() > new Date(foundEmail.expireAt)) {
        throw new Error("Expired code");
    }
};

const addUser = async (email: string) => {
    const foundUser = await getCachedUser(email);
    const userData = {
        name: foundUser.name,
        userName: foundUser.userName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        password: foundUser.password,
    };
    const user: User = await db.user.create({
        data: { ...userData },
    });
    return user;
};

const getTimeToLive = async (email: string) => {
    const ttl = await redis.ttl(`${RedisOperation.AddNewUser}:${email}`);
    return ttl;
};

export { getCachedUser, createCode, sendCode, verifyCode, addUser, getTimeToLive };
