import { createRandomUser } from "@services/auth/prisma/create.service";
import {
    createChat,
    isUserAllowedToAccessMessage,
    messageExists,
} from "@services/chat/chat.service";
import { User } from "@prisma/client";
import { Message } from "@prisma/client";
import db from "@DB";
import {
    getMessageContent,
    getMessageStatus,
    getOtherMessageTime,
} from "@services/chat/message.service";

describe("getMessageAttributes", () => {
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

    it("should get other message time", async () => {
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const messageStatus2 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
        const time = await getOtherMessageTime(user1.id, message.id);
        expect(time).toEqual({ time: messageStatus2.time });
    });

    it("should return the correct message content for a valid message ID", async () => {
        const messageContent = await getMessageContent(message.id);
        expect(messageContent).toEqual({
            content: "Hello @user2",
            media: null,
            extension: null,
            type: "TEXT",
        });
    });

    it("should return null for an invalid message ID", async () => {
        const messageContent = await getMessageContent(99999999);
        expect(messageContent).toBeNull();
    });
    it("should get message statuses (read/delivered)", async () => {
        const messageStatus = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
                delivered: new Date(),
                read: new Date(),
            },
        });
        const status = await getMessageStatus(user1.id, message.id);
        expect(status).toEqual({
            deliveredUsers: [],
            readUsers: [
                {
                    user: { id: user2.id, userName: user2.userName, profilePic: user2.profilePic },
                    read: messageStatus.read,
                },
            ],
        });
    });
    it("should return null if messageId doesn't exist", async () => {
        const status = await getMessageContent(99999999);
        expect(status).toBeNull();
    });
    it("should return null if messageId is null", async () => {
        const status = await getMessageContent(null);
        expect(status).toBeNull();
    });
    it("should return if message exists true", async () => {
        const result = await messageExists(message.id);
        expect(result).toBe(true);
    });
    it("should return if message exists false", async () => {
        const result = await messageExists(99999);
        expect(result).toBe(false);
    });
    it("should return true if user allowed to access message", async () => {
        const result = await isUserAllowedToAccessMessage(user1.id, message.id);
        expect(result).toBe(true);
    });
    it("should return false if user not allowed to access message", async () => {
        const result = await isUserAllowedToAccessMessage(999999, message.id);
        expect(result).toBe(false);
    });
});
