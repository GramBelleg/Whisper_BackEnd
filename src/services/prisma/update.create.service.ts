import db from "@DB";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import HttpError from "@src/errors/HttpError";


const upsertUser = async (data: Record<string, any>): Promise<User> => {
    try {
        const userData: {
            userName: string;
            email: string;
            password: string;
        } = {
            userName: data.userName,
            email: data.email,
            password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
        };
        // update in case user already exists and just login
        // create in case user does not exist and login
        const user: User = await db.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                ...userData,
            },
        });
        return user;
    } catch (err: any) {
        console.log(err.message);
        throw new HttpError("User upsert failed", 409);
    }
};


export { upsertUser };