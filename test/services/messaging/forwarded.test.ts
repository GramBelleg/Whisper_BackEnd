import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { User } from "@prisma/client";
import db from "@DB";
import { getForwardedFromMessage } from "@services/chat/message.service";

describe("forwardMessages", () => {
    let user1: User, user2: User, chat: { id: number };

    beforeEach(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
    });

    afterAll(async () => {
        db.$disconnect();
    });

    it("should return null when message is not forwarded", async () => {
        const result = await getForwardedFromMessage(false, user1.id);
        expect(result).toBeNull();
    });

    it("should return user details when message is forwarded", async () => {
        const result = await getForwardedFromMessage(true, user1.id);
        expect(result).toEqual({
            id: user1.id,
            userName: user1.userName,
            profilePic: user1.profilePic,
        });
    });

    it("should return null when userId is not found", async () => {
        const result = await getForwardedFromMessage(true, 999999);
        expect(result).toBeNull();
    });
});
