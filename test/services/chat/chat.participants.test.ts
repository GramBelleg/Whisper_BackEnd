import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("chatParticipants", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

     it("should fetch chat members for a given chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const members = await chatService.getChatMembers(chat.chatId);

        expect(members).toHaveLength(2);
        expect(members).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: user1.id }),
                expect.objectContaining({ id: user2.id }),
            ])
        );
    });

    it("should get other user ID in a chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const otherUserId = await chatService.getOtherUserId(user1.id, chat.chatId);

        expect(otherUserId).toBe(user2.id);
    });

    it("should create chat participants", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const participants = await db.chatParticipant.findMany({
            where: { chatId: chat.chatId },
        });

        expect(participants).toHaveLength(2);
    });

});
