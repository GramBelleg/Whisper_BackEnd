import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import db from "@DB";

jest.mock("@src/middlewares/auth.middleware");

describe("POST /messages/:chatId/draftMessage and PUT undraftMessage", () => {
    afterAll(async () => {
        await closeApp();
    });

    it("should draft a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: time };
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app)
            .post(`/api/messages/${chat.id}/draftMessage`)
            .send(draft);

        expect(response.status).toBe(200);
        const result = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId: chat.id,
                    userId: user1.id,
                },
            },
            select: {
                draftContent: true,
                draftParentMessageId: true,
                draftTime: true,
            },
        });
        expect(result).toEqual(draft);
    });

    it("should undraft a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/messages/${chat.id}/undraftMessage`);

        expect(response.status).toBe(200);
        const result = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId: chat.id,
                    userId: user1.id,
                },
            },
            select: {
                draftContent: true,
                draftParentMessageId: true,
                draftTime: true,
            },
        });
        expect(result).toEqual({ draftContent: "", draftParentMessageId: null, draftTime: null });
    });

    it("should get drafted message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: time };
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.id,
                    userId: user1.id,
                },
            },
            data: { ...draft },
        });
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/messages/${chat.id}/draftMessage`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            draftContent: draft.draftContent,
            draftParentMessageId: draft.draftParentMessageId,
            draftTime: draft.draftTime.toISOString(),
            parentMessage: null,
        });
    });
    it("should return 404 if no drafted message found", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/messages/${chat.id}/draftMessage`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "No drafted message found" });
    });

    it("should return 403 if user is not in the chat when drafting a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: new Date() };
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app)
            .post(`/api/messages/${chat.id}/draftMessage`)
            .send(draft);

        expect(response.status).toBe(403);
    });

    it("should return 403 if user is not in the chat when undrafting a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/messages/${chat.id}/undraftMessage`);

        expect(response.status).toBe(403);
    });

    it("should return 404 if chat does not exist when drafting a message", async () => {
        const user1 = await createRandomUser();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: new Date() };
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).post(`/api/messages/9999/draftMessage`).send(draft);

        expect(response.status).toBe(404);
    });

    it("should return 403 if user is not in the chat when getting a drafted message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/messages/${chat.id}/draftMessage`);

        expect(response.status).toBe(403);
    });

    it("should return 404 if chat does not exist when getting a drafted message", async () => {
        const user1 = await createRandomUser();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: new Date() };
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/messages/9999/draftMessage`).send(draft);

        expect(response.status).toBe(404);
    });

    it("should return 404 if chat does not exist when undrafting a message", async () => {
        const user1 = await createRandomUser();
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/messages/9999/undraftMessage`);

        expect(response.status).toBe(404);
    });
});
