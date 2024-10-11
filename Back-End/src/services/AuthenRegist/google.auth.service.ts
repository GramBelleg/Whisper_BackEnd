import { User } from "@prisma/client";
import db from "src/prisma/PrismaClient";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

//This is a service for making a request to get user data of google account based on specified scopes using google tokenThis is a service for making a request to get user data of google account based on specified scopes using google token
const getUserData = async (token: string): Promise<Record<string, any> | undefined> => {
    try {
        const response: Response = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
        );
        const data: Record<string, any> = await response.json();
        return data;
    } catch (err: any) {
        console.log(err.message);
        return undefined;
    }
};

const upsertUser = async (data: Record<string, any>): Promise<User> => {
    const userData: {
        name: string;
        email: string;
        phoneNumber: string;
        password: string;
        emailStatus: string;
    } = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number,
        password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
        emailStatus: "Activated",
    };

    const user: User = await db.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
    });
    return user;
};

export { getUserData, upsertUser };
