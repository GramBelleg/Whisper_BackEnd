import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { clearDB } from "@src/prisma/clear";

describe("setNewLastMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(async () => {
        await clearDB();
        jest.restoreAllMocks();
    });

    it("should replace the last message for a chat participant", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello",
                senderId: user1.id,
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

        await chatService.setNewLastMessage(chat.id);

        const participant = await db.chatParticipant.findUnique({
            where: { chatId_userId: { chatId: chat.id, userId: user1.id } },
            select: { lastMessageId: true },
        });
        expect(null).toBe(null);
    });
});
