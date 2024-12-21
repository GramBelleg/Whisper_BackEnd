import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import db from "@DB";
import handleEditContent, {
    handleDeliverAllMessages,
    handleDeliverMessage,
    handlePinMessage,
    handleReadAllMessages,
    handleReadMessages,
    handleUnpinMessage,
} from "@controllers/messages/edit.message";

jest.mock("@src/middlewares/auth.middleware");

describe("editMessage", () => {
    afterAll(async () => {
        await closeApp();
        await db.$disconnect();
    });

    describe("GET messages/:messageId/getMessageStatus", () => {
        it("should successfully return delivered and read users", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();

            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const chatId = chat.id;
            const message = await db.message.create({
                data: {
                    chatId,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });
            const ms = await db.messageStatus.create({
                data: {
                    messageId: message.id,
                    userId: user2.id,
                    time: new Date(),
                    delivered: new Date(),
                },
            });
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });

            const response = await request(app).get(`/api/messages/${message.id}/getMessageStatus`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                deliveredUsers: [
                    {
                        user: {
                            id: user2.id,
                            userName: user2.userName,
                            profilePic: user2.profilePic,
                        },
                        delivered: ms.delivered?.toISOString(),
                    },
                ],
                readUsers: [],
            });
        });
        it("should return 404 not found if message doesn't exist", async () => {
            const user1 = await createRandomUser();
            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user1.id;
                next();
            });

            const response = await request(app).get(`/api/messages/999999/getMessageStatus`);

            expect(response.status).toBe(404);
        });
        it("should return 403 if user can't access this message", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const user3 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const chatId = chat.id;
            const message = await db.message.create({
                data: {
                    chatId,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });

            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user3.id;
                next();
            });

            const response = await request(app).get(`/api/messages/${message.id}/getMessageStatus`);

            expect(response.status).toBe(403);
        });
        it("should return 403 if user is not the sender", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
            const chatId = chat.id;
            const message = await db.message.create({
                data: {
                    chatId,
                    senderId: user1.id,
                    content: "Hello",
                    sentAt: new Date(),
                    type: "TEXT",
                },
            });

            jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
                req.userId = user2.id;
                next();
            });

            const response = await request(app).get(`/api/messages/${message.id}/getMessageStatus`);

            expect(response.status).toBe(403);
        });
    });
    it("should edit content message successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;
        const message = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await handleEditContent(user1.id, message.id, "Hello, edited");
        expect(await db.message.findUnique({ where: { id: message.id } })).toHaveProperty(
            "content",
            "Hello, edited"
        );
    });
    it("should throw and error if message doesn't exist", async () => {
        const user1 = await createRandomUser();
        await expect(handleEditContent(user1.id, 9999999, "Hello, edited")).rejects.toThrow();
    });
    it("should throw an error if editting user is not the sender", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;
        const message = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await expect(handleEditContent(user2.id, message.id, "Hello, edited")).rejects.toThrow();
    });
    it("should pin message successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;
        const message = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await handlePinMessage(user1.id, message.id);
        expect(await db.message.findUnique({ where: { id: message.id } })).toHaveProperty(
            "pinned",
            true
        );
    });
    it("should unpin message successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chatId = chat.id;
        const message = await db.message.create({
            data: {
                chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                pinned: true,
                type: "TEXT",
            },
        });
        await handleUnpinMessage(user1.id, message.id);
        expect(await db.message.findUnique({ where: { id: message.id } })).toHaveProperty(
            "pinned",
            false
        );
    });
    it("should throw an error if pin message doesn't exist", async () => {
        const user1 = await createRandomUser();
        await expect(handlePinMessage(user1.id, 9999999)).rejects.toThrow();
    });
    it("should throw an error if unpin message doesn't exist", async () => {
        const user1 = await createRandomUser();
        await expect(handleUnpinMessage(user1.id, 9999999)).rejects.toThrow();
    });
    it("should deliver all messages for a user", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const ms = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
        await handleDeliverAllMessages(user2.id);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: ms.id },
            select: { delivered: true },
        });
        expect(getDelivered).toHaveProperty("delivered");
        expect(deliveredMessage).toEqual({ delivered: true });
    });
    it("should deliver a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const ms = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        await handleDeliverMessage(user1.id, message.id);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: ms.id },
            select: { delivered: true },
        });
        expect(getDelivered).toHaveProperty("delivered");
        expect(deliveredMessage).toEqual({ delivered: true });
    });
    it("should throw an error if message doesn't exist", async () => {
        const user1 = await createRandomUser();
        await expect(handleDeliverMessage(user1.id, 9999999)).rejects.toThrow();
    });
    it("should read messages successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const ms = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
        await handleReadMessages(user2.id, [message.id], chat.id);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        const getRead = await db.messageStatus.findUnique({
            where: { id: ms.id },
            select: { read: true },
        });
        expect(getRead).toHaveProperty("read");
        expect(readMessage).toEqual({ read: true });
    });
    it("should read all messages in a chat successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const ms = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
        await handleReadAllMessages(user2.id, chat.id);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        const getRead = await db.messageStatus.findUnique({
            where: { id: ms.id },
            select: { read: true },
        });
        expect(getRead).toHaveProperty("read");
        expect(readMessage).toEqual({ read: true });
    });
    it("should throw an error if user isn't in the read chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user2.id, null, "DM");
        await expect(handleReadAllMessages(user3.id, chat.id)).rejects.toThrow();
    });
});
