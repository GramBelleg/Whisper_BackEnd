import request from "supertest";
import { app, closeApp } from "@src/app";
import * as groupService from "@services/chat/group.service";
import { NextFunction } from "express";

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
describe("Get size limit", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get settings of a group", async () => {
        (groupService.getSettings as jest.Mock).mockResolvedValue({ maxSize: 1000, public: false });

        const response = await request(app).get(`/api/groups/1/settings`).send();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ maxSize: 1000, public: false });
    });
});
describe("Set size limit", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set size limit of a group", async () => {
        (groupService.updateSizeLimit as jest.Mock).mockResolvedValue({ undefined });
        (groupService.isAdmin as jest.Mock).mockResolvedValue(true);

        const response = await request(app).put(`/api/groups/1/size/200`).send();
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ message: "successfully updated group size limit" });
    });
    it("should throw not an admin", async () => {
        (groupService.isAdmin as jest.Mock).mockResolvedValue(false);

        const response = await request(app).put(`/api/groups/1/size/200`).send();

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("You're not an admin");
    });
    it("should throw invalid chatId", async () => {
        const response = await request(app).put(`/api/groups/i/size/400`).send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Invalid chat id");
    });
    it("should throw invalid maxSize", async () => {
        const response = await request(app).put(`/api/groups/1/size/i`).send();

        expect(response.status).toBe(404);

        expect(response.body.message).toBe("Invalid Size");
    });
});
