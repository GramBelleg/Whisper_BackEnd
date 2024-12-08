import db from "@DB";
import * as chatService from "@services/chat/chat.service";
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
});
