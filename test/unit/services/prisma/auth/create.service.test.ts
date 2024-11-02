import { createRandomUser, createUserToken } from "@src/services/prisma/auth/create.service";
import db from "@src/prisma/PrismaClient";

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