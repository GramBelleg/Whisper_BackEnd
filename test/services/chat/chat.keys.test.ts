import db from "@DB";
import * as chatService from "@services/chat/chat.service";
import * as encryptionService from "@services/chat/encryption.service";
import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";

describe("chatKeys", () => {
    afterAll(async () => {
        await db.$disconnect();
    });

    it("should fetch chat keys for a chat", async () => {
        const user1 = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

        const keys = await chatService.getChatKeys(chat.id);

        expect(keys).toHaveLength(2);
    });

    describe("createUserKey", () => {
        it("should create a user key", async () => {
            const user = await createRandomUser();
            const key = "user_key_12345";
            const keyId = await encryptionService.createUserKey(user.id, key);

            const createdKey = await db.publicKey.findUnique({
                where: { id: keyId },
            });

            expect(createdKey).toBeTruthy();
            expect(createdKey?.key).toBe(key);
            expect(createdKey?.userId).toBe(user.id);
        });
    });

    describe("getUserKey", () => {
        it("should fetch the user key by ID", async () => {
            const user = await createRandomUser();
            const key = "user_key_12345";
            const keyId = await encryptionService.createUserKey(user.id, key);

            const fetchedKey = await encryptionService.getUserKey(keyId);

            expect(fetchedKey).toBe(key);
        });

        it("should return an empty string if no key is found", async () => {
            const invalidKeyId = 9999;
            const fetchedKey = await encryptionService.getUserKey(invalidKeyId);

            expect(fetchedKey).toBe("");
        });
    });

    describe("associateParticipantKey", () => {
        it("should associate a key with a chat participant", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

            const key = "user_key_12345";
            const keyId = await encryptionService.createUserKey(user1.id, key);

            await encryptionService.associateParticipantKey(user1.id, chat.id, keyId);

            const participant = await db.chatParticipant.findUnique({
                where: {
                    chatId_userId: { chatId: chat.id, userId: user1.id },
                },
            });

            expect(participant?.keyId).toBe(keyId);
        });

        it("should throw an error if the user or chat does not exist", async () => {
            const invalidUserId = 9999;
            const invalidChatId = 9999;
            const keyId = 1;

            await expect(
                encryptionService.associateParticipantKey(invalidUserId, invalidChatId, keyId)
            ).resolves.not.toThrow();
        });
    });

    describe("getOtherUserKey", () => {
        it("should return the other user's key in a chat", async () => {
            const user1 = await createRandomUser();
            const user2 = await createRandomUser();
            const chat = await createChat([user1.id, user2.id], user1.id, null, "DM");

            const key1 = "user_key_12345";
            const keyId1 = await encryptionService.createUserKey(user1.id, key1);
            const key2 = "user_key_67890";
            const keyId2 = await encryptionService.createUserKey(user2.id, key2);

            await encryptionService.associateParticipantKey(user1.id, chat.id, keyId1);
            await encryptionService.associateParticipantKey(user2.id, chat.id, keyId2);

            const otherUserKey = await encryptionService.getOtherUserKey(user1.id, chat.id);

            expect(otherUserKey).toBe(key2);
        });

        it("should return an empty string if no other user is found", async () => {
            const user1 = await createRandomUser();
            const invalidChatId = 9999;

            const otherUserKey = await encryptionService.getOtherUserKey(user1.id, invalidChatId);

            expect(otherUserKey).toBe("");
        });
    });
});
