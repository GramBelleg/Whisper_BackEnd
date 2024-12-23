import request from "supertest";
import { app, closeApp } from "@src/app";
import * as channelService from "@services/chat/channel.service";
import { NextFunction } from "express";
import { getChannelMembers } from "@controllers/chat/channel";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/channel.service.ts");
jest.mock("jsonwebtoken");
jest.mock("@socket/web.socket.ts");

afterAll(async () => {
    await closeApp();
});
describe("Get channel settings", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get settings of a channel", async () => {
        (channelService.getSettings as jest.Mock).mockResolvedValue({
            inviteLink: "link",
            public: false,
        });

        const response = await request(app).get(`/api/channels/1/settings`).send();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ inviteLink: "link", public: false });
    });
});
describe("Get channel members", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get members of a channel", async () => {
        const expectedMembers = [{ id: 32 }];
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);
        (channelService.getChannelMembers as jest.Mock).mockResolvedValue(expectedMembers);

        const members = await getChannelMembers(1, 3);

        expect(members).toMatchObject(expectedMembers);
    });
    it("should throw error not an admin", async () => {
        const expectedMembers = [{ id: 32 }];
        (channelService.isAdmin as jest.Mock).mockResolvedValue(false);
        (channelService.getChannelMembers as jest.Mock).mockResolvedValue(expectedMembers);

        await expect(getChannelMembers(1, 3)).rejects.toThrow("You're not an admin");
    });
});
