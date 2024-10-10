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
    const user_data: {
        name: string;
        email: string;
        phone_number: string,
        password: string;
        email_status: string;
    } = {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        password: bcrypt.hashSync(randomstring.generate({ length: 250 }), 10),
        email_status: "Activated",
    };

    const user: User = await db.user.upsert({
        where: { email: user_data.email },
        update: {},
        create: user_data,
    });
    return user;
};

export { getUserData, upsertUser };
