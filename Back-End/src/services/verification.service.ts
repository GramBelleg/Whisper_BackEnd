import db from "src/prisma/PrismaClient";
import { User, Verification } from "@prisma/client";

const findUser = async (email: string) => {
    const found_user: User | null = await db.user.findUnique({
        where: { email },
    });
    if (!found_user) {
        throw new Error("Email is not found");
    }
};

const findVerifiedUser = async (email: string, code: string) => {
    const data: Verification | null = await db.verification.findUnique({
        where: {
            code,
            user: {
                is: {
                    email,
                },
            },
        },
    });
    if (!data) {
        throw new Error("Invalid code");
    }
    let expire_date: Date = new Date();
    expire_date.setDate(expire_date.getDate() - 1);
    if (expire_date > data.created_at) {
        throw new Error("Expried code");
    }
};

const updateUser = async (email: string, code: string) => {
    await db.user.update({
        where: { email },
        data: {
            verfication_code: {
                upsert: {
                    update: { code },
                    create: { code },
                },
            },
        },
    });
};

const updateVerifiedUser = async (email: string) => {
    await db.user.update({
        where: { email },
        data: { email_status: "Activated" },
    });
};

export { findUser, updateUser, findVerifiedUser, updateVerifiedUser };
