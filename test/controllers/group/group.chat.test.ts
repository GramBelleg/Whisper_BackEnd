import request from "supertest";
import { app, closeApp } from "@src/app";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import { ChatType } from "@prisma/client";
import { createGroup } from "@services/chat/group.service";

jest.mock("@src/middlewares/auth.middleware");
const createChat = async () => {
    const user1 = await createRandomUser();
    const user2 = await createRandomUser();
    const users = [user1, user2];
    const chatType: ChatType = "GROUP";
    const createdChat = {
        users: [users[0].id, users[1].id],
        senderKey: null,
        type: chatType,
        name: "group name",
        picture: "picture",
    };
    const chat = await chatService.createChat([users[0].id, users[1].id], user1.id, null, chatType);
    await createGroup(chat.id, chat.participants, createdChat, user1.id);
    return { chat, createdChat, users };
};
describe("Set size limit", () => {
    afterAll(async () => {
        await closeApp();
    });

    it("should set size limit of a group", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const { chat, createdChat } = await createChat();

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
