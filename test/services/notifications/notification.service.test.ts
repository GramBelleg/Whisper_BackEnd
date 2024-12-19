import { pushMessageNotification, clearMessageNotification, pushVoiceNofication } from "@src/services/notifications/notification.service";
import {
    findDeviceTokens,
    findUnmutedDMUsers,
    findUnmutedChannelUsers,
    findUnmutedGroupUsers
} from "@src/services/notifications/prisma/find.service";
import { chatType as findChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";
import HttpError from "@src/errors/HttpError";

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
jest.mock("@services/chat/chat.service");

describe("test pushMessageNotification", () => {
    afterEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it("should send a notification for DM chat type", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockResolvedValue(ChatType.DM);
        (findUnmutedDMUsers as jest.Mock).mockResolvedValue([1]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
        ]);

        await pushMessageNotification(receivers, chatId, message, type);

        // Verify the intermediate function calls
        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedDMUsers).toHaveBeenCalledWith(receivers, chatId);
        expect(findDeviceTokens).toHaveBeenCalledWith([1]);

        // Verify the Firebase notification was sent with correct parameters
        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
            tokens: ["token1"],
            notification: {
                title: "John",
                body: "Hello!",
            },
            data: {
                type: "message",
                messageId: "456",
            },
        });
    });

    it("should send a notification for GROUP chat type", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockResolvedValue(ChatType.GROUP);
        (findUnmutedGroupUsers as jest.Mock).mockResolvedValue({
            groupName: "Group 1",
            unmutedUsers: [1],
        });
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
        ]);

        await pushMessageNotification(receivers, chatId, message, type);

        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedGroupUsers).toHaveBeenCalledWith(receivers, chatId);
        expect(findDeviceTokens).toHaveBeenCalledWith([1]);

        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
            tokens: ["token1"],
            notification: {
                title: "Group 1",
                body: "Hello!",
            },
            data: {
                type: "message",
                messageId: "456",
            },
        });
    });

    it("should send a notification for CHANNEL chat type", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockResolvedValue(ChatType.CHANNEL);
        (findUnmutedChannelUsers as jest.Mock).mockResolvedValue([1]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
        ]);

        await pushMessageNotification(receivers, chatId, message, type);

        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedChannelUsers).toHaveBeenCalledWith(receivers, chatId);
        expect(findDeviceTokens).toHaveBeenCalledWith([1]);

        expect(mockSendEachForMulticast).toHaveBeenCalledWith({
            tokens: ["token1"],
            notification: {
                title: "John",
                body: "Hello!",
            },
            data: {
                type: "message",
                messageId: "456",
            },
        });
    });

    it("should not send a notification if no device tokens are found", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockResolvedValue(ChatType.DM);
        (findUnmutedDMUsers as jest.Mock).mockResolvedValue([1]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await pushMessageNotification(receivers, chatId, message, type);

        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedDMUsers).toHaveBeenCalledWith(receivers, chatId);
        expect(findDeviceTokens).toHaveBeenCalledWith([1]);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should not send a notification if no unmuted users are found", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockResolvedValue(ChatType.DM);
        (findUnmutedDMUsers as jest.Mock).mockResolvedValue([]);

        await pushMessageNotification(receivers, chatId, message, type);

        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedDMUsers).toHaveBeenCalledWith(receivers, chatId);
        expect(findDeviceTokens).not.toHaveBeenCalled();
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should throw an error if an exception occurs", async () => {
        const receivers = [1, 2];
        const chatId = 123;
        const message = { sender: { userName: "John" }, text: "Hello!", id: 456 };
        const type = "message";

        (findChatType as jest.Mock).mockRejectedValue(new Error("Database error"));

        await expect(pushMessageNotification(receivers, chatId, message, type))
            .rejects.toThrow(HttpError);

        expect(findChatType).toHaveBeenCalledWith(chatId);
        expect(findUnmutedDMUsers).not.toHaveBeenCalled();
    });
});

describe("test clearMessageNotification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should clear notifications for a user", async () => {
        const userId = 1;
        const messageIds = [123, 456];

        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
        ]);

        await clearMessageNotification(userId, messageIds);

        expect(findDeviceTokens).toHaveBeenCalledWith([1]);
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            tokens: ["token1"],
            data: {
                type: "clear_message",
                messageId: "123",
            },
        });
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            tokens: ["token1"],
            data: {
                type: "clear_message",
                messageId: "456",
            },
        });
    });

    it("should not send a notification if no device tokens are found", async () => {
        const userId = 1;
        const messageIds = [123, 456];

        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await clearMessageNotification(userId, messageIds);

        expect(findDeviceTokens).toHaveBeenCalledWith([1]);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should not send a notification if no message IDs are provided", async () => {
        const userId = 1;
        const messageIds: number[] = [];

        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
        ]);

        await clearMessageNotification(userId, messageIds);

        expect(findDeviceTokens).toHaveBeenCalled();
        expect(findDeviceTokens).toHaveBeenCalledWith([1]);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should throw an error if an exception occurs", async () => {
        const userId = 1;
        const messageIds = [123, 456];

        (findDeviceTokens as jest.Mock).mockRejectedValue(new Error("Database error"));

        await expect(clearMessageNotification(userId, messageIds))
            .rejects.toThrow(HttpError);

        expect(findDeviceTokens).toHaveBeenCalledWith([1]);
    });
});

describe("test pushVoiceNofication", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send a voice notification", async () => {
        const participants = [1, 2];
        const tokens = ["voice_token1", "voice_token2"];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
            { userId: 2, deviceToken: "token2" },
        ]);

        await pushVoiceNofication(participants, tokens, channelName);

        expect(findDeviceTokens).toHaveBeenCalledWith(participants);
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            tokens: ["token1"],
            notification: {
                title: "Voice Call",
                body: `Incoming Call`,
            },
            data: {
                type: "voice_call",
                token: tokens[0],
                channelName,
            },
        });
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            tokens: ["token2"],
            notification: {
                title: "Voice Call",
                body: `Incoming Call`,
            },
            data: {
                type: "voice_call",
                token: tokens[1],
                channelName,
            },
        });
    });

    it("should not send a notification if no device tokens are found", async () => {
        const participants = [1, 2];
        const tokens = ["voice_token1", "voice_token2"];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await pushVoiceNofication(participants, tokens, channelName);

        expect(findDeviceTokens).toHaveBeenCalledWith(participants);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should not send a notification if no participants are found", async () => {
        const participants: number[] = [];
        const tokens: string[] = [];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await pushVoiceNofication(participants, tokens, channelName);

        expect(findDeviceTokens).toHaveBeenCalled();
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should throw an error if an exception occurs", async () => {
        const participants = [1, 2];
        const tokens = ["voice_token1", "voice_token2"];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockRejectedValue(new Error("Database error"));

        await expect(pushVoiceNofication(participants, tokens, channelName))
            .rejects.toThrow(HttpError);

        expect(findDeviceTokens).toHaveBeenCalledWith(participants);
    });
});