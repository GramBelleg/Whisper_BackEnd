import request from "supertest";
import { Request, Response, NextFunction } from "express";
import { faker } from "@faker-js/faker";
import HttpError from "@src/errors/HttpError";
import app from "@src/app";
import { findBlockedUsers } from "@services/user/prisma/find.service";
import { checkUsersExistDB, checkUserExistUsers } from "@services/user/block.service";
import { updateBlockOfRelates } from "@services/user/prisma/update.service";
import { createRelates } from "@services/user/prisma/create.service";
import { validateBlockData } from "@validators/user";

jest.mock("@services/user/prisma/find.service");
jest.mock("@services/user/block.service");
jest.mock("@services/user/prisma/update.service");
jest.mock("@services/user/prisma/create.service");
jest.mock("@validators/user");

// mock user auth middleware to pass to the controller
jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 4;
        next();
    };
});

beforeAll(() => {
    app.listen(5560);
});

describe("test get blocked users controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should get blocked users be successfully without data", async () => {
        (findBlockedUsers as jest.Mock).mockResolvedValue([]);
        const response = await request(app).get("/api/user/blocked");
        expect(findBlockedUsers).toHaveBeenCalled();
        expect(findBlockedUsers).toHaveBeenCalledWith(4);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            users: [],
        });
    });

    it("should get blocked users be successfully with data", async () => {
        (findBlockedUsers as jest.Mock).mockResolvedValue(
            [1, 2, 3, 4].map((id) => ({
                id,
                userName: faker.person.fullName(),
                profilePic: faker.image.avatar(),
            }))
        );
        const response = await request(app).get("/api/user/blocked");
        expect(findBlockedUsers as jest.Mock).toHaveBeenCalled();
        expect(findBlockedUsers as jest.Mock).toHaveBeenCalledWith(4);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            users: [1, 2, 3, 4].map((id) => ({
                userId: id,
                userName: expect.any(String),
                profilePic: expect.any(String),
            })),
        });
    });

    it("should get blocked users be unsuccessfully", async () => {
        (findBlockedUsers as jest.Mock).mockRejectedValueOnce(new HttpError("Error in getting blocked users", 500));
        const response = await request(app).get("/api/user/blocked");
        expect(findBlockedUsers).toHaveBeenCalled();
        expect(findBlockedUsers).toHaveBeenCalledWith(4);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in getting blocked users",
        });
    });
});

describe("test handle user blocks controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should handle user blocks be successfully", async () => {
        (validateBlockData as jest.Mock).mockReturnValue(undefined);
        (checkUserExistUsers as jest.Mock).mockReturnValue(undefined);
        (checkUsersExistDB as jest.Mock).mockResolvedValue(undefined);
        (updateBlockOfRelates as jest.Mock).mockResolvedValue(undefined);
        (createRelates as jest.Mock).mockResolvedValue(undefined);

        const data = {
            users: [1, 2, 3, 4],
            blocked: true,
        };

        const response = await request(app).put("/api/user/block").send(data);
        expect(validateBlockData).toHaveBeenCalled();
        expect(validateBlockData).toHaveBeenCalledWith(data.users, data.blocked);
        expect(checkUserExistUsers).toHaveBeenCalled();
        expect(checkUserExistUsers).toHaveBeenCalledWith(4, data.users);
        expect(checkUsersExistDB).toHaveBeenCalled();
        expect(checkUsersExistDB).toHaveBeenCalledWith(data.users);
        expect(updateBlockOfRelates).toHaveBeenCalled();
        expect(updateBlockOfRelates).toHaveBeenCalledWith(4, data.users, data.blocked);
        expect(createRelates).toHaveBeenCalled();
        expect(createRelates).toHaveBeenCalledWith(4, data.users, data.blocked, false);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "User has been blocked or unblocked successfully.",
        });
    });

    it("should handle user blocks be unsuccessfully", async () => {
        (validateBlockData as jest.Mock).mockReturnValue(undefined);
        (checkUserExistUsers as jest.Mock).mockReturnValue(undefined);
        (checkUsersExistDB as jest.Mock).mockResolvedValue(undefined);
        (updateBlockOfRelates as jest.Mock).mockRejectedValueOnce(new HttpError("Error in updating blocks", 500));
        (createRelates as jest.Mock).mockResolvedValue(undefined);

        const data = {
            users: [1, 2, 3, 4],
            blocked: true,
        };

        const response = await request(app).put("/api/user/block").send(data);
        expect(validateBlockData).toHaveBeenCalled();
        expect(validateBlockData).toHaveBeenCalledWith(data.users, data.blocked);
        expect(checkUserExistUsers).toHaveBeenCalled();
        expect(checkUserExistUsers).toHaveBeenCalledWith(4, data.users);
        expect(checkUsersExistDB).toHaveBeenCalled();
        expect(checkUsersExistDB).toHaveBeenCalledWith(data.users);
        expect(updateBlockOfRelates).toHaveBeenCalled();
        expect(updateBlockOfRelates).toHaveBeenCalledWith(4, data.users, data.blocked);
        expect(createRelates).not.toHaveBeenCalled();
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in updating blocks",
        });
    });
});


