import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, User } from "@prisma/client";
import db from "@DB";
import {
    getMessage,
    getMessages,
    getMessageSummary,
    getSingleMessage,
    getUserMessageTime,
} from "@services/chat/message.service";

describe("getMessage", () => {
    let user1: User, user2: User, chat: { id: number }, message: Message;

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
        db.$disconnect();
    });

    it("should return null summary for non-existent message", async () => {
        const messageSummary = await getMessageSummary(null);
        expect(messageSummary).toBeNull();
    });

    it("should return message summary for existing message", async () => {
        const messageSummary = await getMessageSummary(message.id);
        expect(messageSummary).toEqual({
            id: message.id,
            sender: {
                id: user1.id,
                userName: user1.userName,
                profilePic: user1.profilePic,
            },
            type: "TEXT",
        });
    });
    it("should return user message time", async () => {
        const messageStatus1 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });

        const userMessageTime = await getUserMessageTime(user1.id, message.id);
        expect(userMessageTime).toEqual({
            time: messageStatus1.time,
        });
    });

    it("should return message", async () => {
        const messageStatus = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const returnedMessage = await getMessage(messageStatus.id);
        expect(returnedMessage).toEqual({
            message: {
                id: message.id,
                content: "Hello @user2",
                type: "TEXT",
                extension: null,
                media: null,
                read: false,
                delivered: false,
            },
            time: messageStatus.time,
        });
    });
    it("should get a single message", async () => {
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const returnedMessage = await getSingleMessage(user1.id, message.id);
        expect(returnedMessage).toHaveProperty("message");
    });
    it("should get all messages", async () => {
        await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        const returnedMessage = await getMessages(user1.id, chat.id);
        expect(returnedMessage).toBeInstanceOf(Array);
    });
});
