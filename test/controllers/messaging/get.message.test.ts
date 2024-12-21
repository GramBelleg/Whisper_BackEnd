import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import db from "@DB";

jest.mock("@src/middlewares/auth.middleware");

describe("getMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
        await closeApp();
    });
    describe("GET /messages/:chatId", () => {
        it("should return messages for a valid chat ID", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const message1 = await db.message.create({
                data: {
                    chatId: chat.id,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            await db.messageStatus.create({
                data: {
                    messageId: message1.id,
                    userId: user1.id,
                    time: new Date(),
                },
            });
            await db.messageStatus.create({
                data: {
                    messageId: message1.id,
                    userId: user2.id,
                    time: new Date(),
                },
            });
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });
            const response = await request(app).get(`/api/messages/${chat.id}`);
            expect(response.status).toBe(200);
            expect(response.body.messages[0]).toHaveProperty("id", message1.id);
        });
        it("should return 404 for an invalid chat ID", async () => {
            const user1 = await createRandomUser();
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });
            const response = await request(app).get(`/api/messages/99999`);
            expect(response.status).toBe(404);
        });
    });
    describe("GET /messages/:messageId/getMessage", () => {
        it("should return a message for a valid message ID", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const message1 = await db.message.create({
                data: {
                    chatId: chat.id,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            await db.messageStatus.create({
                data: {
                    messageId: message1.id,
                    userId: user1.id,
                    time: new Date(),
                },
            });
            await db.messageStatus.create({
                data: {
                    messageId: message1.id,
                    userId: user2.id,
                    time: new Date(),
                },
            });
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user2.id;
                next();
            });
            const response = await request(app).get(`/api/messages/${message1.id}/getMessage`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", message1.id);
        });
        it("should return 404 for an invalid message ID", async () => {
            const user1 = await createRandomUser();
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });
            const response = await request(app).get(`/api/messages/99999/getMessage`);
            expect(response.status).toBe(404);
        });
    });
    describe("GET /messages/:chatId/lastMessage", () => {
        it("should return the last message for a valid chat ID", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const message = await db.message.create({
                data: {
                    chatId: chat.id,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            const messageStatus = await db.messageStatus.create({
                data: {
                    messageId: message.id,
                    userId: user1.id,
                    time: new Date(),
                },
            });
            await db.chatParticipant.update({
                where: { chatId_userId: { chatId: chat.id, userId: user1.id } },
                data: { lastMessageId: messageStatus.id },
            });
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });
            const response = await request(app).get(`/api/messages/${chat.id}/lastMessage`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", message.id);
        });
        it("should return 404 for an invalid chat ID", async () => {
            const user1 = await createRandomUser();
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });
            const response = await request(app).get(`/api/messages/99999/lastMessage`);
            expect(response.status).toBe(404);
        });
    });
});
