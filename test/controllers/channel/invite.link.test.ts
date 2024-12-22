import jwt from "jsonwebtoken";
import { getClients } from "@socket/web.socket";
import { Socket } from "socket.io";
import { joinChannel } from "@controllers/chat/channel";
import { NextFunction } from "express";
import { displayedUser } from "@services/user/user.service";
import request from "supertest";
import { app, closeApp } from "@src/app";
import * as chatHandler from "@socket/handlers/chat.handlers";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/channel.service.ts");
jest.mock("@services/user/user.service.ts");
jest.mock("jsonwebtoken");
jest.mock("@socket/web.socket.ts");
jest.mock("@socket/handlers/chat.handlers.ts");
jest.mock("@controllers/chat/channel.ts");
afterAll(async () => {
    await closeApp();
});

describe("Invite Link", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add user to channel via invite link", async () => {
        const participants = [1, 2, 3];
        const userChat = {};
        (joinChannel as jest.Mock).mockResolvedValue({
            participants,
            userChat,
        });
        const mockDecoded = { chatId: 1 };
        const sockets = new Map([[1, { id: "socket1" } as Socket]]);
        const user = {};
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
        (getClients as jest.Mock).mockReturnValue(sockets);
        (displayedUser as jest.Mock).mockReturnValue(user);
        (chatHandler.broadCast as jest.Mock).mockReturnValue({ undefined });

        const response = await request(app).get(`/api/channels/invite?token=token`).send();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(mockDecoded);
    });
    it("should redirect to home page", async () => {
        const participants = [1, 2, 3];
        const userChat = {};
        (joinChannel as jest.Mock).mockResolvedValue({
            participants,
            userChat,
        });
        const mockDecoded = { chatId: 1 };
        const sockets = new Map([[1, { id: "socket1" } as Socket]]);
        const user = {};
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
        (getClients as jest.Mock).mockReturnValue(sockets);
        (displayedUser as jest.Mock).mockReturnValue(user);
        (chatHandler.broadCast as jest.Mock).mockReturnValue({ undefined });

        const response = await request(app).get(`/api/channels/invite`).send();

        expect(response.status).toBe(302);
    });
    it("should redirect to home page", async () => {
        const participants = [1, 2, 3];
        const userChat = {};
        (joinChannel as jest.Mock).mockResolvedValue({
            participants,
            userChat,
        });
        const mockDecoded = { chatId: 1 };
        const sockets = null;
        const user = {};
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
        (getClients as jest.Mock).mockReturnValue(sockets);
        (displayedUser as jest.Mock).mockReturnValue(user);
        (chatHandler.broadCast as jest.Mock).mockReturnValue({ undefined });

        const response = await request(app).get(`/api/channels/invite?token=token`).send();

        expect(response.status).toBe(302);
    });
});
