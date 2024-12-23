import request from "supertest";
import { Request, Response, NextFunction } from "express";
import HttpError from "@src/errors/HttpError";
import { app, closeApp } from "@src/app";
import { validateReadReceipt } from "@validators/user";
import * as  userServices from '@services/user/user.service';
import { updateReadReceipt } from "@services/user/prisma/update.service";


jest.mock("@validators/user");
jest.mock("@services/user/prisma/update.service");
jest.mock("@services/user/user.service");



// mock user auth middleware to pass to the controller
jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 4;
        req.userRole = "User"; // Mock the authenticated user role
        next();
    };
});

afterAll(async () => {
    await closeApp();
});


describe("test update read receipt controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update read receipt be successfully", async () => {
        const data = { readReceipts: true };
        (validateReadReceipt as jest.Mock).mockReturnValue(undefined);
        (updateReadReceipt as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).post("/api/user/readReceipts").send(data);
        expect(validateReadReceipt).toHaveBeenCalled();
        expect(validateReadReceipt).toHaveBeenCalledWith(data.readReceipts);
        expect(updateReadReceipt).toHaveBeenCalled();
        expect(updateReadReceipt).toHaveBeenCalledWith(4, data.readReceipts);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Read receipts have been updated.",
        });
    });

    it("should throw error if read receipt is not boolean", async () => {
        const data = { readReceipts: "true" };
        (validateReadReceipt as jest.Mock).mockImplementation(() => {
            throw new HttpError("Read receipt must be a boolean", 400);
        });
        const response = await request(app).post("/api/user/readReceipts").send(data);
        expect(validateReadReceipt).toHaveBeenCalled();
        expect(validateReadReceipt).toHaveBeenCalledWith(data.readReceipts);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            success: false,
            message: "Read receipt must be a boolean",
        });
    });

    it("should throw error if an error occured in updating", async () => {
        const data = { readReceipts: true };
        (validateReadReceipt as jest.Mock).mockReturnValue(undefined);
        (updateReadReceipt as jest.Mock).mockRejectedValue(new HttpError("An error occured", 500));
        const response = await request(app).post("/api/user/readReceipts").send(data);
        expect(validateReadReceipt).toHaveBeenCalled();
        expect(validateReadReceipt).toHaveBeenCalledWith(data.readReceipts);
        expect(updateReadReceipt).toHaveBeenCalled();
        expect(updateReadReceipt).toHaveBeenCalledWith(4, data.readReceipts);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "An error occured",
        });
    });
});

describe("test change last seen privacy controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update last seen privacy be successfully", async () => {
        const data = { privacy: "Nobody" };
        (userServices.changeLastSeenPrivacy as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/lastSeen/privacy").send(data);
        expect(userServices.changeLastSeenPrivacy).toHaveBeenCalled();
        expect(userServices.changeLastSeenPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Privacy settings updated.",
        });
    });

    it("should throw error if privacy is not provided", async () => {
        const data = {};
        const response = await request(app).put("/api/user/lastSeen/privacy").send(data);
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({
            success: false,
            message: "Privacy not specified",
        });
    });

    it("should throw error if privacy is invalid", async () => {
        const data = { privacy: "invalid" };
        const response = await request(app).put("/api/user/lastSeen/privacy").send(data);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid privacy setting",
        });
    });

    it("should throw error if an error occured in updating", async () => {
        const data = { privacy: "Nobody" };
        ((userServices.changeLastSeenPrivacy) as jest.Mock).mockRejectedValue(new HttpError("An error occured", 500));
        const response = await request(app).put("/api/user/lastSeen/privacy").send(data);
        expect(userServices.changeLastSeenPrivacy).toHaveBeenCalled();
        expect(userServices.changeLastSeenPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "An error occured",
        });
    });
});

describe("test change pfp privacy controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update pfp privacy be successfully", async () => {
        const data = { privacy: "Nobody" };
        (userServices.changePfpPrivacy as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/pfp/privacy").send(data);
        expect(userServices.changePfpPrivacy).toHaveBeenCalled();
        expect(userServices.changePfpPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Privacy settings updated.",
        });
    });

    it("should throw error if privacy is not provided", async () => {
        const data = {};
        const response = await request(app).put("/api/user/pfp/privacy").send(data);
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({
            success: false,
            message: "Privacy not specified",
        });
    });

    it("should throw error if privacy is invalid", async () => {
        const data = { privacy: "invalid" };
        const response = await request(app).put("/api/user/pfp/privacy").send(data);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid privacy setting",
        });
    });

    it("should throw error if an error occured in updating", async () => {
        const data = { privacy: "Nobody" };
        ((userServices.changePfpPrivacy) as jest.Mock).mockRejectedValue(new HttpError("An error occured", 500));
        const response = await request(app).put("/api/user/pfp/privacy").send(data);
        expect(userServices.changePfpPrivacy).toHaveBeenCalled();
        expect(userServices.changePfpPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "An error occured",
        });
    });
});

describe("test change story privacy controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update story privacy be successfully", async () => {
        const data = { privacy: "Nobody" };
        (userServices.changeStoryPrivacy as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/story/privacy").send(data);
        expect(userServices.changeStoryPrivacy).toHaveBeenCalled();
        expect(userServices.changeStoryPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Privacy settings updated.",
        });
    });

    it("should throw error if privacy is not provided", async () => {
        const data = {};
        const response = await request(app).put("/api/user/story/privacy").send(data);
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({
            success: false,
            message: "Privacy not specified",
        });
    });

    it("should throw error if privacy is invalid", async () => {
        const data = { privacy: "invalid" };
        const response = await request(app).put("/api/user/story/privacy").send(data);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid privacy setting",
        });
    });

    it("should throw error if an error occured in updating", async () => {
        const data = { privacy: "Nobody" };
        ((userServices.changeStoryPrivacy) as jest.Mock).mockRejectedValue(new HttpError("An error occured", 500));
        const response = await request(app).put("/api/user/story/privacy").send(data);
        expect(userServices.changeStoryPrivacy).toHaveBeenCalled();
        expect(userServices.changeStoryPrivacy).toHaveBeenCalledWith(4, data.privacy);
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "An error occured",
        });
    });
});