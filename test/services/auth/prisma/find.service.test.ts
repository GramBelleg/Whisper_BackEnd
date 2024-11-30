import {
    findUserByEmail,
    findUserByPhoneNumber,
    findUserByUserName,
    findTokenByUserIdToken,
} from "@src/services/auth/prisma/find.service";
import { createRandomUser, createUserToken } from "@src/services/auth/prisma/create.service";
import { User } from "@prisma/client";

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
        const foundUser = await findUserByEmail(newUser.email);
        expect(foundUser?.email).toEqual(newUser.email);
    });
    it("should find user using his email but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUser = await findUserByEmail("a" + newUser.email);
        expect(foundUser).toEqual(null);
    });
});

describe("test find user name prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his user name and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUserID = await findUserByUserName(newUser.userName);
        expect(foundUserID).toEqual(newUser.id);
    });
    it("should find user using his user name but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUser = await findUserByUserName("a" + newUser.userName);
        expect(foundUser).toEqual(null);
    });
});

describe("test find phone number prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using his phone number and be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUser = await findUserByPhoneNumber(newUser.phoneNumber as string);
        expect(foundUser).toEqual(newUser.phoneNumber);
    });
    it("should find user using his phone number but not be existed", async () => {
        const newUser: User = await createRandomUser();
        const foundUser = await findUserByPhoneNumber((newUser.phoneNumber as string) + "5");
        expect(foundUser).toEqual(null);
    });
});

describe("test find user by user token prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should find user using the token and be existed", async () => {
        const newUser: User = await createRandomUser();
        await createUserToken("tokenC", new Date(), newUser.id);
        const foundUser = await findTokenByUserIdToken(newUser.id, "tokenC");
        expect(foundUser?.userId).toEqual(newUser.id);
        expect(foundUser?.token).toEqual("tokenC");
    });
    it("should find user using the token but not be existed", async () => {
        const newUser: User = await createRandomUser();
        await createUserToken("tokenC", new Date(), newUser.id);
        const foundUser = await findTokenByUserIdToken(newUser.id, "tokenD");
        expect(foundUser).toEqual(null);
    });
});
