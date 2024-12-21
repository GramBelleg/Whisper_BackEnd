import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("getChat", () => {
    afterAll(async () => {
        await db.$disconnect();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch a chat by ID", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const fetchedChat = await chatService.getChat(user1.id, chat.id);
        expect(fetchedChat).toHaveProperty("id", chat.id);
        expect(fetchedChat).toHaveProperty("type", "DM");
    });

    it("should return null if the chat does not exist", async () => {
        const user1 = await createRandomUser();
        const invalidChatId = 9999;

        await expect(chatService.getChat(user1.id, invalidChatId)).resolves.toBeNull();
    });

    it("should return null if the user doesn't exist in a certain chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user2.id], user2.id, null, "DM");

        await expect(chatService.getChat(user1.id, chat.id)).resolves.toBeNull();
    });
});
