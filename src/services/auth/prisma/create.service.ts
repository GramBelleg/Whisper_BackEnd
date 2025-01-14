import db from "@DB";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import HttpError from "@src/errors/HttpError";
import { UserInfo } from "@models/user.models";

// common function to create a random user for only testing (not need to test this function)
async function createRandomUser() {
    try {
        const newUser: User = await db.user.create({
            data: {
                email: faker.internet.email().toLowerCase(),
                userName: faker.internet.username().toLowerCase(),
                name: faker.person.fullName().toLowerCase(),
                password: bcrypt.hashSync("123456789", 10),
                bio: faker.lorem.sentence(),
                phoneNumber: faker.phone.number({ style: "international" }),
            },
        });
        return newUser;
    } catch (err: any) {
        console.error(err);
        throw new HttpError("Random user creation failed", 409);
    }
}

async function createUserToken(token: string, expireAt: Date, userId: number) {
    try {
        await db.userToken.create({
            data: {
                token: token,
                expireAt: expireAt,
                userId: userId,
            },
        });
    } catch (err: any) {
        throw new HttpError("User token creation failed", 409);
    }
}
const addUser = async (cachedUser: UserInfo) => {
    const user: User = await db.user.create({
        data: { ...cachedUser },
    });
    return user;
};

export { createRandomUser, createUserToken, addUser };
