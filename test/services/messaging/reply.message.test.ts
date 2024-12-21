import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { User } from "@prisma/client";
import db from "@DB";
import {
    enrichMessageWithParentContent,
    getParentMessageContent,
} from "@services/chat/message.service";

describe("replyandParentMessage", () => {
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

    it("should retrieve parent message content correctly", async () => {
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                mentions: [user1.id],
                parentContent: "Parent content example",
                parentMedia: "Parent media example",
                parentExtension: "Parent extension example",
                parentType: "TEXT",
            },
        });
        const parentContent = await getParentMessageContent(message.id);
        expect(parentContent).toEqual({
            content: "Parent content example",
            media: "Parent media example",
            extension: "Parent extension example",
            type: "TEXT",
        });
    });

    it("should return null for non-existent message ID", async () => {
        const parentContent = await getParentMessageContent(99999999);
        expect(parentContent).toBeNull();
    });

    it("should enrich message with parent content correctly", async () => {
        const parentMessage = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                key: "someKey",
            },
        });
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                parentMessageId: parentMessage.id,
                key: "someKey",
            },
        });
        const result = await enrichMessageWithParentContent(message);
        expect(result).toHaveProperty("id", message.id);
        expect(result).toHaveProperty("parentContent", parentMessage.content);
        expect(result).toHaveProperty("parentMedia", parentMessage.media);
        expect(result).toHaveProperty("parentExtension", parentMessage.extension);
        expect(result).toHaveProperty("parentType", parentMessage.type);
    });
    it("should handle message without parent content correctly", async () => {
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                key: "someKey",
            },
        });
        const result = await enrichMessageWithParentContent(message);
        expect(result).toHaveProperty("id", message.id);
    });
});
