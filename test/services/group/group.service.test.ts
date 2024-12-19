import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { ChatType } from "@prisma/client";
import { clearDB } from "@src/prisma/clear";
import { getPermissions } from "@controllers/chat/group.chat";
import { MAX_GROUP_SIZE } from "@config/constants.config";

const createChat = async () => {
    const user1 = await createRandomUser();
    const user2 = await createRandomUser();
    const users = [user1, user2];
    const chatType: ChatType = "GROUP";
    const createdChat = {
        users: [users[0].id, users[1].id],
        senderKey: null,
        type: chatType,
        name: "group name",
        picture: "picture",
    };
    const chat = await chatService.createChat([users[0].id, users[1].id], user1.id, null, chatType);
    await groupService.createGroup(chat.id, chat.participants, createdChat, user1.id);
    return { chat, createdChat, users };
};

afterAll(async () => {
    await db.$disconnect();
});

beforeEach(async () => {
    await clearDB();
});
describe("createChat", () => {
    it("should create a new group chat with participants", async () => {
        const { chat, createdChat, users } = await createChat();

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: createdChat.type });
    });
    it("should handle duplicate groups", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const users = [user1, user2];
        const chatType: ChatType = "GROUP";
        const createdChat = {
            users: [users[0].id, users[1].id],
            senderKey: null,
            type: chatType,
            name: "group name",
            picture: "picture",
        };
        const chat = await chatService.createChat(
            [users[0].id, users[1].id],
            user1.id,
            null,
            chatType
        );
        await groupService.createGroup(chat.id, chat.participants, createdChat, user1.id);
        await expect(
            groupService.createGroup(chat.id, chat.participants, createdChat, user1.id)
        ).rejects.toThrow("Group with the specified chatId already exists.");
    });
    it("should handle group with no name", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chatType: ChatType = "GROUP";
        const createdChat = {
            users: [user1.id, user2.id],
            senderKey: null,
            type: chatType,
            name: "",
            picture: "picture",
        };
        const chat = await chatService.createChat([user1.id, user2.id], user1.id, null, chatType);
        await expect(
            groupService.createGroup(chat.id, chat.participants, createdChat, user1.id)
        ).rejects.toThrow("Group name is missing");
    });
});
describe("createGroupParticipants", () => {
    it("should throw chat participant doesn't exist", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const participants = [
            { id: -1, userId: user1.id },
            { id: -2, userId: user2.id },
        ];
        await expect(groupService.createGroupParticipants(participants, user1.id)).rejects.toThrow(
            "Chat participant doesn't exist."
        );
    });
});

describe("getGroupContent", () => {
    it("should get group content", async () => {
        const { chat, createdChat, users } = await createChat();
        const group = await groupService.getGroupContent(chat.id, users[0].id);
        expect(group).toMatchObject({
            name: createdChat.name,
            picture: createdChat.picture,
            isAdmin: true,
        });
    });
    it("should throw group not found", async () => {
        const user1 = await createRandomUser();

        await expect(groupService.getGroupContent(-1, user1.id)).rejects.toThrow(
            "Group not found or user isn't in group."
        );
    });
});
describe("getGroupMembers", () => {
    it("should get group members", async () => {
        const { chat, createdChat, users } = await createChat();

        const members = await groupService.getGroupMembers(users[0].id, chat.id);
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
    it("should throw error group not found", async () => {
        const user1 = await createRandomUser();

        await expect(groupService.getGroupMembers(user1.id, -1)).rejects.toThrow("Group not found");
    });
});

describe("isAdmin", () => {
    it("should expect admin", async () => {
        const { chat, createdChat, users } = await createChat();

        const isAdmin = await groupService.isAdmin({ chatId: chat.id, userId: users[0].id });
        expect(isAdmin).toBe(true);
    });
    it("should expect not admin", async () => {
        const { chat, createdChat, users } = await createChat();

        const isAdmin = await groupService.isAdmin({ chatId: chat.id, userId: users[1].id });
        expect(isAdmin).toBe(false);
    });
    it("should throw error group not found", async () => {
        const user1 = await createRandomUser();

        await expect(groupService.isAdmin({ chatId: -1, userId: user1.id })).rejects.toThrow(
            "Group Participant not found"
        );
    });
});
describe("addAdmin", () => {
    it("should add admin", async () => {
        const { chat, createdChat, users } = await createChat();

        await groupService.addAdmin({ chatId: chat.id, userId: users[1].id });
        const isAdmin = await groupService.isAdmin({ chatId: chat.id, userId: users[1].id });

        expect(isAdmin).toBe(true);
    });

    it("should throw error group not found", async () => {
        const user1 = await createRandomUser();

        await expect(groupService.addAdmin({ chatId: -1, userId: user1.id })).rejects.toThrow(
            "ChatParticipant or groupParticipant not found."
        );
    });
});
describe("addUser", () => {
    it("should add user", async () => {
        const { chat, createdChat, users } = await createChat();
        const user3 = await createRandomUser();
        await groupService.addUser(user3.id, chat.id);
        const members = await groupService.getGroupMembers(user3.id, chat.id);
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

        await expect(groupService.addUser(users[0].id, chat.id)).rejects.toThrow(
            "Chat Participant already exists."
        );
    });
    it("should throw error user or chat don't exist", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(groupService.addUser(-1, chat.id)).rejects.toThrow(
            "User or Chat doesn't exist."
        );
    });
});
describe("removeUser", () => {
    it("should remove user", async () => {
        const { chat, createdChat, users } = await createChat();
        await groupService.removeUser(users[0].id, chat.id);
        const members = await groupService.getGroupMembers(users[1].id, chat.id);
        let member1 = null;
        for (const member of members) {
            if (member.id == users[0].id) member1 = member;
        }
        expect(member1).toBe(null);
    });

    it("should throw error member doesn't exist", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(groupService.removeUser(-1, chat.id)).rejects.toThrow(
            "ChatParticipant not found."
        );
    });
});
describe("getPermissions", () => {
    it("should get user permissions", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = await groupService.getPermissions(users[0].id, chat.id);

        expect(permissions).toMatchObject({
            canDownload: true,
            canEdit: true,
            canPost: true,
            canDelete: true,
        });
    });

    it("should throw error member doesn't exist", async () => {
        const { chat, createdChat, users } = await createChat();

        await expect(groupService.getPermissions(-1, chat.id)).rejects.toThrow(
            "Participant doesn't exist"
        );
    });
});
describe("setPermissions", () => {
    it("should update user permissions", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = {
            canDownload: false,
            canEdit: true,
            canPost: false,
            canDelete: true,
        };
        await groupService.setPermissions(users[0].id, chat.id, permissions);
        const expectedPermissions = await groupService.getPermissions(users[0].id, chat.id);
        expect(permissions).toMatchObject({ ...expectedPermissions });
    });

    it("should throw error member doesn't exist", async () => {
        const { chat, createdChat, users } = await createChat();
        const permissions = {
            canDownload: false,
            canEdit: true,
            canPost: false,
            canDelete: true,
        };
        await expect(groupService.setPermissions(-1, chat.id, getPermissions)).rejects.toThrow(
            "Participant or group participant not found."
        );
    });
});
describe("getSettings", () => {
    it("should get group settings", async () => {
        const { chat, createdChat, users } = await createChat();
        const settings = await groupService.getSettings(chat.id);
        expect(settings).toMatchObject({ public: false, maxSize: MAX_GROUP_SIZE });
    });

    it("should throw error group doesn't exist", async () => {
        await expect(groupService.getSettings(-1)).rejects.toThrow(
            "Group not found for the specified chatId."
        );
    });
});
describe("deleteGroup", () => {
    it("should delete group", async () => {
        const { chat, createdChat, users } = await createChat();
        await groupService.deleteGroup(chat.id);
        await expect(groupService.getSettings(chat.id)).rejects.toThrow(
            "Group not found for the specified chatId."
        );
    });

    it("should throw error group doesn't exist", async () => {
        await expect(groupService.deleteGroup(-1)).rejects.toThrow(
            "Group not found for the specified chatId."
        );
    });
});
describe("setGroupPrivacy", () => {
    it("should update group privacy", async () => {
        const { chat, createdChat, users } = await createChat();
        const isPrivate = false;
        await groupService.setGroupPrivacy(chat.id, isPrivate);
        const settings = await groupService.getSettings(chat.id);
        expect(settings.public).toBe(!isPrivate);
    });

    it("should throw error group doesn't exist", async () => {
        await expect(groupService.setGroupPrivacy(-1, false)).rejects.toThrow("Group Not Found");
    });
});
describe("updateSizeLimit", () => {
    it("should update group privacy", async () => {
        const { chat, createdChat, users } = await createChat();
        const maxSize = 300;
        await groupService.updateSizeLimit(chat.id, maxSize);
        const settings = await groupService.getSettings(chat.id);
        expect(settings.maxSize).toBe(maxSize);
    });

    it("should throw error group doesn't exist", async () => {
        await expect(groupService.updateSizeLimit(-1, 300)).rejects.toThrow(
            "Group not found for the specified chatId."
        );
    });
});
describe("getSizeLimit", () => {
    it("should update group privacy", async () => {
        const { chat, createdChat, users } = await createChat();
        const maxSize = 300;
        await groupService.updateSizeLimit(chat.id, maxSize);
        const expectedMaxSize = await groupService.getSizeLimit(chat.id);
        expect(expectedMaxSize).toBe(maxSize);
    });

    it("should throw error group doesn't exist", async () => {
        await expect(groupService.getSizeLimit(-1)).rejects.toThrow(
            "Group not found for the specified chatId."
        );
    });
});
