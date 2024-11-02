import bcrypt from "bcrypt";
import { findUserByEmail } from "@services/prisma/auth/find.service";


async function checkEmailExistDB(email: string) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error("Email is not existed in DB");
    }
    return user;
}

function checkPasswordCorrect(password: string, hashedPassword: string) {
    if (!bcrypt.compareSync(password, hashedPassword)) {
        throw new Error("Incorrect password. Try again");
    }
}

export { checkEmailExistDB, checkPasswordCorrect };
