import { User } from "@prisma/client";
import db from "@DB";
import axios from "axios";
import redis from "@src/redis/redis.client";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import RedisOperation from "@src/@types/redis.operation";

const findUserByEmail = async (email: string): Promise<User | null> => {
    const user: User | null = await db.user.findUnique({
        where: { email },
    });
    return user;
};

async function verifyRobotToken(robotToken: string) {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET}&response=${robotToken}`;
    const response = await axios.post(verificationURL);
    if (!response || !response.data.success) {
        throw new Error("Invalid robot token");
    }
}

const saveUserData = async (
    name: string,
    userName: string,
    email: string,
    phoneNumber: string,
    password: string
): Promise<void> => {
    await redis.hmset(`${RedisOperation.AddNewUser}:${email}`, {
        name,
        userName,
        email,
        phoneNumber,
        password: bcrypt.hashSync(password, 10),
    });
    await redis.expire(`${RedisOperation.AddNewUser}:${email}`, 10800); // expire in 3 hours
};

const upsertUser = async (data: Record<string, any>): Promise<User> => {
    const userData: {
        userName: string;
        email: string;
        password: string;
    } = {
        userName: data.userName,
        email: data.email,
        password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
    };
    // update in case user already exists and just logs in
    // create in case user does not exist and logs in
    const user: User = await db.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
            ...userData,
        },
    });
    return user;
};

export { findUserByEmail, verifyRobotToken, saveUserData, upsertUser };
