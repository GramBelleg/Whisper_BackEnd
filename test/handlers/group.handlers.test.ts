import request from "supertest";
import { app, closeApp } from "@src/app";
import * as groupHandler from "@socket/handlers/group.handlers";
import { getPermissions, isAdmin } from "@services/chat/group.service";
import { NextFunction } from "express";
import { _ } from "@faker-js/faker/dist/airline-BnpeTvY9";

jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
    };
});
jest.mock("@services/chat/group.service.ts");

afterAll(async () => {
    await closeApp();
});
describe("handleDeletePermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to delete", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canDelete: true,
        });

        const response = await groupHandler.handleDeletePermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw couldnt get user permissions", async () => {
        (getPermissions as jest.Mock).mockResolvedValue(null);

        await expect(groupHandler.handleDeletePermissions(1, 3)).rejects.toThrow(
            "Couldn't get User Permissions"
        );
    });
    it("should throw you dont have delete permission", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canDelete: false,
        });

        await expect(groupHandler.handleDeletePermissions(1, 3)).rejects.toThrow(
            "You don't have delete permission"
        );
    });
});
describe("handlePinPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to pin", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await groupHandler.handlePinPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw you cant pin", async () => {
        (isAdmin as jest.Mock).mockResolvedValue(false);

        await expect(groupHandler.handlePinPermissions(1, 3)).rejects.toThrow(
            "You don't have pin permission"
        );
    });
});
describe("handleEditPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to edit", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canEdit: true,
        });

        const response = await groupHandler.handleEditPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw couldnt get user permissions", async () => {
        (getPermissions as jest.Mock).mockResolvedValue(null);

        await expect(groupHandler.handleEditPermissions(1, 3)).rejects.toThrow(
            "Couldn't get User Permissions"
        );
    });
    it("should throw you dont have edit permission", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canEdit: false,
        });

        await expect(groupHandler.handleEditPermissions(1, 3)).rejects.toThrow(
            "You don't have edit permission"
        );
    });
});
describe("handlePostPermissions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should allow user to post", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canPost: true,
        });

        const response = await groupHandler.handlePostPermissions(1, 3);

        expect(response).toBe(undefined);
    });
    it("should throw couldnt get user permissions", async () => {
        (getPermissions as jest.Mock).mockResolvedValue(null);

        await expect(groupHandler.handlePostPermissions(1, 3)).rejects.toThrow(
            "Couldn't get User Permissions"
        );
    });
    it("should throw you dont have post permission", async () => {
        (getPermissions as jest.Mock).mockResolvedValue({
            canPost: false,
        });

        await expect(groupHandler.handlePostPermissions(1, 3)).rejects.toThrow(
            "You don't have post permission"
        );
    });
});
