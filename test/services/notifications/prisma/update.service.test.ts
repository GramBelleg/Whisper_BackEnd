import { updateFCMToken } from '@src/services/notifications/prisma/update.service';
import HttpError from '@src/errors/HttpError';
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import db from "@src/prisma/PrismaClient";

describe("test update FCM token prisma query", () => {
    it("should update FCM token successfully", async () => {
        const user = await createRandomUser();
        await db.userToken.create({
            data: {
                userId: user.id,
                token: "token",
                deviceToken: "oldToken",
                expireAt: new Date(),
            },
        });
        const oldToken = await db.userToken.findUnique({
            where: {
                userId_token: {
                    userId: user.id,
                    token: "token",
                },
            },
        });
        await updateFCMToken(user.id, "token", "newToken");
        const newToken = await db.userToken.findUnique({
            where: {
                userId_token: {
                    userId: user.id,
                    token: "token",
                },
            },
        });
        expect(oldToken?.deviceToken).toEqual("oldToken");
        expect(newToken?.deviceToken).toEqual("newToken");
        expect(newToken?.deviceToken).not.toEqual(oldToken?.deviceToken);
    });

    it("should throw an error if updating the FCM token fails", async () => {
        const user = await createRandomUser();
        await expect(updateFCMToken(user.id, "token", "newToken")).rejects.toThrow(new HttpError("FCM token updating failed", 409));
    });
});