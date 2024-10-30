import db from "@DB";
import bcrypt from "bcrypt";


async function checkEmailExistDB(email: string) {
    const user = await db.user.findUnique({
        where: { email },
    });
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
