import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import {
    draftMessage,
    enrichDraftWithParentContent,
    getDraftParentMessageContent,
    undraftMessage,
} from "@services/chat/message.service";

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
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: {
                draftContent: "Hello",
                draftParentMessageId: null,
                draftTime: time,
            },
        });

        const draftedMessage = await chatService.formatDraftedMessage(user1.id, chat.chatId);

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

        const draftedMessage = await chatService.formatDraftedMessage(user1.id, chat.chatId);

        expect(draftedMessage).toEqual({
            draftContent: "",
            draftParentMessageId: null,
            draftTime: null,
            parentMessage: null,
        });
    });

    it("should return null if there is no such chat or user", async () => {
        const draftedMessage = await chatService.formatDraftedMessage(999, 999);

        expect(draftedMessage).toBeNull();
    });

    it("should return null if there is no such chat or user for drafted parent content", async () => {
        const draftedMessage = await getDraftParentMessageContent(999, 999);
        expect(draftedMessage).toBeNull();
    });

    it("should enrich draft with parent content", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                mentions: [user1.id],
            },
        });
        const draft = { draftContent: "Hello", draftParentMessageId: message.id, draftTime: time };
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: { ...draft },
        });
        const result = await enrichDraftWithParentContent(draft);
        expect(result).toHaveProperty("draftParentContent", "Hello @user2");
        expect(result).toHaveProperty("draftParentMedia", null);
        expect(result).toHaveProperty("draftParentExtension", null);
    });
    it("should get draft parent message content", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const message = await db.message.create({
            data: {
                chatId: chat.chatId,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
                mentions: [user1.id],
            },
        });
        const draft = {
            draftContent: "Hello",
            draftParentMessageId: message.id,
            draftParentContent: message.content,
            draftParentMedia: message.media,
            draftParentExtension: message.extension,
            draftParentType: message.type,
            draftTime: time,
        };
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: { ...draft },
        });
        const result = await getDraftParentMessageContent(user1.id, chat.chatId);
        expect(result).toHaveProperty("content", draft.draftParentContent);
        expect(result).toHaveProperty("media", draft.draftParentMedia);
        expect(result).toHaveProperty("extension", draft.draftParentExtension);
        expect(result).toHaveProperty("type", draft.draftParentType);
    });

    it("should draft a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: time };
        await draftMessage(user1.id, chat.chatId, draft);
        const result = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            select: {
                draftContent: true,
                draftParentMessageId: true,
                draftTime: true,
            },
        });
        expect(result).toEqual(draft);
    });
    it("should undraft a message", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        const time = new Date();
        const draft = { draftContent: "Hello", draftParentMessageId: null, draftTime: time };
        await db.chatParticipant.update({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            data: { ...draft },
        });
        await undraftMessage(user1.id, chat.chatId);
        const result = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId: chat.chatId,
                    userId: user1.id,
                },
            },
            select: {
                draftContent: true,
                draftParentMessageId: true,
                draftTime: true,
            },
        });
        expect(result).toEqual({ draftContent: "", draftParentMessageId: null, draftTime: null });
    });
});
