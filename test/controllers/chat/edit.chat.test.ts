import request from "supertest";
import { app, closeApp } from "@src/app";
import { createChat } from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";

jest.mock("@src/middlewares/auth.middleware");

describe("Chat Mute and Unmute Handlers", () => {
    afterAll(async () => {
        await closeApp();
    });

    it("should mute the chat successfully without a duration", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).post(`/api/chats/${chat.id}/muteChat`).send();

        expect(response.status).toBe(200);
    });

    it("should mute the chat successfully with a duration", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const duration = 1;
        const response = await request(app)
            .post(`/api/chats/${chat.id}/muteChat`)
            .send({ duration });

        expect(response.status).toBe(200);
        expect(response.body.Message).toBeUndefined();
    });

    it("should unmute the chat successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).post(`/api/chats/${chat.id}/unmuteChat`).send();

        expect(response.status).toBe(200);
        expect(response.body.Message).toBeUndefined();
    });

    it("should return 403 if the user is unauthorized to mute/unmute the chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user3.id;
            next();
        });

        const response = await request(app).post(`/api/chats/${chat.id}/muteChat`).send();

        expect(response.status).toBe(403);
        expect(response.body.Message).toBeUndefined();
    });

    it("should return 403 if the user is unauthorized to mute/unmute the chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user3.id;
            next();
        });

        const response = await request(app).post(`/api/chats/${chat.id}/unmuteChat`).send();

        expect(response.status).toBe(403);
        expect(response.body.Message).toBeUndefined();
    });
});
