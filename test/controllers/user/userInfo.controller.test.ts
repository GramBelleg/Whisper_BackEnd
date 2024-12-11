import request from "supertest";
import { app, closeApp } from "@src/app";
import { faker } from "@faker-js/faker";
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import * as userServices from "@services/user/user.service";

jest.mock("@services/user/user.service");

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

afterAll(async () => {
    await closeApp();
});

describe("User Info Controller", () => {

    describe("GET /user/info", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("should return user info", async () => {
            const user = await createRandomUser();
            (userServices.userInfo as jest.Mock).mockResolvedValue({
                name: user.name,
                userName: user.userName,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic,
                lastSeen: user.lastSeen,
                status: user.status,
                phoneNumber: user.phoneNumber,
                autoDownloadSize: user.autoDownloadSize,
                readReceipts: user.readReceipts,
                storyPrivacy: user.storyPrivacy,
                pfpPrivacy: user.pfpPrivacy,
                lastSeenPrivacy: user.lastSeenPrivacy,
            });
            
            const response = await request(app).get("/api/user/info");
            
            expect(userServices.userInfo).toHaveBeenCalled();
            expect(userServices.userInfo).toHaveBeenCalledWith(1);
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
