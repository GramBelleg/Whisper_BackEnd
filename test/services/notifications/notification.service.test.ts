import { pushMessageNotification, clearMessageNotification, pushVoiceNofication, handleUnseenMessageNotification } from "@src/services/notifications/notification.service";
import {
    findDeviceTokens,
    findUnperviewedMessageUsers,
    findUserIdsByUsernames,
    findUnmutedUsers,
    findChatName,
} from "@src/services/notifications/prisma/find.service";
import { getChatType } from "@services/chat/chat.service";
import { ChatType } from "@prisma/client";
import { handleNotificationPayload, handleReplyNotification, handleMentionNotification, handleNewActivityUsers } from "@services/notifications/handles.service";

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
jest.mock("@src/services/notifications/handles.service");

describe("test pushMessageNotification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send a reply notification", async () => {
        const userId = 1;
        const receivers = [2, 3];
        const chatId = 1;
        const message = {
            parentMessage: { senderId: 2 },
            mentions: [],
            content: "Hello",
        };

        (getChatType as jest.Mock).mockResolvedValue(ChatType.GROUP);
        (findUnperviewedMessageUsers as jest.Mock).mockResolvedValue([]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 2, deviceToken: "token2" },
            { userId: 3, deviceToken: "token3" },
        ]);
        (findUserIdsByUsernames as jest.Mock).mockResolvedValue([]);
        (findChatName as jest.Mock).mockResolvedValue({ groupName: "Group 1", channelName: undefined });
        (findUnmutedUsers as jest.Mock).mockResolvedValue([3]);
        (handleNotificationPayload as jest.Mock).mockResolvedValue({
            notification: { title: "New Message", body: "Hello" },
            data: {},
        });
        (handleReplyNotification as jest.Mock).mockResolvedValue(undefined);

        await pushMessageNotification(userId, receivers, chatId, message);

        expect(getChatType).toHaveBeenCalledWith(chatId);
        expect(findUnperviewedMessageUsers).toHaveBeenCalledWith(receivers);
        expect(findDeviceTokens).toHaveBeenCalledWith(receivers);
        expect(findUserIdsByUsernames).not.toHaveBeenCalled();
        expect(findChatName).toHaveBeenCalledWith(chatId, ChatType.GROUP);
        expect(findUnmutedUsers).toHaveBeenCalledWith([3], chatId, ChatType.GROUP);
        expect(handleNotificationPayload).toHaveBeenCalledWith(message, ChatType.GROUP, "Group 1", undefined);
        expect(handleReplyNotification).toHaveBeenCalledWith(
            {
                notification: { title: "New Message", body: "Hello" },
                data: {},
            },
            2,
            [],
            ["token2"]
        );
    });

    it("should send a mention notification", async () => {
        const userId = 1;
        const receivers = [2, 3];
        const chatId = 1;
        const message = {
            parentMessage: null,
            mentions: ["user2"],
            content: "Hello @user2",
        };

        (getChatType as jest.Mock).mockResolvedValue(ChatType.CHANNEL);
        (findUnperviewedMessageUsers as jest.Mock).mockResolvedValue([]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 2, deviceToken: "token2" },
            { userId: 3, deviceToken: "token3" },
        ]);
        (findUserIdsByUsernames as jest.Mock).mockResolvedValue([2]);
        (findChatName as jest.Mock).mockResolvedValue({ groupName: undefined, channelName: "Channel 1" });
        (findUnmutedUsers as jest.Mock).mockResolvedValue([3]);
        (handleNotificationPayload as jest.Mock).mockResolvedValue({
            notification: { title: "New Message", body: "Hello" },
            data: {},
        });
        (handleMentionNotification as jest.Mock).mockResolvedValue(undefined);

        await pushMessageNotification(userId, receivers, chatId, message);

        expect(getChatType).toHaveBeenCalledWith(chatId);
        expect(findUnperviewedMessageUsers).toHaveBeenCalledWith(receivers);
        expect(findDeviceTokens).toHaveBeenCalledWith(receivers);
        expect(findUserIdsByUsernames).toHaveBeenCalledWith(["user2"]);
        expect(findChatName).toHaveBeenCalledWith(chatId, ChatType.CHANNEL);
        expect(findUnmutedUsers).toHaveBeenCalledWith([3], chatId, ChatType.CHANNEL);
        expect(handleNotificationPayload).toHaveBeenCalledWith(message, ChatType.CHANNEL, undefined, "Channel 1");
        expect(handleMentionNotification).toHaveBeenCalledWith(
            {
                notification: { title: "New Message", body: "Hello" },
                data: {},
            },
            [2],
            [],
            [{ userId: 2, deviceToken: "token2" }]
        );
    });

    it("should send a notification to unmuted users", async () => {
        const userId = 1;
        const receivers = [2, 3];
        const chatId = 1;
        const message = {
            parentMessage: null,
            mentions: [],
            content: "Hello",
        };

        (getChatType as jest.Mock).mockResolvedValue(ChatType.GROUP);
        (findUnperviewedMessageUsers as jest.Mock).mockResolvedValue([]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 2, deviceToken: "token2" },
            { userId: 3, deviceToken: "token3" },
        ]);
        (findUserIdsByUsernames as jest.Mock).mockResolvedValue([]);
        (findChatName as jest.Mock).mockResolvedValue({ groupName: "Group 1", channelName: "Channel 1" });
        (findUnmutedUsers as jest.Mock).mockResolvedValue([2, 3]);
        (handleNotificationPayload as jest.Mock).mockResolvedValue({
            notification: { title: "New Message", body: "Hello" },
            data: {},
        });

        await pushMessageNotification(userId, receivers, chatId, message);

        expect(getChatType).toHaveBeenCalledWith(chatId);
        expect(findUnperviewedMessageUsers).toHaveBeenCalledWith(receivers);
        expect(findDeviceTokens).toHaveBeenCalledWith(receivers);
        expect(findUserIdsByUsernames).not.toHaveBeenCalled();
        expect(findChatName).toHaveBeenCalledWith(chatId, ChatType.GROUP);
        expect(findUnmutedUsers).toHaveBeenCalledWith(receivers, chatId, ChatType.GROUP);
        expect(handleNotificationPayload).toHaveBeenCalledWith(message, ChatType.GROUP, "Group 1", "Channel 1");
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            tokens: ["token2"],
            notification: { title: "New Message", body: "Hello" },
            data: {},
        });
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            tokens: ["token3"],
            notification: { title: "New Message", body: "Hello" },
            data: {},
        });
    });

    it("should handle errors gracefully", async () => {
        const userId = 1;
        const receivers = [2, 3];
        const chatId = 1;
        const message = {
            parentMessage: null,
            mentions: [],
            content: "Hello",
        };

        (getChatType as jest.Mock).mockRejectedValue(new Error("Database error"));

        await pushMessageNotification(userId, receivers, chatId, message);

        expect(getChatType).toHaveBeenCalledWith(chatId);
        expect(findUnperviewedMessageUsers).not.toHaveBeenCalled();
        expect(findDeviceTokens).not.toHaveBeenCalled();
        expect(findUserIdsByUsernames).not.toHaveBeenCalled();
        expect(findChatName).not.toHaveBeenCalled();
        expect(findUnmutedUsers).not.toHaveBeenCalled();
        expect(handleNotificationPayload).not.toHaveBeenCalled();
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
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
        const clearing = await clearMessageNotification(userId, messageIds);
        expect(clearing).toBe(undefined);
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

        await pushVoiceNofication(participants, tokens, { channelName });

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

        await pushVoiceNofication(participants, tokens, { channelName });

        expect(findDeviceTokens).toHaveBeenCalledWith(participants);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should not send a notification if no participants are found", async () => {
        const participants: number[] = [];
        const tokens: string[] = [];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await pushVoiceNofication(participants, tokens, { channelName });

        expect(findDeviceTokens).toHaveBeenCalled();
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should throw an error if an exception occurs", async () => {
        const participants = [1, 2];
        const tokens = ["voice_token1", "voice_token2"];
        const channelName = "Channel 1";
        (findDeviceTokens as jest.Mock).mockRejectedValue(new Error("Database error"));
        const voicing = await pushVoiceNofication(participants, tokens, { channelName });
        expect(voicing).toBe(undefined);
        expect(findDeviceTokens).toHaveBeenCalledWith(participants);
    });
});


describe("test handleUnseenMessageNotification", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send unseen message notifications", async () => {
        const users = [
            { userId: 1, chatNames: ["Chat 1"] },
            { userId: 2, chatNames: ["Chat 2"] },
        ];

        (handleNewActivityUsers as jest.Mock).mockResolvedValue(users);
        (findDeviceTokens as jest.Mock).mockResolvedValue([
            { userId: 1, deviceToken: "token1" },
            { userId: 2, deviceToken: "token2" },
        ]);

        await handleUnseenMessageNotification();

        expect(handleNewActivityUsers).toHaveBeenCalled();
        expect(findDeviceTokens).toHaveBeenCalledWith([1, 2]);
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(1, {
            tokens: ["token1"],
            notification: {
                title: "New Activaty",
                body: "There is new activaty in Chat 1",
            },
            data: {
                type: "unseen_message",
            },
        });
        expect(mockSendEachForMulticast).toHaveBeenNthCalledWith(2, {
            tokens: ["token2"],
            notification: {
                title: "New Activaty",
                body: "There is new activaty in Chat 2",
            },
            data: {
                type: "unseen_message",
            },
        });
    });

    it("should not send notifications if no device tokens are found", async () => {
        const users = [
            { userId: 1, chatNames: ["Chat 1"] },
            { userId: 2, chatNames: ["Chat 2"] },
        ];

        (handleNewActivityUsers as jest.Mock).mockResolvedValue(users);
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await handleUnseenMessageNotification();

        expect(handleNewActivityUsers).toHaveBeenCalled();
        expect(findDeviceTokens).toHaveBeenCalledWith([1, 2]);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should not send notifications if no users are found", async () => {
        (handleNewActivityUsers as jest.Mock).mockResolvedValue([]);
        (findDeviceTokens as jest.Mock).mockResolvedValue([]);

        await handleUnseenMessageNotification();

        expect(handleNewActivityUsers).toHaveBeenCalled();
        expect(findDeviceTokens).toHaveBeenCalledWith([]);
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
        (handleNewActivityUsers as jest.Mock).mockRejectedValue(new Error("Database error"));

        await handleUnseenMessageNotification();

        expect(handleNewActivityUsers).toHaveBeenCalled();
        expect(findDeviceTokens).not.toHaveBeenCalled();
        expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });
});
