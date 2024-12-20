import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("setNewLastMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should replace the last message for a chat participant", async () => {
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
        const messageStatus = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });

        await chatService.setNewLastMessage(chat.chatId);

        const participant = await db.chatParticipant.findFirst({
            where: { chatId: chat.chatId, userId: user1.id },
            select: { lastMessageId: true },
        });

        expect(participant?.lastMessageId).toBe(messageStatus.id);
    });
});
