import HttpError from '@src/errors/HttpError';
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import db from "@src/prisma/PrismaClient";
import { ChatType } from '@prisma/client';
import { findDeviceTokens, findUnperviewedMessageUsers, findUserIdsByUsernames, findUnmutedUsers, findChatName } from '@src/services/notifications/prisma/find.service';

describe("test find device tokens prisma query", () => {
    it("should find device tokens successfully", async () => {
        const user = await createRandomUser();
        await db.userToken.create({
            data: {
                userId: user.id,
                token: "token",
                deviceToken: "deviceToken",
                expireAt: new Date(Date.now() + 1000 * 60 * 60),
            },
        });
        const deviceToken = await findDeviceTokens([user.id]);
        expect(deviceToken[0].deviceToken).toEqual("deviceToken");
    });

    it("should not find any device tokens", async () => {
        const deviceToken = await findDeviceTokens([1]);
        expect(deviceToken).toEqual([]);
    });

    it("should not find any device tokens if the token is expired", async () => {
        const user = await createRandomUser();
        await db.userToken.create({
            data: {
                userId: user.id,
                token: "token",
                deviceToken: "deviceToken",
                expireAt: new Date(Date.now() - 1000 * 60 * 60),
            },
        });
        const deviceToken = await findDeviceTokens([user.id]);
        expect(deviceToken).toEqual([]);
    });
});

describe("test find unperviewed message users prisma query", () => {
    it("should find unperviewed message users successfully", async () => {
        const user = await createRandomUser();
        await db.user.update({
            where: { id: user.id },
            data: { messagePreview: false },
        });
        const users = await findUnperviewedMessageUsers([user.id]);
        expect(users[0]).toEqual(user.id);
    });

    it("should not find any unperviewed message users", async () => {
        const user = await createRandomUser();
        const users = await findUnperviewedMessageUsers([user.id]);
        expect(users).toEqual([]);
    });
});

describe("test find user ids by usernames prisma query", () => {
    it("should find user ids by usernames successfully", async () => {
        const user = await createRandomUser();
        const users = await findUserIdsByUsernames([user.userName]);
        expect(users[0]).toEqual(user.id);
    });

    it("should not find any user ids by usernames", async () => {
        const users = await findUserIdsByUsernames(["username"]);
        expect(users).toEqual([]);
    });
});

describe("test find unmuted users prisma query", () => {
    it("should find unmuted users successfully", async () => {
        const user = await createRandomUser();
        const chat = await db.chat.create({
            data: {
                type: ChatType.CHANNEL,
                channel: {
                    create: {
                        name: 'chat'
                    }
                }
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: chat.id,
                isMuted: false,
            },
        });
        const users = await findUnmutedUsers([user.id], chat.id, "CHANNEL");
        expect(users[0]).toEqual(user.id);
    });

    it("should not find any unmuted users", async () => {
        const user = await createRandomUser();
        const chat = await db.chat.create({
            data: {
                type: ChatType.GROUP,
                group: {
                    create: {
                        name: 'chat'
                    }
                }
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: chat.id,
                isMuted: true,
            },
        });
        const users = await findUnmutedUsers([user.id], chat.id, "CHANNEL");
        expect(users).toEqual([]);
    });

    it("should not find any unmuted users if the chat type is not correct", async () => {
        const user = await createRandomUser();
        const chat = await db.chat.create({
            data: {
                type: ChatType.GROUP,
                group: {
                    create: {
                        name: 'chat'
                    }
                }
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: chat.id,
                isMuted: false,
            },
        });
        const users = await findUnmutedUsers([user.id], chat.id, "CHANNEL");
        expect(users).toEqual([]);
    });
});

describe("test find chat name prisma query", () => {
    it("should find chat name successfully", async () => {
        const chat = await db.chat.create({
            data: {
                type: ChatType.CHANNEL,
                channel: {
                    create: {
                        name: 'chat'
                    }
                }
            },
        });
        const chatName = await findChatName(chat.id, "CHANNEL");
        expect(chatName.channelName).toEqual("chat");
    });

    it("should not find any chat name", async () => {
        const chatName = await findChatName(1, "CHANNEL");
        expect(chatName).toEqual({});
    });
});