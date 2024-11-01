import { findEmail, findPhoneNumber, findUserName, findUserByUserToken } from "@src/services/prisma/find.service";
import { createRandomUser } from "@src/services/prisma/create.service";
import { User } from "@prisma/client";
import db from "@src/prisma/PrismaClient";

// afterEach(async () => {
//     await db.user.deleteMany({});
// });

// afterAll(async () => {
//     await db.$disconnect();
// });


describe("test find email prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his email and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundEmail = await findEmail(newUser.email);
        expect(foundEmail).toEqual(newUser.email);
    });
    it("should find user using his email but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundEmail = await findEmail('a' + newUser.email);
        expect(foundEmail).toEqual(null);
    });
});

describe("test find user name prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his user name and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUserName = await findUserName(newUser.userName);
        expect(foundUserName).toEqual(newUser.userName);
    });
    it("should find user using his user name but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUserName = await findUserName('a' + newUser.userName);
        expect(foundUserName).toEqual(null);
    });
});

describe("test find phone number prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his phone number and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundPhoneNumber = await findPhoneNumber(newUser.phoneNumber as string);
        expect(foundPhoneNumber).toEqual(newUser.phoneNumber);
    });
    it("should find user using his phone number but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundPhoneNumber = await findPhoneNumber(newUser.phoneNumber as string + '5');
        expect(foundPhoneNumber).toEqual(null);
    });
});

describe("test find user by user token prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his phone number and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundPhoneNumber = await findPhoneNumber(newUser.phoneNumber as string);
        expect(foundPhoneNumber).toEqual(newUser.phoneNumber);
    });
    it("should find user using his phone number but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundPhoneNumber = await findPhoneNumber(newUser.phoneNumber as string + '5');
        expect(foundPhoneNumber).toEqual(null);
    });
});
