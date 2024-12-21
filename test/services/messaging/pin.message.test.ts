import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, User } from "@prisma/client";
import db from "@DB";
import { getPinnedMessages, pinMessage, unpinMessage } from "@services/chat/message.service";

describe("pinMessage", () => {
    let user1: User,
        user2: User,
        chat: {
            id: number;
            participants: {
                id: number;
                userId: number;
            }[];
        },
        message: Message;

    beforeEach(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
    });

    afterAll(async () => {
        await db.$disconnect();
    });

    it("should retrieve pinned messages", async () => {
        await db.message.update({
            where: { id: message.id },
            data: {
                pinned: true,
            },
        });
        const pinnedMessages = await getPinnedMessages(chat.id);
        expect(pinnedMessages).toEqual([{ id: message.id, content: message.content }]);
    });
    it("should pin a message successfully", async () => {
        const pinnedMessage = await pinMessage(message.id);
        expect(pinnedMessage).toHaveProperty("id", message.id);
        const pinned = await db.message.findUnique({
            where: {
                id: message.id,
            },
        });
        expect(pinned).toHaveProperty("pinned", true);
    });
    it("should unpin a message successfully", async () => {
        const unpinnedMessage = await unpinMessage(message.id);
        expect(unpinnedMessage).toHaveProperty("id", message.id);
        const unpinned = await db.message.findUnique({
            where: {
                id: message.id,
            },
        });
        expect(unpinned).toHaveProperty("pinned", false);
    });
});
