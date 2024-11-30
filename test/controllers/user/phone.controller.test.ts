import request from "supertest";
import { app } from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { validatePhoneNumber } from "@src/validators/auth";
import { createRandomUser } from "@src/services/auth/prisma/create.service";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

jest.mock("@src/validators/auth");

describe("PUT /phone Route", () => {
    let user: User;
    let existUser: User;
    const phone = "+201002003000";

    beforeAll(async () => {
        user = (await db.user.findUnique({ where: { id: 1 } })) as User;
        existUser = (await createRandomUser()) as User;
    });

    afterAll(async () => {
        await db.user.update({ where: { id: user.id }, data: { phoneNumber: user.phoneNumber } });
        await db.$disconnect();
    });

    afterEach(async () => {
        await db.user.update({
            where: { id: user.id },
            data: { phoneNumber: user.phoneNumber },
        });
    });

    it("should update the phone and return success response", async () => {
        (validatePhoneNumber as jest.Mock).mockReturnValue("+201002003000");
        const response = await request(app).put("/api/user/phoneNumber").send({ phone });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(phone);
        expect(updatedUser?.phoneNumber).toBe(phone);
    });

    it("should give error due to the existed phone number", async () => {
        (validatePhoneNumber as jest.Mock).mockReturnValue(existUser.phoneNumber);
        const response = await request(app)
            .put("/api/user/phoneNumber")
            .send({ phonNumber: existUser.phoneNumber });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Unable to update phone");
    });

    it("should throw error due to wrong phone structure", async () => {
        (validatePhoneNumber as jest.Mock).mockImplementation(() => {
            throw new HttpError("phone number structure is not valid", 422);
        });
        const response = await request(app)
            .put("/api/user/phoneNumber")
            .send({ phonNumber: "12345" });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("phone number structure is not valid");
    });
});
