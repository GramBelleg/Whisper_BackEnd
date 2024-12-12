import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";

describe("createChat", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should create a new DM chat with participants", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const userIds = [user1.id, user2.id];
        const chatType = "DM";

        const chat = await chatService.createChat(userIds, user1.id, null, chatType);

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: chatType });
    });

    //it should throw an error
    it("should create a group chat with no participants initially", async () => {
        const user1 = await createRandomUser();
        const userIds: number[] = [];
        const chatType = "GROUP";

        const chat = await chatService.createChat(userIds, user1.id, null, chatType);

        expect(chat).toHaveProperty("id");

        const savedChat = await db.chat.findUnique({ where: { id: chat.id } });
        expect(savedChat).toMatchObject({ id: chat.id, type: chatType });
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
