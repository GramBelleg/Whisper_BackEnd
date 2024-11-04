import bcrypt from "bcrypt";
import { findUserByEmail } from "@services/auth/prisma/find.service";
import HttpError from "@src/errors/HttpError";

async function checkEmailExistDB(email: string) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new HttpError("User Email doesn't exist", 404);
    }
    return user;
}

function checkPasswordCorrect(password: string, hashedPassword: string) {
    if (!bcrypt.compareSync(password, hashedPassword)) {
        throw new Error("Incorrect password. Try again");
    }
}

export { checkEmailExistDB, checkPasswordCorrect };
