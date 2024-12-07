import * as userServices from "@src/services/user/user.service";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import db from "@DB";
import HttpError from "@src/errors/HttpError";

describe("test change last seen privacy query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should change last seen privacy", async () => {
        const user = await createRandomUser();
        expect(user.lastSeenPrivacy).toEqual("Everyone");
        const privacy = "Nobody";
        await userServices.changeLastSeenPrivacy(user.id, privacy);
        const updatedUser = await db.user.findUnique({
            where: {
                id: user.id,
            },
        });
        expect(updatedUser?.lastSeenPrivacy).toBe(privacy);
    });

    it("should throw error if user not found", async () => {
        const privacy = "Nobody";
        await expect(userServices.changeLastSeenPrivacy(0, privacy)).rejects.toThrow(
            new HttpError("User not found", 404)
        );
    });
});

describe("test change pfp privacy query", () => {
    afterAll(async () => {
        await db.$disconnect();
    });
    it("should change pfp privacy", async () => {
        const user = await createRandomUser();
        expect(user.pfpPrivacy).toEqual("Everyone");
        const privacy = "Nobody";
        await userServices.changePfpPrivacy(user.id, privacy);
        const updatedUser = await db.user.findUnique({
            where: {
                id: user.id,
            },
        });
        expect(updatedUser?.pfpPrivacy).toBe(privacy);
    });

    it("should throw error if user not found", async () => {
        const privacy = "Nobody";
        await expect(userServices.changePfpPrivacy(0, privacy)).rejects.toThrow(
            new HttpError("User not found", 404)
        );
    });
});

describe("test change story privacy query", () => {
    it("should change story privacy", async () => {
        const user = await createRandomUser();
        expect(user.storyPrivacy).toEqual("Everyone");
        const privacy = "Contacts";
        await userServices.changeStoryPrivacy(user.id, privacy);
        const updatedUser = await db.user.findUnique({
            where: {
                id: user.id,
            },
        });
        expect(updatedUser?.storyPrivacy).toBe(privacy);
    });

    it("should throw error if user not found", async () => {
        const privacy = "Contacts";
        await expect(userServices.changeStoryPrivacy(0, privacy)).rejects.toThrow(
            new HttpError("User not found", 404)
        );
    });
});
