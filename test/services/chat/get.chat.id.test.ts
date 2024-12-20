import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("getChatId", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch the chat ID for a specific combination of users", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                content: "Hello",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });

        const chatId = await chatService.getChatId(message.id);
        expect(chatId).toBe(chat.chatId);
    });

    it("should return null if no chat exists for the given message", async () => {
        const messageId = 99999;
        const chatId = await chatService.getChatId(messageId);
        expect(chatId).toBeNull();
    });
});
