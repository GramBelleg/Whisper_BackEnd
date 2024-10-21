import db from "@DB";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

async function updatePassword(email: string, password: string) {
    const user: User | null = await db.user.update({
        where: { email },
        data: {
            password: bcrypt.hashSync(password, 10),
            loggedInDevices: 0,
        },
    });
    return user;
}
export { updatePassword };
