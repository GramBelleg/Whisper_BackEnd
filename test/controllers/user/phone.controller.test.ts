import request from "supertest";
import { app, closeApp } from "@src/app";
import * as userServices from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

jest.mock("@services/user/user.service");

afterAll(async () => {
    await closeApp();
});

describe("PUT /phone Route", () => {
    const phone = "+201002003000";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update the phone and return success response", async () => {
        (userServices.updatePhone as jest.Mock).mockResolvedValue(phone);
        const response = await request(app)
            .put("/api/user/phoneNumber")
            .send({ phoneNumber: phone });
        expect(userServices.updatePhone).toHaveBeenCalledWith(1, phone);
        expect(userServices.updatePhone).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(phone);
    });

    it("should give error due to the existed phone number", async () => {
        (userServices.updatePhone as jest.Mock).mockRejectedValue(
            new HttpError("Unable to update phone", 500)
        );
        const response = await request(app)
            .put("/api/user/phoneNumber")
            .send({ phonNumber: "+201062039478" });
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Unable to update phone");
    });

    it("should throw error due to wrong phone structure", async () => {
        (userServices.updatePhone as jest.Mock).mockRejectedValue(
            new HttpError("phone number structure is not valid", 422)
        );
        const response = await request(app)
            .put("/api/user/phoneNumber")
            .send({ phonNumber: "12345" });

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("phone number structure is not valid");
    });
});
