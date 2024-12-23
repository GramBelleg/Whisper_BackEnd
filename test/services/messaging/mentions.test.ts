import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { User } from "@prisma/client";
import db from "@DB";
import { getMentions } from "@services/chat/message.service";

describe("mentions", () => {
    let user1: User,
        user2: User,
        chat: {
            id: number;
            participants: {
                id: number;
                userId: number;
            }[];
        };

    beforeEach(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
    });

    afterAll(async () => {
        await db.$disconnect();
    });

    it("should return mentions for a valid message", async () => {
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                mentions: [user1.id],
            },
        });
        const mentions = await getMentions(message.id);
        expect(mentions).toEqual([user1.userName]);
    });

    it("should return null for a non-existent message", async () => {
        const mentions = await getMentions(99999);
        expect(mentions).toBeNull();
    });
});
