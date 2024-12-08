import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("draftMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should format drafted message for a user in a chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const time = new Date();
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.id,
                    userId: user1.id,
                },
            },
            data: {
                draftContent: "Hello",
                draftParentMessageId: null,
                draftTime: time,
            },
        });

        const draftedMessage = await chatService.formatDraftedMessage(user1.id, chat.id);

        expect(draftedMessage).toEqual({
            draftContent: "Hello",
            draftParentMessageId: null,
            draftTime: time,
            parentMessage: null,
        });
    });

    it("should return empty drafted if no drafted message exists for a user in a chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const draftedMessage = await chatService.formatDraftedMessage(user1.id, chat.id);

        expect(draftedMessage).toEqual({
            draftContent: "",
            draftParentMessageId: null,
            draftTime: null,
            parentMessage: null,
        });
    });
});
