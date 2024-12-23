import request from "supertest";
import { app, closeApp } from "@src/app";
import * as groupService from "@services/chat/group.service";
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
jest.mock("@services/chat/chat.service.ts");
jest.mock("@validators/chat.ts");
afterAll(async () => {
    await closeApp();
});
describe("remove user", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should remove user from group", async () => {
        (groupService.removeUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (groupService.isAdmin as jest.Mock).mockResolvedValue(true);
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await groupController.removeUser(1, { id: 2 }, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (groupService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(groupController.removeUser(1, { id: 2 }, 3)).rejects.toThrow(
            "You're not an admin"
        );
    });
});
describe("add admin", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add admin to group", async () => {
        (groupService.addAdmin as jest.Mock).mockResolvedValue({
            undefined,
        });
        (groupService.isAdmin as jest.Mock).mockResolvedValue(true);
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await groupController.addAdmin(1, { userId: 2, chatId: 3 });

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (groupService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(groupController.addAdmin(1, { userId: 2, chatId: 3 })).rejects.toThrow(
            "You're not an admin"
        );
    });
});
describe("delete group", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should delete group", async () => {
        (groupService.deleteGroup as jest.Mock).mockResolvedValue({
            undefined,
        });
        (groupService.isAdmin as jest.Mock).mockResolvedValue(true);
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await groupController.deleteGroup(1, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
    it("should throw not an admin", async () => {
        (groupService.isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(groupController.deleteGroup(1, 3)).rejects.toThrow("You're not an admin");
    });
});
describe("leave group", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should leave group", async () => {
        (groupService.removeUser as jest.Mock).mockResolvedValue(true);
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);

        const participants = await groupController.leaveGroup(1, 3);

        expect(participants).toStrictEqual([1, 2, 3]);
    });
});
describe("add user", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add user to group", async () => {
        (validators.canUserBeAdded as jest.Mock).mockResolvedValue(true);
        (groupService.addUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);
        (groupService.getSizeLimit as jest.Mock).mockResolvedValue(40);
        (chatService.getChat as jest.Mock).mockResolvedValue(null);
        const chatUser = {
            user: { id: 2, userName: "name" },
            chatId: 3,
        };
        const { participants, userChat } = await groupController.addUser(1, chatUser);
        expect(participants).toStrictEqual([1, 2, 3, chatUser.user.id]);
        expect(userChat).toBe(null);
    });
    it("should throw user can't be added", async () => {
        (validators.canUserBeAdded as jest.Mock).mockResolvedValue(false);
        (groupService.addUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);
        (groupService.getSizeLimit as jest.Mock).mockResolvedValue(40);
        (chatService.getChat as jest.Mock).mockResolvedValue(null);
        const chatUser = {
            user: { id: 2, userName: "name" },
            chatId: 3,
        };
        await expect(groupController.addUser(1, chatUser)).rejects.toThrow(
            "You Don't have permission to add this user"
        );
    });
    it("should throw group size limit reached", async () => {
        (validators.canUserBeAdded as jest.Mock).mockResolvedValue(true);
        (groupService.addUser as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatParticipantsIds as jest.Mock).mockResolvedValue([1, 2, 3]);
        (groupService.getSizeLimit as jest.Mock).mockResolvedValue(3);
        (chatService.getChat as jest.Mock).mockResolvedValue(null);
        const chatUser = {
            user: { id: 2, userName: "name" },
            chatId: 3,
        };
        await expect(groupController.addUser(1, chatUser)).rejects.toThrow(
            "Can't Add User, Group size limit reached"
        );
    });
});
