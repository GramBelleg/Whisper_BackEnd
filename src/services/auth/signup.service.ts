import { User } from "@prisma/client";
import db from "@DB";
import axios from "axios";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const findEmail = async (email: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { email },
        select: { email: true },
    });
    return user ? user.email : null;
};

const findUserName = async (userName: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { userName },
        select: { userName: true },
    });
    return user ? user.userName : null;
};

const findPhoneNumber = async (phoneNumber: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { phoneNumber },
        select: { phoneNumber: true },
    });
    return user ? user.phoneNumber : null;
};

async function verifyRobotToken(robotToken: string) {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET}&response=${robotToken}`;
    const response = await axios.post(verificationURL);
    if (!response || !response.data.success) {
        throw new Error("Invalid robot token");
    }
}

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

export { verifyRobotToken, upsertUser, findEmail, findUserName, findPhoneNumber };
