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
describe("Get channel settings", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get settings of a channel", async () => {
        (channelService.getSettings as jest.Mock).mockResolvedValue({
            inviteLink: "link",
            public: false,
        });

        const response = await request(app).get(`/api/channels/1/settings`).send();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ inviteLink: "link", public: false });
    });
});
// describe("Invite Link", () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     it("should add user to channel via invite link", async () => {
//         (channelService.getSettings as jest.Mock).mockResolvedValue({
//             inviteLink: "link",
//             public: false,
//         });

//         const response = await request(app).get(`/api/channels/1/settings`).send();

//         expect(response.status).toBe(200);
//         expect(response.body).toMatchObject({ inviteLink: "link", public: false });
//     });
// });
