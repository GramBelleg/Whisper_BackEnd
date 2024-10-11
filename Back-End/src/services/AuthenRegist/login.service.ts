import { User } from "@prisma/client";
import db from "src/prisma/PrismaClient";
import bcrypt from "bcrypt";

const findUser = async (email: string, password: string): Promise<User> => {
    const user: User | null = await db.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Email doesn't exist");
    }
    if (!bcrypt.compareSync(password, user.password)) {
        throw new Error("Incorrect password. Try again");
    }
    if (user.emailStatus !== "Activated") {
        throw new Error("Email is not verified");
    }
    return user;
};

export default findUser;
