import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, User } from "@prisma/client";
import db from "@DB";
import { saveMessage, saveMessageStatuses } from "@services/chat/message.service";

describe("saveMessage", () => {
    let user1: User,
        user2: User,
        chat: {
            chatId: number;
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
                chatId: chat.chatId,
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

    it("should save message statuses", async () => {
        await saveMessageStatuses(user1.id, message, [user1.id, user2.id]);
        const statuses = await db.messageStatus.findMany({
            where: { messageId: message.id },
        });
        expect(statuses).toHaveLength(2);
    });

    it("should save message", async () => {
        const message = await saveMessage(user1.id, {
            chatId: chat.chatId,
            content: "Hello @user2",
            type: "TEXT",
            key: null,
            senderId: user1.id,
            sentAt: new Date(),
        });
        expect(message).toBeDefined();
    });
});
