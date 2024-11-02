import db from "@DB";
import bcrypt from "bcrypt";
import HttpError from "@src/errors/HttpError";

async function updatePassword(email: string, password: string) {
    try {
        const user = await db.user.update({
            where: { email },
            data: {
                password: bcrypt.hashSync(password, 10),
            },
        });
        return user;
    } catch {
        throw new HttpError("Password updating failed", 409);
    }
}

export { updatePassword };