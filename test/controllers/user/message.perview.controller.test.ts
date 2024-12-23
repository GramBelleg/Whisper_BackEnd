import request from "supertest";
import { app, closeApp } from "@src/app";
import { updateMessagePerview } from "@services/user/prisma/update.service";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});
jest.mock("@services/user/prisma/update.service");


afterAll(async () => {
    await closeApp();
});

describe("test PUT /messagePreview Route", () => {
    const messagePreview = true;

    it("should update the message preview and return success response", async () => {
        (updateMessagePerview as jest.Mock).mockResolvedValue(undefined);
        const response = await request(app).put("/api/user/messagePreview").send({ messagePreview });
        expect(updateMessagePerview).toHaveBeenCalledWith(1, messagePreview);
        expect(updateMessagePerview).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("Message preview has been updated successfully.");
    });

    it("should fail to update the message preview", async () => {
        (updateMessagePerview as jest.Mock).mockRejectedValue(
            new HttpError("Message preview is required", 400)
        );
        const response = await request(app).put("/api/user/messagePreview").send({ messagePreview: undefined });
        expect(updateMessagePerview).toHaveBeenCalledWith(1, messagePreview);
        expect(updateMessagePerview).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Message preview is required");
    });
});