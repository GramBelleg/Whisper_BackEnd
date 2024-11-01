import { deleteUserToken, deleteAllUserTokens, deleteExpiredTokens } from "@src/services/prisma/delete.service";
import { createRandomUser, createUserToken } from "@src/services/prisma/create.service";
import { findUserByUserToken } from "@src/services/prisma/find.service";
import db from "@src/prisma/PrismaClient";

// afterEach(async () => {
//     await db.user.deleteMany({});
// });

// afterAll(async () => {
//     await db.$disconnect();
// });

describe("test delete user token prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should delete user token successfully", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token", new Date(), newUser.id);
        await deleteUserToken(newUser.id, "token");
        const foundUser = await findUserByUserToken(newUser.id, "token");
        const foundToken = await db.userToken.findFirst({
            where: {
                userId: newUser.id,
                token: "token",
            },
        });
        expect(foundUser).toEqual(null);
        expect(foundToken).toEqual(null);
    });
    it("should deletion user token be unsuccessful as userId is wrong", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token", new Date(), newUser.id);
        try {
            await deleteUserToken(10 * newUser.id, "token");
        } catch (err: any) {
            expect(err.message).toEqual("Error in deleting token as user id or token is wrong");
        }
    });
    it("should deletion user token be unsuccessful as token is wrong", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token", new Date(), newUser.id);
        try {
            await deleteUserToken(newUser.id, "tokken");
        } catch (err: any) {
            expect(err.message).toEqual("Error in deleting token as user id or token is wrong");
        }
    });
});

describe("test delete all user tokens of a user prisma query", () => {
    // afterEach(async () => {
    //     await db.user.deleteMany({});
    // });
    it("should delete all user tokens of a user successfully", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token1", new Date(), newUser.id);
        await createUserToken("token2", new Date(), newUser.id);
        await createUserToken("token3", new Date(), newUser.id);
        await deleteAllUserTokens(newUser.id);
        const foundUser = await db.user.findUnique({
            where: { id: newUser.id },
            include: { tokens: true }
        });
        const foundToken1 = await db.userToken.findFirst({
            where: {
                userId: newUser.id,
                token: "token1",
            },
        });
        const foundToken2 = await db.userToken.findFirst({
            where: {
                userId: newUser.id,
                token: "token2",
            },
        });
        const foundToken3 = await db.userToken.findFirst({
            where: {
                userId: newUser.id,
                token: "token3",
            },
        });
        expect(foundUser?.tokens.length).toEqual(0);
        expect(foundToken1).toEqual(null);
        expect(foundToken2).toEqual(null);
        expect(foundToken3).toEqual(null);
    });
    it("should deletion all user tokens be unsuccessful as userId is wrong", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token1", new Date(), newUser.id);
        await createUserToken("token2", new Date(), newUser.id);
        await createUserToken("token3", new Date(), newUser.id);
        try {
            await deleteAllUserTokens(10 * newUser.id);
        } catch (err: any) {
            expect(err.message).toEqual("Error in deleting all tokens of user as user id is wrong");
        }
    });
});


describe("test delete expired tokens prisma query", () => {
    it("should delete expired tokens successfully", async () => {
        const newUser1 = await createRandomUser();
        const newUser2 = await createRandomUser();
        await createUserToken("token1", new Date(Date.now() - 1000), newUser1.id);
        await createUserToken("token2", new Date(Date.now() - 1000), newUser2.id);
        await createUserToken("token3", new Date(Date.now() - 1000), newUser2.id);
        await deleteExpiredTokens();
        const foundUser1 = await findUserByUserToken(newUser1.id, "token1");
        const foundUser2 = await findUserByUserToken(newUser2.id, "token2");
        const foundUser3 = await findUserByUserToken(newUser2.id, "token3");
        expect(foundUser1).toEqual(null);
        expect(foundUser2).toEqual(null);
        expect(foundUser3).toEqual(null);
    });
    it("should delete expired tokens be unsuccessful", async () => {
        const newUser = await createRandomUser();
        await createUserToken("token1", new Date(Date.now() + 10000), newUser.id);
        await createUserToken("token2", new Date(Date.now() + 10000), newUser.id);
        await createUserToken("token3", new Date(Date.now() + 10000), newUser.id);
        await deleteExpiredTokens();
        const foundUser1 = await findUserByUserToken(newUser.id, "token1");
        const foundUser2 = await findUserByUserToken(newUser.id, "token2");
        const foundUser3 = await findUserByUserToken(newUser.id, "token3");
        expect(foundUser1?.id).toEqual(newUser.id);
        expect(foundUser2?.id).toEqual(newUser.id);
        expect(foundUser3?.id).toEqual(newUser.id);
        expect(foundUser1?.email).toEqual(newUser.email);
        expect(foundUser2?.email).toEqual(newUser.email);
        expect(foundUser3?.email).toEqual(newUser.email);
    });
});
