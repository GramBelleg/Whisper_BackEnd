import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";
import * as searchService from "@services/search/search.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { ChatType } from "@prisma/client";
import { clearDB } from "@src/prisma/clear";
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
describe("getMembers", () => {
    it("should get members in a chat given a search query", async () => {
        const { chat, createdChat, users } = await createChat();

        const members = await searchService.getMembers(users[0].id, chat.id, users[0].userName);
        expect(members[0]).toMatchObject({
            id: users[0].id,
            userName: users[0].userName,
            profilePic: users[0].profilePic,
            hasStory: false,
            lastSeen: users[0].lastSeen,
            status: users[0].status,
        });
    });
});
describe("getGroups", () => {
    it("should get all public groups given a search query", async () => {
        const { chat, createdChat, users } = await createChat();

        const chats = await searchService.getGroups(users[0].id, createdChat.name);
        expect(chats[0]).toMatchObject({
            id: chat.id,
            name: createdChat.name,
            picture: createdChat.picture,
            type: createdChat.type,
        });
    });
});
