import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, MessageStatus, User } from "@prisma/client";
import db from "@DB";
import {
    deliverAllMessages,
    deliverMessage,
    getDeliveredUsers,
    getRecordsToDeliver,
    groupMessageRecords,
    updateDeliveredStatuses,
    updateDeliverMessage,
    updateDeliverMessages,
    updateDeliverMessagesStatuses,
    updateDeliverMessageStatus,
} from "@services/chat/message.service";

describe("deliverMessage", () => {
    let user1: User,
        user2: User,
        chat: {
            id: number;
            participants: {
                id: number;
                userId: number;
            }[];
        },
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
        await db.$disconnect();
    });

    it("should update message statuses for a user", async () => {
        const result = await updateDeliverMessagesStatuses(user2.id);
        expect(result).toEqual([message.id]);
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { delivered: true },
        });
        expect(getDelivered?.delivered).not.toBeNull();
    });

    it("should get delivered users for a message", async () => {
        const status = await db.messageStatus.update({
            where: { id: messageStatus2.id },
            data: { delivered: new Date() },
        });
        const result = await getDeliveredUsers(user1.id, message.id);
        expect(result).toEqual([
            {
                user: { id: user2.id, userName: user2.userName, profilePic: user2.profilePic },
                delivered: status.delivered,
            },
        ]);
    });

    it("should get records to deliver for a message", async () => {
        const result = await getRecordsToDeliver([message.id]);
        expect(result).toEqual([
            { id: message.id, chatId: message.chatId, senderId: message.senderId },
        ]);
    });

    it("should group message records by sender and chat", () => {
        const records = [
            { id: 1, senderId: 1, chatId: 100 },
            { id: 2, senderId: 1, chatId: 100 },
            { id: 3, senderId: 2, chatId: 200 },
            { id: 4, senderId: 1, chatId: 101 },
        ];
        const result = groupMessageRecords(records);
        expect(result).toEqual({
            1: [
                { chatId: 100, messageIds: [1, 2] },
                { chatId: 101, messageIds: [4] },
            ],
            2: [{ chatId: 200, messageIds: [3] }],
        });
    });

    it("should update delivered statuses for messages", async () => {
        await updateDeliveredStatuses([
            { id: message.id, chatId: message.chatId, senderId: message.senderId },
        ]);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        expect(deliveredMessage).toEqual({ delivered: true });
    });

    it("should update delivered statuses for multiple messages", async () => {
        await updateDeliverMessages([message.id]);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        expect(deliveredMessage).toEqual({ delivered: true });
    });

    it("should deliver all messages for a user", async () => {
        await deliverAllMessages(user2.id);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { delivered: true },
        });
        expect(getDelivered).toHaveProperty("delivered");
        expect(deliveredMessage).toEqual({ delivered: true });
    });

    it("should update deliver message status for a user and message", async () => {
        await updateDeliverMessageStatus(user2.id, message.id);
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { delivered: true },
        });
        expect(getDelivered).toHaveProperty("delivered");
    });

    it("should update deliver message for a message", async () => {
        await updateDeliverMessage(message.id);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        expect(deliveredMessage).toEqual({ delivered: true });
    });

    it("should handle non-existent message id gracefully", async () => {
        await updateDeliverMessage(999999);
    });

    it("should deliver a message for a user", async () => {
        await deliverMessage(user2.id, message.id);
        const deliveredMessage = await db.message.findUnique({
            where: { id: message.id },
            select: { delivered: true },
        });
        const getDelivered = await db.messageStatus.findUnique({
            where: { id: messageStatus2.id },
            select: { delivered: true },
        });
        expect(getDelivered).toHaveProperty("delivered");
        expect(deliveredMessage).toEqual({ delivered: true });
    });
});
