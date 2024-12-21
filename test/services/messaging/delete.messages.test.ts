import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, User } from "@prisma/client";
import db from "@DB";
import { deleteMessagesForAll, deleteMessagesForUser } from "@services/chat/message.service";

describe("deleteMessages", () => {
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
        await db.message.deleteMany();
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

    it("should mark message as deleted for the user", async () => {
        const messageStatus = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        await deleteMessagesForUser(user1.id, [message.id]);
        const deletedMessage = await db.messageStatus.findUnique({
            where: { id: messageStatus.id },
            select: { deleted: true },
        });
        expect(deletedMessage).toEqual({ deleted: true });
    });

    it("should not delete non-existent messages for user", async () => {
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        await deleteMessagesForUser(user1.id, [9999999]);
        const deletedMessage = await db.messageStatus.findMany({
            where: { deleted: true },
        });
        expect(deletedMessage).toHaveLength(0);
    });

    it("should delete messages for all users", async () => {
        await deleteMessagesForAll([message.id]);
        expect(await db.message.findMany()).toHaveLength(0);
    });

    it("should not delete non-existent messages for all users", async () => {
        await deleteMessagesForAll([9999999]);
        const remaining = await db.message.findMany();
        expect(remaining).toHaveLength(1);
    });
});
