import request from "supertest";
import { app, closeApp } from "@src/app";
import { createUserKey } from "@services/chat/encryption.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@middlewares/auth.middleware";
import db from "@DB";

jest.mock("@src/middlewares/auth.middleware");

describe("Key Management Handlers", () => {
    afterAll(async () => {
        await db.$disconnect();
        await closeApp();
    });

    it("should create a key and return its ID", async () => {
        const user = await createRandomUser();
        const key = "test-encryption-key";

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).post("/api/encrypt/").send({ key });

        expect(response.status).toBe(200);
        expect(typeof response.body).toBe("number");
    });

    it("should retrieve a key by its ID", async () => {
        const user = await createRandomUser();
        const key = "test-encryption-key";
        const keyId = await createUserKey(user.id, key);

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/?keyId=${keyId}`).send();

        expect(response.status).toBe(200);
        expect(response.body).toBe(key);
    });

    it("should return 400 for an invalid keyId when retrieving a key", async () => {
        const user = await createRandomUser();

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/?keyId=invalid`).send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid keyId");
    });

    it("should return 403 if a user doesn't own this key", async () => {
        const user = await createRandomUser();

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/?keyId=9999`).send();

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "User does not own this key");
    });


    it("should associate a participant key with a chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const key = "test-encryption-key";
        const keyId = await createUserKey(user1.id, key);

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/encrypt/${chat.chatId}?keyId=${keyId}`).send();

        expect(response.status).toBe(200);
        expect(response.body).toBe("Key associated successfully");
    });

    it("should return 400 for an invalid keyId when associating a key", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/encrypt/${chat.chatId}?keyId=invalid`).send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid keyId");
    });

    it("should retrieve another participant's key", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const key = "test-encryption-key";

        const result = await db.publicKey.create({
            data: {
                userId: user2.id,
                key,
            },
        });
        const keyId = result.id;

        await db.chatParticipant.update({
            where: {
                chatId_userId: { chatId: chat.chatId, userId: user2.id },
            },
            data: {
                keyId,
            },
        });

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/${chat.chatId}`).send();

        expect(response.status).toBe(200);
        expect(response.body).toBe(key);
    });

    it("should return 404 if another participant's key does not exist", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/${chat.chatId}`).send();

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Key not found");
    });
    it("should return 403 if user is not in the chat when associating a key", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");
        const key = "test-encryption-key";
        const keyId = await createUserKey(user1.id, key);

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).put(`/api/encrypt/${chat.chatId}?keyId=${keyId}`).send();

        expect(response.status).toBe(403);
    });
    it("should return 404 if chat does not exist when associating a key", async () => {
        const user = await createRandomUser();
        const key = "test-encryption-key";
        const keyId = await createUserKey(user.id, key);

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).put(`/api/encrypt/9999?keyId=${keyId}`).send();

        expect(response.status).toBe(404);
    });
    it("should return 403 if user is not in the chat when retrieving another participant's key", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/${chat.chatId}`).send();

        expect(response.status).toBe(403);
    });
    it("should return 404 if chat does not exist when retrieving another participant's key", async () => {
        const user = await createRandomUser();

        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user.id;
            next();
        });

        const response = await request(app).get(`/api/encrypt/9999`).send();

        expect(response.status).toBe(404);
    });
});
