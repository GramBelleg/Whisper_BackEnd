import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("getChatSummaries", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch summaries for all chats for a user", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();

        const chat1 = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const chat2 = await createChat([user1.id, user3.id], user1.id, null, "DM");

        const summaries = await chatService.getChatsSummaries(user1.id, null, false);

        expect(summaries).toHaveLength(2);
        expect(summaries).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: chat1.chatId, type: "DM" }),
                expect.objectContaining({ id: chat2.chatId, type: "DM" }),
            ])
        );

        const summaries2 = await chatService.getChatsSummaries(user1.id, "DM", true);
        expect(summaries2).toHaveLength(2);
        expect(summaries2).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: chat1.chatId, type: "DM" }),
                expect.objectContaining({ id: chat2.chatId, type: "DM" }),
            ])
        );

        const summaries3 = await chatService.getChatsSummaries(user1.id, "DM", false);
        expect(summaries3).toHaveLength(2);
        expect(summaries3).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: chat1.chatId, type: "DM" }),
                expect.objectContaining({ id: chat2.chatId, type: "DM" }),
            ])
        );
    });

    it("should fetch chat summary for a user", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const summary = await chatService.getChatSummary(
            { chatId: chat.chatId, unreadMessageCount: 0, chat: { type: "DM" } },
            user1.id
        );

        expect(summary).toHaveProperty("id", chat.chatId);
        expect(summary).toHaveProperty("type", "DM");
    });

    it("should return null if there is no such chat or user", async () => {
        const summary = await chatService.getChatSummary(
            { chatId: 999, unreadMessageCount: 0, chat: { type: "DM" } },
            999
        );

        expect(summary).toBeNull();
    });

});
