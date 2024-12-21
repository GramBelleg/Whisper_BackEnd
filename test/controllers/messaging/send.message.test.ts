import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import db from "@DB";
import { handleSend } from "@controllers/messages/send.message";
import { closeApp } from "@src/app";

describe("sendMessage", () => {
    afterAll(async () => {
        await closeApp();
        await db.$disconnect();
    });

    it("should send a message successfully", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await handleSend(user1.id, {
            content: "Hello",
            type: "TEXT",
            chatId: chat.id,
            senderId: user1.id,
            key: null,
            sentAt: new Date(),
            expiresAfter: 5,
        });
        expect(message![0]).toHaveProperty("id");
    });

    it("should send a message successfully given only expires after", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await handleSend(user1.id, {
            content: "Hello",
            type: "TEXT",
            chatId: chat.id,
            senderId: user1.id,
            key: null,
            sentAt: new Date(),
            expiresAfter: 5,
        });
        expect(message![0]).toHaveProperty("id");
    });

    it("should throw an error when a user not in the chat tries to send a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        await expect(
            handleSend(user3.id, {
                content: "Hello",
                type: "TEXT",
                chatId: chat.id,
                senderId: user1.id,
                key: null,
                sentAt: new Date(),
            })
        ).rejects.toThrow();
    });
});
