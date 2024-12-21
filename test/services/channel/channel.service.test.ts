import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import * as channelService from "@services/chat/channel.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { ChatType } from "@prisma/client";
import { clearDB } from "@src/prisma/clear";

const createChat = async () => {
    const user1 = await createRandomUser();
    const user2 = await createRandomUser();
    const users = [user1, user2];
    const chatType: ChatType = "CHANNEL";
    const createdChat = {
        users: [users[0].id, users[1].id],
        senderKey: null,
        type: chatType,
        name: "channel name",
        picture: "picture",
    };
    const chat = await chatService.createChat([users[0].id, users[1].id], user1.id, null, chatType);
    const channel = await channelService.createChannel(
        chat.id,
        chat.participants,
        createdChat,
        user1.id
    );
    return { chat, createdChat, users, channel };
};

afterAll(async () => {
    await db.$disconnect();
});

beforeEach(async () => {
    await clearDB();
});
describe("createChat", () => {
    it("should create a new channel with participants", async () => {
        const { chat, createdChat, users } = await createChat();

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: createdChat.type });
    });
    it("should handle duplicate channels", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const users = [user1, user2];
        const chatType: ChatType = "CHANNEL";
        const createdChat = {
            users: [users[0].id, users[1].id],
            senderKey: null,
            type: chatType,
            name: "channel name",
            picture: "picture",
        };
        const chat = await chatService.createChat(
            [users[0].id, users[1].id],
            user1.id,
            null,
            chatType
        );
        await channelService.createChannel(chat.id, chat.participants, createdChat, user1.id);
        await expect(
            channelService.createChannel(chat.id, chat.participants, createdChat, user1.id)
        ).rejects.toThrow("Channel with the specified chatId already exists.");
    });
    it("should handle channel with no name", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chatType: ChatType = "CHANNEL";
        const createdChat = {
            users: [user1.id, user2.id],
            senderKey: null,
            type: chatType,
            name: "",
            picture: "picture",
        };
        const chat = await chatService.createChat([user1.id, user2.id], user1.id, null, chatType);
        await expect(
            channelService.createChannel(chat.id, chat.participants, createdChat, user1.id)
        ).rejects.toThrow("Channel name is missing");
    });
});
describe("createChannelParticipants", () => {
    it("should throw chat participant doesn't exist", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const participants = [
            { id: -1, userId: user1.id },
            { id: -2, userId: user2.id },
        ];
        await expect(
            channelService.createChannelParticipants(participants, user1.id)
        ).rejects.toThrow("Chat participant doesn't exist.");
    });
});

describe("getChannelContent", () => {
    it("should get channel content", async () => {
        const { chat, createdChat, users } = await createChat();
        const channel = await channelService.getChannelContent(chat.id, users[0].id);
        expect(channel).toMatchObject({
            name: createdChat.name,
            picture: createdChat.picture,
            isAdmin: true,
        });
    });
    it("should throw channel not found", async () => {
        const user1 = await createRandomUser();

        await expect(channelService.getChannelContent(-1, user1.id)).rejects.toThrow(
            "Channel not found or user isn't in channel."
        );
    });
});
describe("getChannelMembers", () => {
    it("should get channel members", async () => {
        const { chat, createdChat, users } = await createChat();

        const members = await channelService.getChannelMembers(users[0].id, chat.id);
        for (let i = 0; i < members.length; i++) {
            expect(members[i]).toMatchObject({
                id: users[i].id,
                userName: users[i].userName,
                profilePic: users[i].profilePic,
                hasStory: false,
                isAdmin: i == 0 ? true : false,
                lastSeen: users[i].lastSeen,
                status: users[i].status,
            });
        }
    });

    //it should throw an error
    it("should throw error channel not found", async () => {
        const user1 = await createRandomUser();

        await expect(channelService.getChannelMembers(user1.id, -1)).rejects.toThrow(
            "Channel not found"
        );
    });
});

describe("isAdmin", () => {
    it("should expect admin", async () => {
        const { chat, createdChat, users } = await createChat();

        const isAdmin = await channelService.isAdmin({ chatId: chat.id, userId: users[0].id });
        expect(isAdmin).toBe(true);
    });
    it("should expect not admin", async () => {
        const { chat, createdChat, users } = await createChat();

        const isAdmin = await channelService.isAdmin({ chatId: chat.id, userId: users[1].id });
        expect(isAdmin).toBe(false);
    });
    it("should throw error channel not found", async () => {
        const user1 = await createRandomUser();

        await expect(channelService.isAdmin({ chatId: -1, userId: user1.id })).rejects.toThrow(
            "Channel Participant not found"
        );
    });
});
describe("addAdmin", () => {
    it("should add admin", async () => {
        const { chat, createdChat, users } = await createChat();

        await channelService.addAdmin({ chatId: chat.id, userId: users[1].id });
        const isAdmin = await channelService.isAdmin({ chatId: chat.id, userId: users[1].id });

        expect(isAdmin).toBe(true);
    });

    it("should throw error channel not found", async () => {
        const user1 = await createRandomUser();

        await expect(channelService.addAdmin({ chatId: -1, userId: user1.id })).rejects.toThrow(
            "ChatParticipant or channelParticipant not found."
        );
    });
});
describe("addUser", () => {
    it("should add user", async () => {
        const { chat, createdChat, users } = await createChat();
        const user3 = await createRandomUser();
        await channelService.addUser(user3.id, chat.id);
        const members = await channelService.getChannelMembers(user3.id, chat.id);
        let addedMember;
        for (const member of members) {
            if (member.id == user3.id) addedMember = member;
        }
        expect(addedMember).toMatchObject({
            id: user3.id,
            userName: user3.userName,
            profilePic: user3.profilePic,
            hasStory: false,
            isAdmin: false,
            lastSeen: user3.lastSeen,
            status: user3.status,
        });
    });

    it("should throw error member already exists", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(channelService.addUser(users[0].id, chat.id)).rejects.toThrow(
            "Chat Participant already exists."
        );
    });
    it("should throw error user or chat don't exist", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(channelService.addUser(-1, chat.id)).rejects.toThrow(
            "User or Chat doesn't exist."
        );
    });
});
describe("getPermissions", () => {
    it("should get user permissions", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = await channelService.getPermissions(users[0].id, chat.id);

        expect(permissions).toMatchObject({
            canDownload: true,
            canComment: true,
        });
    });

    it("should throw error member doesn't exist", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(channelService.getPermissions(-1, chat.id)).rejects.toThrow(
            "Participant doesn't exist"
        );
    });
});
describe("setPermissions", () => {
    it("should update user permissions", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = {
            canDownload: false,
            canComment: true,
        };
        await channelService.setPermissions(users[0].id, chat.id, permissions);
        const expectedPermissions = await channelService.getPermissions(users[0].id, chat.id);
        expect(permissions).toMatchObject({ ...expectedPermissions });
    });

    it("should throw error member doesn't exist", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = {
            canDownload: false,
            canComment: true,
        };
        await expect(channelService.setPermissions(-1, chat.id, permissions)).rejects.toThrow(
            "Participant or channel participant not found."
        );
    });
});
describe("getSettings", () => {
    it("should get channel settings", async () => {
        const { chat, channel } = await createChat();
        const settings = await channelService.getSettings(chat.id);
        expect(settings).toMatchObject({ public: true, inviteLink: channel?.inviteLink });
    });

    it("should throw error channel doesn't exist", async () => {
        await expect(channelService.getSettings(-1)).rejects.toThrow(
            "Channel not found for the specified chatId."
        );
    });
});
describe("getAdmins", () => {
    it("should get channel admins", async () => {
        const { chat, channel, users } = await createChat();
        const expectedAdminIds = [users[0].id];
        const adminIds = await channelService.getAdmins(chat.id);
        for (let i = 0; i < adminIds.length; i++) expect(adminIds[i]).toBe(expectedAdminIds[i]);

        await channelService.addAdmin({ userId: users[1].id, chatId: chat.id });
        expectedAdminIds.push(users[1].id);

        for (let i = 0; i < adminIds.length; i++) expect(adminIds[i]).toBe(expectedAdminIds[i]);
    });

    it("should throw error channel doesn't exist", async () => {
        await expect(channelService.getAdmins(-1)).rejects.toThrow("Channel Admins not found");
    });
});
describe("setChannelPrivacy", () => {
    it("should update channel privacy", async () => {
        const { chat, createdChat, users } = await createChat();
        const isPrivate = false;
        await channelService.setChannelPrivacy(chat.id, isPrivate);
        const settings = await channelService.getSettings(chat.id);
        expect(settings.public).toBe(!isPrivate);
    });

    it("should throw error channel doesn't exist", async () => {
        await expect(channelService.setChannelPrivacy(-1, false)).rejects.toThrow(
            "Channel Not Found"
        );
    });
});
