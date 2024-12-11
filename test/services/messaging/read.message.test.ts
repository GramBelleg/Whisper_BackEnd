import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat, filterAllowedMessagestoRead } from "@services/chat/chat.service";
import { Message, MessageStatus, User } from "@prisma/client";
import db from "@DB";
import {
    getReadUsers,
    getRecordsToRead,
    readAllMessages,
    readMessages,
    updateReadMessages,
    updateReadMessagesStatuses,
    updateReadStatuses,
} from "@services/chat/message.service";

describe("readMessage", () => {
    let user1: User,
        user2: User,
        chat: { id: number },
        message: Message,
        messageStatus1: MessageStatus,
        messageStatus2: MessageStatus;

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
        messageStatus1 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user1.id,
                time: new Date(),
            },
        });
        messageStatus2 = await db.messageStatus.create({
            data: {
                messageId: message.id,
                userId: user2.id,
                time: new Date(),
            },
        });
    });

    afterAll(async () => {
        db.$disconnect();
    });

    it("should get read users for a message", async () => {
        const status = await db.messageStatus.update({
            where: { id: messageStatus2.id },
            data: { delivered: new Date(), read: new Date() },
        });
        const result = await getReadUsers(user1.id, message.id);
        expect(result).toEqual([
            {
                user: { id: user2.id, userName: user2.userName, profilePic: user2.profilePic },
                read: status.read,
            },
        ]);
    });

    it("should update read message statuses", async () => {
        const result = await updateReadMessagesStatuses(false, user2.id, [], chat.id);
        expect(result).toEqual([message.id]);
        const getRead = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { read: true },
        });
        expect(getRead).toHaveProperty("read");
    });

    it("should update read statuses", async () => {
        await updateReadStatuses([
            { id: message.id, chatId: message.chatId, senderId: message.senderId },
        ]);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        expect(readMessage).toEqual({ read: true });
    });

    it("should update read messages", async () => {
        await updateReadMessages([message.id]);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        expect(readMessage).toEqual({ read: true });
    });

    it("should mark all messages as read for a user in a chat", async () => {
        await readAllMessages(user2.id, chat.id);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        const getRead = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { read: true },
        });
        expect(getRead).toHaveProperty("read");
        expect(readMessage).toEqual({ read: true });
    });

    it("should mark specific messages as read for a user in a chat", async () => {
        await readMessages(user2.id, [message.id], chat.id);
        const readMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { read: true },
        });
        const getRead = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { read: true },
        });
        expect(getRead).toHaveProperty("read");
        expect(readMessage).toEqual({ read: true });
    });

    it("should get records to read for specific messages", async () => {
        const result = await getRecordsToRead([message.id]);
        expect(result).toEqual([
            { id: message.id, chatId: message.chatId, senderId: message.senderId },
        ]);
    });
    it("should filter allowed messages to read", async () => {
        const filter = await filterAllowedMessagestoRead(user2.id, [message.id], chat.id);
        expect(filter).toEqual([message.id]);
    });
});
