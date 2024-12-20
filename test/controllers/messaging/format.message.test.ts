import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import db from "@DB";
import {
    buildDraftedMessage,
    buildDraftParentMessage,
    buildMessageWithCustomObjects,
    buildParentMessage,
    buildReceivedMessage,
    formatParentMessage,
} from "@controllers/messages/format.message";

describe("formatMessage", () => {
    afterAll(async () => {
        await db.$disconnect();
    });

    it("should format message with custom objects", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });

        const formattedMessage = {
            ...message,
            parentMessage: null,
            sender: {
                id: user1.id,
                userName: user1.userName,
                profilePic: user1.profilePic,
            },
            forwardedFrom: null,
            mentions: [],
        };
        const result = await buildMessageWithCustomObjects(user1.id, formattedMessage);
        expect(result[0]).toHaveProperty("id", message.id);
        expect(result[1]).toHaveProperty("id", message.id);
    });

    it("should throw error when formatting parent message with null values", async () => {
        await expect(formatParentMessage(null, null)).resolves.toBeNull();
    });

    it("should throw error when formatting parent message with invalid id", async () => {
        await expect(formatParentMessage(5, null)).rejects.toThrow();
    });

    it("should resolve formatted parent message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        await expect(
            formatParentMessage(
                {
                    id: parent.id,
                    type: parent.type,
                    sender: {
                        id: user1.id,
                        userName: user1.userName,
                        profilePic: user1.profilePic,
                    },
                },
                {
                    content: parent.content,
                    media: parent.media,
                    extension: parent.extension,
                    type: parent.type,
                }
            )
        ).resolves.toHaveProperty("id", parent.id);
    });

    it("should resolve parent message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
                parentMessageId: parent.id,
            },
        });
        await expect(buildParentMessage(message.id, parent.id)).resolves.toHaveProperty(
            "id",
            parent.id
        );
    });

    it("should build draft parent message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const time = new Date();
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: {
                draftContent: "Hello",
                draftParentMessageId: parent.id,
                draftTime: time,
            },
        });
        const result = await buildDraftParentMessage(user1.id, chat.chatId, parent.id);
        expect(result).toHaveProperty("id", parent.id);
    });

    it("should build received message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
                parentMessageId: parent.id,
            },
        });
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
        const result = await buildReceivedMessage(user1.id, message);
        expect(result[0]).toHaveProperty("id", message.id);
        expect(result[1]).toHaveProperty("id", message.id);
    });
    it("should throw an error if timeData is null i.e no message statuses", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello",
                sentAt: new Date(),
                type: "TEXT",
                parentMessageId: parent.id,
            },
        });
        await expect(buildReceivedMessage(user1.id, message)).rejects.toThrow();
    });

    it("should build drafted message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const parent = await db.message.create({
            data: {
                chatId: chat.chatId,
                senderId: user1.id,
                content: "Hello from Parent",
                sentAt: new Date(),
                type: "TEXT",
            },
        });
        const time = new Date();
        const draft = { draftContent: "Hello", draftParentMessageId: parent.id, draftTime: time };
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: {
                ...draft,
            },
        });

        const result = await buildDraftedMessage(user1.id, chat.chatId, draft);
        expect(result).toHaveProperty("draftParentMessageId", parent.id);
    });
});
