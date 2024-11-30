import request from "supertest";
import app from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

describe("User Info Controller", () => {
    let user: User;
    beforeAll(async () => {
        user = await db.user.findUnique({ where: { id: 1 } }) as User;
    });

    afterAll(async () => {
        await db.$disconnect();
    });

    describe("GET /user/info", () => {
        it("should return user info", async () => {

            const response = await request(app).get("/api/user/info");
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                name: user.name,
                userName: user.userName,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic,
                lastSeen: user.lastSeen.toISOString(),
                status: user.status,
                phoneNumber: user.phoneNumber,
                autoDownloadSize: user.autoDownloadSize,
                readReceipts: user.readReceipts,
                storyPrivacy: user.storyPrivacy,
                pfpPrivacy: user.pfpPrivacy,
                lastSeenPrivacy: user.lastSeenPrivacy,
            });
        });
    });
});