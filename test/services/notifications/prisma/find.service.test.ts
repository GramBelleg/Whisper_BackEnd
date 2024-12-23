import HttpError from '@src/errors/HttpError';
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import db from "@src/prisma/PrismaClient";
import { findDeviceTokens, findUnmutedDMUsers, findUnmutedGroupUsers, findUnmutedChannelUsers } from '@src/services/notifications/prisma/find.service';

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

describe("test find unmuted DM users prisma query", () => {
    it("should find unmuted DM users successfully", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await db.chat.create({
            data: {
                type: 'DM',
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: chat.id,
                isMuted: false,
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: chat.id,
                isMuted: true,
            },
        });
        const users = await findUnmutedDMUsers([user.id, user2.id], chat.id);
        expect(users).toEqual([user.id]);
    });

    it("should not find any unmuted DM users", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const chat = await db.chat.create({
            data: {
                type: 'DM',
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: chat.id,
                isMuted: true,
            },
        });
        await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: chat.id,
                isMuted: true,
            },
        });
        const users = await findUnmutedDMUsers([user.id, user2.id], chat.id);
        expect(users).toEqual([]);
    });

    it("should not find any users", async () => {
        const users = await findUnmutedDMUsers([], undefined as any);
        expect(users).toEqual([]);
    });
});

describe("test find unmuted group users prisma query", () => {
    it("should find unmuted group users successfully", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const group = await db.group.create({
            data: {
                chat: {
                    create: {
                        type: 'GROUP',
                    },
                },
                name: "group",
                maxSize: 10,
            },
        });
        const chatParticipant1 = await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: group.chatId,
                isMuted: false,
            },
        });
        const chatParticipant2 = await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: group.chatId,
                isMuted: true,
            },
        });
        await db.groupParticipant.create({
            data: {
                id: chatParticipant1.id,
            },
        });
        await db.groupParticipant.create({
            data: {
                id: chatParticipant2.id,
            },
        });
        const users = await findUnmutedGroupUsers([user.id, user2.id], group.chatId);
        expect(users).toEqual({ unmutedUsers: [user.id], groupName: "group" });
    });

    it("should not find any unmuted group users", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const group = await db.group.create({
            data: {
                chat: {
                    create: {
                        type: 'GROUP',
                    },
                },
                name: "group",
                maxSize: 10,
            },
        });
        const chatParticipant1 = await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: group.chatId,
                isMuted: true,
            },
        });
        const chatParticipant2 = await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: group.chatId,
                isMuted: true,
            },
        });
        await db.groupParticipant.create({
            data: {
               id: chatParticipant1.id,
            },
        });
        await db.groupParticipant.create({
            data: {
                id: chatParticipant2.id,
            },
        });
        const users = await findUnmutedGroupUsers([user.id, user2.id], group.chatId);
        expect(users).toEqual({ unmutedUsers: [], groupName: "" });
    });
});

describe("test find unmuted channel users prisma query", () => {
    it("should find unmuted channel users successfully", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const channel = await db.channel.create({
            data: {
                chat: {
                    create: {
                        type: 'CHANNEL',
                    },
                },
                inviteLink: "inviteLink",
                name: "channel",
            },
        });
        const chatParticipant1 = await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: channel.chatId,
                isMuted: false,
            },
        });
        const chatParticipant2 = await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: channel.chatId,
                isMuted: true,
            },
        });
        await db.channelParticipant.create({
            data: {
                id: chatParticipant1.id,
            },
        });
        await db.channelParticipant.create({
            data: {
                id: chatParticipant2.id,
            },
        });
        const users = await findUnmutedChannelUsers([user.id, user2.id], channel.chatId);
        expect(users).toEqual([user.id]);
    });

    it("should not find any unmuted channel users", async () => {
        const user = await createRandomUser();
        const user2 = await createRandomUser();
        const channel = await db.channel.create({
            data: {
                chat: {
                    create: {
                        type: 'CHANNEL',
                    },
                },
                inviteLink: "inviteLink",
                name: "channel",
            },
        });
        const chatParticipant1 = await db.chatParticipant.create({
            data: {
                userId: user.id,
                chatId: channel.chatId,
                isMuted: true,
            },
        });
        const chatParticipant2 = await db.chatParticipant.create({
            data: {
                userId: user2.id,
                chatId: channel.chatId,
                isMuted: true,
            },
        });
        await db.channelParticipant.create({
            data: {
                id: chatParticipant1.id,
            },
        });
        await db.channelParticipant.create({
            data: {
               id: chatParticipant2.id,
            },
        });
        const users = await findUnmutedChannelUsers([user.id, user2.id], channel.chatId);
        expect(users).toEqual([]);
    });
});