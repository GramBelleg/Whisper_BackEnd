import request from "supertest";
import { Request, Response, NextFunction } from "express";
import HttpError from "@src/errors/HttpError";
import { app, closeApp } from "@src/app";
import { updateFCMToken } from "@services/notifications/prisma/update.service";
import { validateFCMToken } from "@validators/user";
import { getToken } from "@services/auth/token.service";

jest.mock("@validators/user");
jest.mock("@services/notifications/prisma/update.service");
jest.mock("@services/auth/token.service");
jest.mock("@src/middlewares/auth.middleware", () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 4;
        next();
    };
});

afterAll(async () => {
    await closeApp();
});

describe("test registerFCMToken controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should register FCM token be successfully", async () => {
        (validateFCMToken as jest.Mock).mockReturnValue(undefined);
        (getToken as jest.Mock).mockReturnValue("token");
        (updateFCMToken as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).post("/api/notifications/registerFCMToken").send({
            fcmToken: "fcmToken",
        });
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ status: "success" });
        expect(updateFCMToken).toHaveBeenCalled();
        expect(updateFCMToken).toHaveBeenCalledWith(4, "token", "fcmToken");
        expect(validateFCMToken).toHaveBeenCalled();
        expect(validateFCMToken).toHaveBeenCalledWith("fcmToken");
        expect(getToken).toHaveBeenCalled();
    });

    it("should register FCM token be failed with invalid FCM token", async () => {
        (getToken as jest.Mock).mockReturnValue("token");
        (updateFCMToken as jest.Mock).mockResolvedValue(undefined);
        (validateFCMToken as jest.Mock).mockImplementation(() => {
            throw new HttpError("Invalid FCM token", 422);
        });
        const response = await request(app).post("/api/notifications/registerFCMToken").send({
            fcmToken: "fcmToken",
        });
        expect(response.status).toEqual(422);
        expect(response.body.message).toEqual("Invalid FCM token");
        expect(updateFCMToken).not.toHaveBeenCalled();
        expect(getToken).not.toHaveBeenCalled();
    });
});