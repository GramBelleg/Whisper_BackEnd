import db from "@DB";
import bcrypt from "bcrypt";

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
        throw new Error("Error updating password");
    }
}

export { updatePassword };