import { User } from "@prisma/client";
import db from "src/prisma/PrismaClient";
import bcrypt from "bcrypt";

const findUser = async (email: string, password: string): Promise<void> => {
    const found_user: User | null = await db.user.findUnique({
        where: { email },
    });
    if (found_user && found_user.emailStatus === "Activated") {
        throw new Error("Email is already found");
    }
};

const upsertUser = async (
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    verification_code: string
): Promise<void> => {
    await db.user.upsert({
        where: { email },
        update: {
            name,
            phoneNumber,
            password: bcrypt.hashSync(password, 10),
            verficationCode: {
                update: {
                    code: verification_code,
                },
            },
        },
        create: {
            name,
            email,
            phoneNumber,
            password: bcrypt.hashSync(password, 10),
            verficationCode: {
                create: {
                    code: verification_code,
                },
            },
        },
    });
};

export { findUser, upsertUser };
