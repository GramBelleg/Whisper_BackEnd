import { createRandomUser, createUserToken, addUser } from "@src/services/auth/prisma/create.service";
import { faker } from "@faker-js/faker";
import db from "@src/prisma/PrismaClient";
import { UserInfo } from "@src/models/user.models";


// afterEach(async () => {
//     await db.user.deleteMany({});
// });

// afterAll(async () => {
//     await db.$disconnect();
// });

describe("test create user token prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should create user token successfully", async () => {
        const newUser = await createRandomUser();
        await createUserToken("tokenA", new Date(), newUser.id);
        const foundUser = await db.user.findUnique({
            where: {
                id: newUser.id,
            },
            include: {
                tokens: true,
            },
        });
        expect(foundUser?.tokens[0].token).toEqual("tokenA");
    });
    it("should creation user token be unsuccessful as there is Unique constraint", async () => {
        const newUser = await createRandomUser();
        await createUserToken("tokenB", new Date(), newUser.id);
        try {
            await createUserToken("tokenB", new Date(), newUser.id);
        } catch (err: any) {
            expect(err.message).toEqual("User token creation failed");
            expect(err.status).toEqual(409);
        }
    });
});

describe("test add user prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should add user successfully", async () => {
        const userData: UserInfo = {
            email: faker.internet.email().toLowerCase(),
            userName: faker.internet.username().toLowerCase(),
            name: faker.person.fullName().toLowerCase(),
            password: faker.internet.password(),
            phoneNumber: faker.phone.number({ style: "international" }),
        };
        const user = await addUser(userData);
        expect(user.email).toBeDefined();
        expect(user.userName).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.password).toBeDefined();
        expect(user.bio).toBeDefined();
        expect(user.phoneNumber).toBeDefined();
    });

    it("should add user be unsuccessful as there is Unique constraint", async () => {
        const userData: UserInfo = {
            email: faker.internet.email().toLowerCase(),
            userName: faker.internet.username().toLowerCase(),
            name: faker.person.fullName().toLowerCase(),
            password: faker.internet.password(),
            phoneNumber: faker.phone.number({ style: "international" }),
        };
        const user = await addUser(userData);
        await expect(addUser(userData)).rejects.toThrow();
    });
});
