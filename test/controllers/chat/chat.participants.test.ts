import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";

jest.mock("@src/middlewares/auth.middleware");

describe("GET /chats/:chatId/getMembers Route", () => {
    afterAll(async () => {
        await closeApp();
    });

    it("should return the chat members successfully (200 OK)", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();

        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;

        const chatMembers = [
            {
                id: user1.id,
                userName: user1.userName,
                hasStory: user1.hasStory,
                lastSeen: user1.lastSeen.toISOString(),
                profilePic: user1.profilePic,
            },
            {
                id: user2.id,
                userName: user2.userName,
                hasStory: user2.hasStory,
                lastSeen: user2.lastSeen.toISOString(),
                profilePic: user2.profilePic,
            },
        ];

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/chats/${chatId}/getMembers`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(chatMembers);
    });

    it("should return 404 when the chat is not found", async () => {
        const nonExistentChatId = 999;

        const response = await request(app).get(`/api/chats/${nonExistentChatId}/getMembers`);

        expect(response.status).toBe(404);
    });

    it("should return 403 when the user is not a member of the chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();

        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user3.id;
            next();
        });

        const response = await request(app).get(`/api/chats/${chatId}/getMembers`);

        expect(response.status).toBe(403);
    });
});
