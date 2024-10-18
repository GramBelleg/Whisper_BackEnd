import { User } from "@prisma/client";
import db from "@DB";
import axios from "axios";
import redis from "@redis/index";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import RedisOperation from "src/@types/redis.operation";

const checkEmailNotExist = async (email: string): Promise<void> => {
    const foundUser: User | null = await db.user.findUnique({
        where: { email },
    });
    if (foundUser) {
        throw new Error("Email is already found in DB");
    }
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
    password: string,
): Promise<void> => {
    await redis.hSet(RedisOperation.AddNewUser + ":" + email, { name, userName, email, phoneNumber, password: bcrypt.hashSync(password, 10) });
    await redis.expire(RedisOperation.AddNewUser + ":" + email, 10800); // expire in 3 hours
};

const upsertUser = async (data: Record<string, any>): Promise<User> => {
    const userData: {
        name: string;
        email: string;
        password: string;
    } = {
        name: data.name,
        email: data.email,
        password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
    };
    // update in case user is already existed and just login
    // create in case user is not existed and login
    const user: User = await db.user.upsert({
        where: { email: userData.email },
        update: { loggedInDevices: { increment: 1 } },
        create: {
            ...userData,
            loggedInDevices: 1,
        },
    });
    return user;
};

export { checkEmailNotExist, verifyRobotToken, saveUserData, upsertUser };
