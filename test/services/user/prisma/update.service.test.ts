import { updateBlockOfRelates, updateReadReceipt } from "@services/user/prisma/update.service";
import db from "@DB";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import HttpError from "@src/errors/HttpError";

describe("test update block of relates prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should update relates successfully", async () => {
        const mainUser = await createRandomUser();
        const userIds: number[] = [];
        for (let i = 0; i < 6; i++) {
            const user = await createRandomUser();
            userIds.push(user.id);
        }
        await db.relates.createMany({
            data: userIds.slice(0, 3).map((userId) => {
                return {
                    relatingId: mainUser.id,
                    relatedById: userId,
                    isBlocked: false,
                    isContact: true,
                };
            }),
        });
        await db.relates.createMany({
            data: userIds.slice(3).map((userId) => {
                return {
                    relatingId: mainUser.id,
                    relatedById: userId,
                    isBlocked: true,
                    isContact: true,
                };
            }),
        });
        const oldRelates = await db.relates.findMany({
            where: {
                relatingId: mainUser.id,
                relatedById: {
                    in: userIds,
                },
            },
        });
        oldRelates.forEach((relate) => {
            if (relate.relatedById in userIds.slice(0, 3)) {
                expect(relate.isBlocked).toBe(false);
            }
        });
        oldRelates.forEach((relate) => {
            if (relate.relatedById in userIds.slice(3)) {
                expect(relate.isBlocked).toBe(true);
            }
        });
        await updateBlockOfRelates(mainUser.id, userIds.slice(0, 3), true);
        await updateBlockOfRelates(mainUser.id, userIds.slice(3), false);
        const updatedRelates = await db.relates.findMany({
            where: {
                relatingId: mainUser.id,
                relatedById: {
                    in: userIds,
                },
            },
        });
        updatedRelates.forEach((relate) => {
            if (relate.relatedById in userIds.slice(0, 3)) {
                expect(relate.isBlocked).toBe(true);
            }
        });
        updatedRelates.forEach((relate) => {
            if (relate.relatedById in userIds.slice(3)) {
                expect(relate.isBlocked).toBe(false);
            }
        });
    });

    it("should throw error while updating relates", async () => {
        const mainUser = await createRandomUser();
        try {
            await updateBlockOfRelates(mainUser.id, [mainUser.id - 1, mainUser.id - 2], true);
        } catch (err: any) {
            expect(err).toBeInstanceOf(new HttpError("User relating updating failed", 409));
        }
    });
});

describe("test update read receipt prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should update read receipt successfully", async () => {
        const user = await createRandomUser();
        expect(user.readReceipts).toBe(true);
        await updateReadReceipt(user.id, false);
        const updatedUser = await db.user.findUnique({
            where: { id: user.id },
        });
        expect(updatedUser?.readReceipts).toBe(false);
    });

    it("should throw error while updating read receipt", async () => {
        const user = await createRandomUser();
        try {
            await updateReadReceipt(100 * user.id, false);
        } catch (err: any) {
            expect(err.message).toEqual("Read receipts updating failed");
        }
    });
});
