import request from "supertest";
import { app, closeApp } from "@src/app";
import * as channelService from "@services/chat/channel.service";
import { NextFunction } from "express";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/channel.service.ts");
afterAll(async () => {
    await closeApp();
});
describe("Get user permissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get permissions of channel participant", async () => {
        (channelService.getPermissions as jest.Mock).mockResolvedValue({
            canDownload: true,
            canComment: true,
        });

        const response = await request(app).get(`/api/channels/1/1/permissions`).send();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            canDownload: true,
            canComment: true,
        });
    });
    it("should throw invalid userId", async () => {
        const response = await request(app).get(`/api/channels/1/0/permissions`).send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Invalid user id");
    });
    it("should throw invalid chatId", async () => {
        const response = await request(app).get(`/api/channels/0/1/permissions`).send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Invalid chat id");
    });
});
describe("SetPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set permissions of a channel participant", async () => {
        (channelService.setPermissions as jest.Mock).mockResolvedValue({ undefined });
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await request(app).post(`/api/channels/1/1/permissions`).send({
            canDownload: true,
            canComment: true,
        });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            message: "User Permissions Updated Successfully",
        });
    });
    it("should throw not an admin", async () => {
        (channelService.isAdmin as jest.Mock).mockResolvedValue(false);

        const response = await request(app).post(`/api/channels/1/1/permissions`).send({
            canDownload: true,
            canComment: true,
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("You're not an admin");
    });
    it("should throw invalid chatId", async () => {
        const response = await request(app).post(`/api/channels/0/1/permissions`).send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("chatId missing");
    });
    it("should throw invalid userId", async () => {
        const response = await request(app).post(`/api/channels/1/0/permissions`).send();

        expect(response.status).toBe(404);

        expect(response.body.message).toBe("userId missing");
    });
    it("should throw invalid permissions", async () => {
        (channelService.isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await request(app).post(`/api/channels/1/1/permissions`).send();

        expect(response.status).toBe(404);

        expect(response.body.message).toBe("missing permissions");
    });
});
