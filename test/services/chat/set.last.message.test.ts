import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("setLastMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should update the last message for a chat participant", async () => {
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
        const messageStatus1 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const messageStatus2 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });

        await chatService.setLastMessage(chat.chatId, message.id);

        const participant1 = await db.chatParticipant.findFirst({
            where: { chatId: chat.chatId, userId: user1.id },
            select: { lastMessageId: true },
        });

        const participant2 = await db.chatParticipant.findFirst({
            where: { chatId: chat.chatId, userId: user2.id },
            select: { lastMessageId: true },
        });

        expect(participant1?.lastMessageId).toBe(messageStatus1.id);
        expect(participant2?.lastMessageId).toBe(messageStatus2.id);

        const lastMessage = await chatService.getLastMessage(user1.id, chat.chatId);
        expect(lastMessage?.id).toBe(message.id);
        expect(lastMessage?.id).toBe(message.id);
    });

    it("should return undefined if no message exists", async () => {
        const invalidChatId = 9999;
        const invalidMessageId = 9999;

        const result = await chatService.setLastMessage(invalidChatId, invalidMessageId);

        expect(result).toBeUndefined();
    });
});
