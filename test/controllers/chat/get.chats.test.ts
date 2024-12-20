import request from "supertest";
import { app, closeApp } from "@src/app";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import * as authMiddleware from "@src/middlewares/auth.middleware";
import { User } from "@prisma/client";
import db from "@DB";

jest.mock("@src/middlewares/auth.middleware");

describe("handleGetAllChats", () => {
    let user1: User,
        user2: User,
        chat: {
            chatId: number;
            participants: {
                id: number;
                userId: number;
            }[];
        };

    beforeEach(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        jest.spyOn(authMiddleware, "default").mockImplementation(async (req, _res, next) => {
            req.userId = user1.id;
            next();
        });
    });

    afterAll(async () => {
        await closeApp();
        await db.$disconnect();
    });

    it("should return chats for a user with no filters", async () => {
        const response = await request(app).get("/api/chats").send();
        expect(response.status).toBe(200);
    });

    it("should handle usersOnly query parameter", async () => {
        const response = await request(app).get("/api/chats?usersOnly=true").send();
        expect(response.status).toBe(200);
    });

    it("should handle noKey query parameter as number", async () => {
        const response = await request(app).get("/api/chats?noKey=1").send();
        expect(response.status).toBe(200);
    });

    it("should handle unblockedOnly query parameter", async () => {
        const response = await request(app).get("/api/chats?unblockedOnly=false").send();
        expect(response.status).toBe(200);
    });

    it("should default to unblockedOnly true when not provided", async () => {
        const response = await request(app).get("/api/chats").send();
        expect(response.status).toBe(200);
    });

    it("should return empty array if no chats are found", async () => {
        await db.message.deleteMany();
        await db.chatParticipant.deleteMany();
        await db.chat.deleteMany();
        const response = await request(app).get("/api/chats").send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});
