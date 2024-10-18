import db from "src/prisma/PrismaClient";
import redis from "@redis/index";
import Randomstring from "randomstring";
import transporter from "@config/email.config";

const checkEmailExist = async (email: string) => {
    // Check if there is a data in redis for new account
    const foundUser = await redis.hGetAll(email);
    if (Object.keys(foundUser).length === 0) {
        throw new Error("Email is not found in redis");
    }
};

async function createCode(email: string, operation: string) {
    const code: string = Randomstring.generate(8);
    const expireAt = new Date(Date.now() + 300000).toString(); // after 5 minutes
    await redis.hSet(operation + ":" + code, { email, expireAt });
    await redis.expire(operation + ":" + code, 600); // expire in 10 minutes
    return code;
}

async function sendCode(email: string, emailBody: string) {
    const info = await transporter.sendMail({
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Email verfication",
        html: emailBody,
    });
    if (!info) {
        throw new Error("Error in sending email");
    }
}

const verifyCode = async (email: string, code: string, operation: string) => {
    // check if the code is exist and related to this email and not expired
    const foundEmail = await redis.hGetAll(operation + ":" + code);
    console.log(foundEmail);
    if (Object.keys(foundEmail).length === 0 || foundEmail.email !== email) {
        throw new Error("Invalid code");
    }
    if (new Date() > new Date(foundEmail.expireAt)) {
        throw new Error("Expried code");
    }
};

const confirmAddUser = async (email: string) => {
    const foundData = await redis.hGetAll(email);
    if (Object.keys(foundData).length === 0) {
        throw new Error(`User's data is not found in redis`);
    }
    const userData = {
        name: foundData.name,
        email: foundData.email,
        phoneNumber: foundData.phoneNumber,
        password: foundData.password,
    };
    await db.user.create({
        data: { ...userData },
    });
};

export { checkEmailExist, createCode, sendCode, verifyCode, confirmAddUser };