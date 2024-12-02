import { createRelates } from "@src/services/user/prisma/create.service";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";

describe("test create relates prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });

    it("should create relates successfully", async () => {
        const mainUser = await createRandomUser();
        const userIds: number[] = [];
        for (let i = 0; i < 6; i++) {
            const user: User = await createRandomUser();
            userIds.push(user.id);
        }
        await createRelates(mainUser.id, userIds.slice(0, 3), true, true);
        await createRelates(mainUser.id, userIds.slice(3), false, true);
        const blockedUsers = await db.user.findMany({
            where: {
                relatedBy: {
                    some: {
                        relatingId: mainUser.id,
                        isBlocked: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        const unBlockedUsers = await db.user.findMany({
            where: {
                relatedBy: {
                    some: {
                        relatingId: mainUser.id,
                        isBlocked: false,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        blockedUsers.forEach((user) => {
            expect(userIds.slice(0, 3)).toContain(user.id);
        });
        unBlockedUsers.forEach((user) => {
            expect(userIds.slice(3)).toContain(user.id);
        });
    });

    it("should create relates successfully and ignore duplicates", async () => {
        const mainUser = await createRandomUser();
        const relatedUser = await createRandomUser();
        await createRelates(mainUser.id, [relatedUser.id], true, true);
        await createRelates(mainUser.id, [relatedUser.id], true, true);
        const blockedUsers = await db.user.findMany({
            where: {
                relatedBy: {
                    some: {
                        relatingId: mainUser.id,
                        isBlocked: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        blockedUsers.forEach((user) => {
            expect(relatedUser.id).toBe(user.id);
        });
    });
});
