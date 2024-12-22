import request from "supertest";
import { app, closeApp } from "@src/app";
import * as channelHandler from "@socket/handlers/channel.handlers";
import { getPermissions, isAdmin } from "@services/chat/channel.service";
import { NextFunction } from "express";
import { _ } from "@faker-js/faker/dist/airline-BnpeTvY9";

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

describe("handlePinPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to pin", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await channelHandler.handlePinPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw you cant pin", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(channelHandler.handlePinPermissions(1, 3)).rejects.toThrow(
            "You don't have pin permission"
        );
    });
});
describe("handleCommentPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to comment", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canComment: true,
        });

        const response = await channelHandler.handleCommentPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw couldnt get user permissions", async () => {
        (getPermissions as jest.Mock).mockResolvedValue(null);

        await expect(channelHandler.handleCommentPermissions(1, 3)).rejects.toThrow(
            "Couldn't get User Permissions"
        );
    });
    it("should throw you dont have comment permission", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canComment: false,
        });

        await expect(channelHandler.handleCommentPermissions(1, 3)).rejects.toThrow(
            "You don't have comment permission"
        );
    });
});
describe("handlePostPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to post", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await channelHandler.handlePostPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw you cant post", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(channelHandler.handlePostPermissions(1, 3)).rejects.toThrow(
            "You don't have post permission"
        );
    });
});
