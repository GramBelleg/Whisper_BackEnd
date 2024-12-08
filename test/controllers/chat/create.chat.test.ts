import { handleCreateChat } from "@controllers/chat/create.chat";
import { createChat, getChat } from "@services/chat/chat.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { CreatedChat } from "@models/chat.models";

jest.mock("@services/chat/chat.service");

describe("handleCreateChat", () => {
    it("should create a chat and return chat summaries for all users", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const users = [user1.id, user2.id];

        const createdChat = { id: 123 };
        const chatSummary1 = { id: user1.id, chatId: createdChat.id, name: "Chat1" };
        const chatSummary2 = { id: user2.id, chatId: createdChat.id, name: "Chat2" };

        (createChat as jest.Mock).mockResolvedValue(createdChat);
        (getChat as jest.Mock).mockImplementation((userId) => {
            if (userId === user1.id) return Promise.resolve(chatSummary1);
            if (userId === user2.id) return Promise.resolve(chatSummary2);
        });

        const chatPayload: CreatedChat = {
            users,
            senderKey: 12345,
            type: "DM",
        };

        const result = await handleCreateChat(user1.id, chatPayload, users);

        expect(result).toBeInstanceOf(Array);
        expect(result?.length).toBe(2);

        result?.forEach((chat: any) => {
            expect(chat).toHaveProperty("id");
            expect(chat).toHaveProperty("chatId");
            expect(chat).toHaveProperty("name");
        });

        expect(createChat).toHaveBeenCalledWith(
            users,
            user1.id,
            chatPayload.senderKey,
            chatPayload.type
        );
        expect(createChat).toHaveBeenCalledTimes(1);
        expect(getChat).toHaveBeenCalledTimes(2);
        users.forEach((user) => {
            expect(getChat).toHaveBeenCalledWith(user, createdChat.id);
        });
    });

    it("should return null if creating a chat fails", async () => {
        const user1 = await createRandomUser();
        const users = [user1.id];

        (createChat as jest.Mock).mockRejectedValue(new Error("Database Error"));

        const chatPayload: CreatedChat = {
            users,
            senderKey: 12345,
            type: "DM",
        };

        const result = await handleCreateChat(user1.id, chatPayload, users);

        expect(result).toBeNull();
    });

    it("should throw an error if the user is not in the users list", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const user3 = await createRandomUser();
        const users = [user2.id, user3.id];

        const chatPayload: CreatedChat = {
            users,
            senderKey: 12345,
            type: "DM",
        };

        await expect(handleCreateChat(user1.id, chatPayload, users)).resolves.toBeNull();
    });

    it("should throw an error if the users list contains duplicates", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const users = [user1.id, user2.id, user1.id];

        const chatPayload: CreatedChat = {
            users,
            senderKey: 12345,
            type: "DM",
        };

        await expect(handleCreateChat(user1.id, chatPayload, users)).resolves.toBeNull();
    });
});
