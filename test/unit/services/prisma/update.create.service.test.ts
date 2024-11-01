import { createRandomUser } from "@src/services/prisma/create.service";
import { faker } from "@faker-js/faker";
import { User } from "@prisma/client";
import db from "@src/prisma/PrismaClient";
import { upsertUser } from "@src/services/prisma/update.create.service";

// afterEach(async () => {
//     await db.user.deleteMany({});
// });

// afterAll(async () => {
//     await db.$disconnect();
// });

describe("test upsert user prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should create a new user", async () => {
        const newUser: User = await upsertUser({
            userName: faker.internet.username(),
            email: faker.internet.email(),
        });
        const foundUser = await db.user.findUnique({
            where: { email: newUser.email },
        }) as User;
        expect(foundUser.userName).toEqual(newUser.userName);
        expect(foundUser.email).toEqual(newUser.email);
    });
    it("should not update an existed user", async () => {
        const newUser: User = await createRandomUser();
        const updatedUser: User = await upsertUser({
            userName: faker.internet.username(),
            email: newUser.email,
        });
        const foundUser = await db.user.findUnique({
            where: { email: updatedUser.email },
        }) as User;
        // console.log(newUser, updatedUser, foundUser);
        expect(foundUser.userName).toEqual(newUser.userName);
        expect(foundUser.email).toEqual(newUser.email);
        expect(foundUser.phoneNumber).toEqual(newUser.phoneNumber);
        expect(foundUser.name).toEqual(newUser.name);
    });
    it("should throw an error if user upsert failed", async () => {
        const newUser1: User = await createRandomUser();
        const newUser2: User = await createRandomUser();
        try {
            await upsertUser({
                userName: newUser2.userName,
                email: newUser1.email,
            });
        } catch (err: any) {
            expect(err.message).toEqual("User upsert failed");
        }
    });
});