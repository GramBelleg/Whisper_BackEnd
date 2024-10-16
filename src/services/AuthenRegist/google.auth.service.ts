import { User } from "@prisma/client";
import db from "@DB";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const getUserData = async (token: string | undefined): Promise<Record<string, any>> => {
    if (!token) {
        throw new Error("There is no token");
    }

    const response: Response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    const data: Record<string, any> = await response.json();
    if (!data || !data.email_verified || data.error) {
        throw new Error("Invalid token");
    }
    return data;
};

const upsertUser = async (data: Record<string, any>): Promise<User> => {
    const userData: {
        name: string;
        email: string;
        password: string;
    } = {
        name: data.name,
        email: data.email,
        password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
    };
    // update in case user is already existed and just login
    // create in case user is not existed and login
    const user: User = await db.user.upsert({
        where: { email: userData.email },
        update: { loggedInDevices: { increment: 1 } },
        create: {
            ...userData,
            loggedInDevices: 1
        },
    });
    return user;
};

export { getUserData, upsertUser };

