import { User } from "@prisma/client";
import db from "@DB";
import bcrypt from "bcrypt";


async function checkEmailExist(email: string) {
    const user = await db.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error('Email is not existed in DB');
    }
    return user;
}

async function checkPasswordCorrect(password: string, hashedPassword: string) {
    if (!bcrypt.compareSync(password, hashedPassword)) {
        throw new Error("Incorrect password. Try again");
    }
}


async function incrementUserDevices(userId: number) {
    await db.user.update({
        where: { id: userId },
        data: {
            loggedInDevices: { increment: 1 }
        }
    });
}

export { checkEmailExist, checkPasswordCorrect, incrementUserDevices };
