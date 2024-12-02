import { findBlockedUsers, findUsersByIds } from "@src/services/user/prisma/find.service";
import db from "@src/prisma/PrismaClient";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import { User } from "@prisma/client";

describe("test find blocked users prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should find blocked users successfully", async () => {
        const mainUser = await createRandomUser();
        const userIds: number[] = [];
        for (let i = 0; i < 6; i++) {
            const user: User = await createRandomUser();
            userIds.push(user.id);
        }
        await db.relates.createMany({
            data: userIds.slice(0, 3).map((userId) => {
                return {
                    relatingId: mainUser.id,
                    relatedById: userId,
                    isBlocked: true,
                    isContact: true,
                };
            }),
        });
        await db.relates.createMany({
            data: userIds.slice(3).map((userId) => {
                return {
                    relatingId: mainUser.id,
                    relatedById: userId,
                    isBlocked: false,
                    isContact: true,
                };
            }),
        });

        const blockedUsers = await findBlockedUsers(mainUser.id);
        blockedUsers.forEach((user) => {
            expect(userIds.slice(0, 3)).toContain(user.id);
        });
    });

    it("should find no blocked users successfully", async () => {
        const mainUser = await createRandomUser();
        const relatedUser = await createRandomUser();
        await db.relates.create({
            data: {
                relatingId: mainUser.id,
                relatedById: relatedUser.id,
                isBlocked: false,
                isContact: true,
            },
        });
        const blockedUsers = await findBlockedUsers(mainUser.id);
        expect(blockedUsers.map((user) => user.id)).toEqual([]);
    });
});

describe("test find users by ids prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should find users by ids successfully", async () => {
        const userIds: number[] = [];
        for (let i = 0; i < 6; i++) {
            const user: User = await createRandomUser();
            userIds.push(user.id);
        }
        const users = await findUsersByIds(userIds);
        users.forEach((user) => {
            expect(userIds).toContain(user.id);
        });
    });

    it("should find no users by ids successfully", async () => {
        const userIds: number[] = [];
        for (let i = 0; i < 6; i++) {
            const user: User = await createRandomUser();
            userIds.push(user.id);
        }
        const users = await findUsersByIds([]);
        expect(users.map((user) => user.id)).toEqual([]);
    });
});
