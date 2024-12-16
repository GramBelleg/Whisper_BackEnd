import { createRandomUser } from "@services/auth/prisma/create.service";
import { createChat } from "@services/chat/chat.service";
import { Message, User } from "@prisma/client";
import db from "@DB";
import { editMessage } from "@services/chat/message.service";

describe("saveMessage", () => {
    let user1: User, user2: User, chat: { id: number }, message: Message;

    beforeEach(async () => {
        user1 = await createRandomUser();
        user2 = await createRandomUser();
        chat = await createChat([user1.id, user2.id], user1.id, null, "DM");
        message = await db.message.create({
            data: {
                chatId: chat.id,
                content: "Hello @user2",
                senderId: user1.id,
                sentAt: new Date(),
                type: "TEXT",
            },
        });
    });

    afterAll(async () => {
        db.$disconnect();
    });

    it("should edit a message successfulyy", async () => {
        await editMessage(message.id, "New Message");
        const updatedMessage = await db.message.findUnique({
            where: { id: message.id },
        });
        expect(updatedMessage!.content).toEqual("New Message");
    });
});
