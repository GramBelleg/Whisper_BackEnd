import request from "supertest";
import { app, closeApp } from "@src/app";
import * as channelService from "@services/chat/channel.service";
import * as groupService from "@services/chat/group.service";
import * as channelController from "@controllers/chat/channel";
import * as chatService from "@services/chat/chat.service";
import * as groupController from "@controllers/chat/group.chat";
import { NextFunction } from "express";
import * as validators from "@validators/chat";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/group.service.ts");
jest.mock("@services/chat/channel.service.ts");
jest.mock("@services/chat/chat.service.ts");
jest.mock("@validators/chat.ts");
afterAll(async () => {
    await closeApp();
});
describe("remove user", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should remove user from channel", async () => {
        (groupService.removeUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);
        (channelService.getAdmins as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await channelController.removeUser(1, { id: 2 }, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (channelService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(channelController.removeUser(1, { id: 2 }, 3)).rejects.toThrow(
            "You're not an admin"
        );
    });
});
describe("add admin", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add admin to channel", async () => {
        (channelService.addAdmin as jest.Mock).mockResolvedValue({
            undefined,
        });
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);
        (channelService.getAdmins as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await channelController.addAdmin(1, { userId: 2, chatId: 3 });

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (channelService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(channelController.addAdmin(1, { userId: 2, chatId: 3 })).rejects.toThrow(
            "You're not an admin"
        );
    });
});
describe("delete channel", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should delete channel", async () => {
        (groupService.deleteGroup as jest.Mock).mockResolvedValue({
            undefined,
        });
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await channelController.deleteChannel(1, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (channelService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(channelController.deleteChannel(1, 3)).rejects.toThrow("You're not an admin");
    });
});
describe("leave channel", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should leave channel", async () => {
        (groupService.removeUser as jest.Mock).mockResolvedValue(true);
        (channelService.getAdmins as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await channelController.leaveChannel(1, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
});
describe("add user", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add user to channel", async () => {
        (validators.canUserBeAddedToChannel as jest.Mock).mockResolvedValue(true);
        (channelService.addUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (channelService.getAdmins as jest.Mock).mockResolvedValue([1, 2, 3]);
        (chatService.getChat as jest.Mock).mockResolvedValue(null);
        const chatUser = {
            user: { id: 2, userName: "name" },
            chatId: 3,
        };
        const { participants, userChat } = await channelController.addUser(1, chatUser);
        expect(participants).toStrictEqual([1, 2, 3, chatUser.user.id]);
        expect(userChat).toBe(null);
    });
    it("should throw user can't be added", async () => {
        (validators.canUserBeAddedToChannel as jest.Mock).mockResolvedValue(false);
        (channelService.addUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);
        (chatService.getChat as jest.Mock).mockResolvedValue(null);
        const chatUser = {
            user: { id: 2, userName: "name" },
            chatId: 3,
        };
        await expect(channelController.addUser(1, chatUser)).rejects.toThrow(
            "You Don't have permission to add this user"
        );
    });
});
