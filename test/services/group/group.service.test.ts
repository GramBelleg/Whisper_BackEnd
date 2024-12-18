import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { ChatType } from "@prisma/client";

describe("createChat", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should create a new group chat with participants", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const userIds = [user1.id, user2.id];
        const chatType: ChatType = "GROUP";
        const createdChat = {
            users: userIds,
            senderKey: null,
            type: chatType,
            name: "group name",
            picture: "picture",
        };
        const chat = await chatService.createChat(userIds, user1.id, null, chatType);
        const group = await groupService.createGroup(
            chat.id,
            chat.participants,
            createdChat,
            user1.id
        );

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: chatType });
    });

    //it should throw an error
    it("should throw error no particiapnts found", async () => {
        const user1 = await createRandomUser();
        const userIds: number[] = [];
        const chatType = "GROUP";

        await expect(chatService.createChat(userIds, user1.id, null, chatType)).rejects.toThrow;
    });

    it("should handle creating a chat with a senderKey", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const userIds = [user1.id, user2.id];
        const publicKey = await db.publicKey.create({
            data: {
                userId: user1.id,
                key: "some-public-key",
            },
        });
        const senderKey = publicKey.id;
        const chatType = "DM";

        const chat = await chatService.createChat(userIds, user1.id, senderKey, chatType);

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: chatType });
    });

    it("should handle duplicate participant IDs", async () => {
        const user1 = await createRandomUser();
        const userIds = [user1.id, user1.id];
        const chatType = "DM";

        await expect(chatService.createChat(userIds, user1.id, null, chatType)).rejects.toThrow();
    });
});
