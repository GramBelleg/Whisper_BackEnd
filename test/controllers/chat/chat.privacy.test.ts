import request from "supertest";
import { app, closeApp } from "@src/app";
import * as groupService from "@services/chat/group.service";
import * as channelService from "@services/chat/channel.service";
import * as chatService from "@services/chat/chat.service";
import { NextFunction } from "express";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/group.service.ts");
jest.mock("@services/chat/chat.service.ts");
jest.mock("@services/chat/channel.service.ts");
afterAll(async () => {
    await closeApp();
});
describe("setChatPrivacy", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set privacy of a group", async () => {
        (groupService.setGroupPrivacy as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatType as jest.Mock).mockResolvedValue("GROUP");

        const response = await request(app).post(`/api/chats/1/privacy`).send({ isPrivate: false });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            message: "Chat Privacy updated successfully",
        });
    });
    it("should set privacy of a channel", async () => {
        (channelService.setChannelPrivacy as jest.Mock).mockResolvedValue({
            undefined,
        });
        (chatService.getChatType as jest.Mock).mockResolvedValue("CHANNEL");

        const response = await request(app).post(`/api/chats/1/privacy`).send({ isPrivate: false });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            message: "Chat Privacy updated successfully",
        });
    });
    it("should throw missing chatId", async () => {
        const response = await request(app).post(`/api/chats/0/privacy`).send({ isPrivate: false });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("chatId missing");
    });
    it("should throw missing privacy setting", async () => {
        const response = await request(app).post(`/api/chats/1/privacy`).send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("privacy setting is missing");
    });
});
