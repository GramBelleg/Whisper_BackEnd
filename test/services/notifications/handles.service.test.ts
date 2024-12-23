import { handleNotificationPayload, handleReplyNotification, handleMentionNotification, handleNewActivityUsers } from "@src/services/notifications/handles.service";
import { ChatType } from "@prisma/client";
import FirebaseAdmin from "@src/FCM/admin";
import HttpError from "@src/errors/HttpError";
import { findNewActivityUsers } from "@src/services/notifications/prisma/find.service";

// Create a mock messaging function
const mockSendEachForMulticast = jest.fn().mockResolvedValue(undefined);
const mockMessaging = jest.fn(() => ({
    sendEachForMulticast: mockSendEachForMulticast
}));

// Mock the Firebase Admin instance
jest.mock("@src/FCM/admin", () => ({
    getInstance: jest.fn(() => ({
        messaging: mockMessaging
    }))
}));

jest.mock("@src/services/notifications/prisma/find.service");

describe("handleNotificationPayload", () => {
    it("should return correct payload for DM chat type", async () => {
        const message = { sender: { userName: "John" }, content: "Hello", type: "TEXT", id: 1, isSecret: false };
        const payload = await handleNotificationPayload(message, ChatType.DM, undefined, undefined);
        expect(payload.notification.title).toBe("John");
        expect(payload.notification.body).toBe("Hello");
        expect(payload.data.type).toBe("new_message");
        expect(payload.data.messageType).toBe("Encrypted Message");
        expect(payload.data.messageId).toBe("1");
    });

    it("should return correct payload for GROUP chat type", async () => {
        const message = { sender: { userName: "John" }, content: "Hello", type: "TEXT", id: 1, isSecret: false };
        const payload = await handleNotificationPayload(message, ChatType.GROUP, "GroupName", undefined);
        expect(payload.notification.title).toBe("GroupName: John");
        expect(payload.notification.body).toBe("Hello");
    });

    it("should return correct payload for CHANNEL chat type", async () => {
        const message = { sender: { userName: "John" }, content: "Hello", type: "TEXT", id: 1, isSecret: false };
        const payload = await handleNotificationPayload(message, ChatType.CHANNEL, undefined, "ChannelName");
        expect(payload.notification.title).toBe("ChannelName");
        expect(payload.notification.body).toBe("Hello");
    });
});

describe("handleReplyNotification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should send notification with correct payload", async () => {
        const payload = { notification: { title: "John", body: "Hello" }, data: {} };
        const receiver = 1;
        const unpreviwedMessageUsers = [2];
        const deviceTokens = ["token1", "token2"];

        await handleReplyNotification(payload, receiver, unpreviwedMessageUsers, deviceTokens);
        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
            tokens: deviceTokens,
            notification: payload.notification,
            data: payload.data,
        });
    });

    it("should handle error correctly", async () => {
        const payload = { notification: { title: "John", body: "Hello" }, data: {} };
        const receiver = 1;
        const unpreviwedMessageUsers = [2];
        const deviceTokens = ["token1", "token2"];
        (mockSendEachForMulticast as jest.Mock).mockRejectedValue(new Error("Test Error"));

        await expect(handleReplyNotification(payload, receiver, unpreviwedMessageUsers, deviceTokens)).rejects.toThrow(HttpError);
    });
});

describe("handleMentionNotification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should send notification with correct payload", async () => {
        const payload = { notification: { title: "John", body: "Hello" }, data: {} };
        const receivers = [1, 2];
        const unpreviwedMessageUsers = [2];
        const deviceTokens = [{ userId: 1, deviceToken: "token1" }, { userId: 2, deviceToken: "token2" }];
        (mockSendEachForMulticast as jest.Mock).mockResolvedValue(undefined);

        await handleMentionNotification(payload, receivers, unpreviwedMessageUsers, deviceTokens as any);
        expect(mockSendEachForMulticast).toHaveBeenCalledTimes(2);
    });

    it("should handle error correctly", async () => {
        const payload = { notification: { title: "John", body: "Hello" }, data: {} };
        const receivers = [1, 2];
        const unpreviwedMessageUsers = [2];
        const deviceTokens = [{ userId: 1, deviceToken: "token1" }, { userId: 2, deviceToken: "token2" }];
        (mockSendEachForMulticast as jest.Mock).mockRejectedValue(new Error("Test Error"));

        await expect(handleMentionNotification(payload, receivers, unpreviwedMessageUsers, deviceTokens as any)).rejects.toThrow(HttpError);
    });
});

describe("handleNewActivityUsers", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return list of new activity users", async () => {
        const users = [
            { userId: 1, chat: { group: { name: "Group1" }, channel: null } },
            { userId: 2, chat: { group: null, channel: { name: "Channel1" } } },
            { userId: 1, chat: { group: { name: "Group2" }, channel: null } },
        ];
        (findNewActivityUsers as jest.Mock).mockResolvedValue(users);

        const result = await handleNewActivityUsers();
        expect(result).toEqual([
            { userId: 1, chatNames: ["Group1", "Group2"] },
            { userId: 2, chatNames: ["Channel1"] },
        ]);
    });

    it("should return empty list if no new activity users found", async () => {
        (findNewActivityUsers as jest.Mock).mockResolvedValue([]);

        const result = await handleNewActivityUsers();
        expect(result).toEqual([]);
    });
});
