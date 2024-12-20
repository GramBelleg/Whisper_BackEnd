import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("muteChat", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should mute a chat for a user", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        await chatService.muteChat(chat.chatId, user1.id);

        const participant = await db.chatParticipant.findFirst({
            where: { chatId: chat.chatId, userId: user1.id },
            select: { isMuted: true },
        });

        expect(participant?.isMuted).toBe(true);
    });

    it("should unmute a chat for a user", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        await chatService.muteChat(chat.chatId, user1.id);
        await chatService.unmuteChat(chat.chatId, user1.id);

        const participant = await db.chatParticipant.findFirst({
            where: { chatId: chat.chatId, userId: user1.id },
            select: { isMuted: true },
        });

        expect(participant?.isMuted).toBe(false);
    });
});
