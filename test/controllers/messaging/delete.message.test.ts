import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import db from "@DB";
import deleteMessagesForAllUsers from "@controllers/messages/delete.message";

jest.mock("@src/middlewares/auth.middleware");

describe("deleteMessages", () => {
    afterAll(async () => {
        await closeApp();
    });

    jest.mock("@src/middlewares/auth.middleware");

    describe("DELETE /messages/:chatId/deleteForMe", () => {
        afterAll(async () => {
            await db.$disconnect();
            await closeApp();
        });

        it("should delete messages for the current user", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();

            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const chatId = chat.chatId;
            const message1 = await db.message.create({
                data: {
                    chatId,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            const message2 = await db.message.create({
                data: {
                    chatId,
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

            const response = await request(app)
                .delete(`/api/messages/${chatId}/deleteForMe`)
                .query({ Ids: JSON.stringify([message1.id, message2.id]) });

            expect(response.status).toBe(200);
            expect(
                await db.messageStatus.findUnique({
                    where: { messageId_userId: { messageId: message1.id, userId: user1.id } },
                })
            ).toHaveProperty("deleted", true);
        });

        it("should return 400 if Ids query parameter is missing", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();

            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const chatId = chat.chatId;

            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });

            const response = await request(app).delete(`/api/messages/${chatId}/deleteForMe`);

            expect(response.status).toBe(400);
        });

        it("should return 404 if chatId is invalid", async () => {
            const user1 = await createRandomUser();

            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });

            const response = await request(app)
                .delete(`/api/messages/999/deleteForMe`)
                .query({ Ids: JSON.stringify([1, 2, 3]) });

            expect(response.status).toBe(404);
        });
        it("should return 403 if user is not authorized", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();

            const chat = await createChat([user1.id], user1.id, null, "DM");
            const chatId = chat.chatId;
            const message1 = await db.message.create({
                data: {
                    chatId,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            const message2 = await db.message.create({
                data: {
                    chatId,
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

            const response = await request(app)
                .delete(`/api/messages/${chatId}/deleteForMe`)
                .query({ Ids: JSON.stringify([message1.id, message2.id]) });

            expect(response.status).toBe(403);
            expect(
                await db.messageStatus.findUnique({
                    where: { messageId_userId: { messageId: message1.id, userId: user1.id } },
                })
            ).toHaveProperty("deleted", false);
        });
    });
    it("should delete messages for all users", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.chatId;
        const message1 = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const message2 = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await deleteMessagesForAllUsers([message1.id, message2.id], chatId);
        expect(await db.message.findUnique({ where: { id: message1.id } })).toBeNull();
    });
});
