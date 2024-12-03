import { deleteExtraRelates } from "@services/user/prisma/delete.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import db from "@DB";

describe("test deleteExtraRelates prisma query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should deleteExtraRelates successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        await db.relates.create({
            data: {
                relatingId: user1.id,
                relatedById: user2.id,
                isContact: false,
                isBlocked: false,
            },
        });
        const relates = await db.relates.findMany({
            where: {
                isContact: false,
                isBlocked: false,
            },
        });
        expect(relates.length).toBe(1);
        await deleteExtraRelates();
        const relatesAfterDeletion = await db.relates.findMany({
            where: {
                isContact: false,
                isBlocked: false,
            },
        });
        expect(relatesAfterDeletion.length).toBe(0);
    });

    it("should not deleteExtraRelates if no relates found", async () => {
        const relates = await db.relates.findMany({
            where: {
                isContact: false,
                isBlocked: false,
            },
        });
        expect(relates.length).toBe(0);
        await deleteExtraRelates();
        const relatesAfterDeletion = await db.relates.findMany({
            where: {
                isContact: false,
                isBlocked: false,
            },
        });
        expect(relatesAfterDeletion.length).toBe(0);
    });
});
