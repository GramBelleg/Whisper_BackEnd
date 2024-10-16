import { User } from "@prisma/client";
import db from "src/prisma/PrismaClient";
import axios from 'axios';
import redis from '@redis';
import bcrypt from "bcrypt";

const checkEmailNotExist = async (email: string): Promise<void> => {
    const foundUser: User | null = await db.user.findUnique({
        where: { email },
    });
    if (foundUser) {
        throw new Error("Email is already found in DB");
    }
};

async function verifyRobotToken(robotToken: string) {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET}&response=${robotToken}`
    const response = await axios.post(verificationURL);
    if (!response || !response.data.success) {
        throw new Error('Invalid robot token');
    }
}

const saveUser = async (
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
): Promise<void> => {
    await redis.hSet(email, { name, email, phoneNumber, password: bcrypt.hashSync(password, 10) });
    await redis.expire(email, 10800); // expire in 3 hours
};

export { checkEmailNotExist, verifyRobotToken, saveUser };
