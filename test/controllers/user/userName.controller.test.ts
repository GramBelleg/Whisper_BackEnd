import request from "supertest";
import app from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { validatePhoneNumber } from "@src/validators/auth";
import { createRandomUser } from '@src/services/auth/prisma/create.service';
import HttpError from "@src/errors/HttpError";



jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});


describe("PUT /userName Route", () => {
    let user: User;
    let existUser: User;
    const userName = "testUserName";
    
    beforeAll(async () => { 
        user = await db.user.findUnique({ where: { id: 1 } }) as User;
        existUser = await createRandomUser() as User;
    });

    afterAll(async () => {
        await db.user.update({ where: { id: 1 }, data: { userName: user.userName } });
        await db.$disconnect();
    });

    afterEach(async () => {
        await db.user.update({
            where: { id: user.id },
            data: { userName: user.userName },
        });
    });

    it("should update the userName and return success response", async () => {
        const response = await request(app)
            .put("/api/user/userName")
            .send({ userName });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(userName);
        expect(updatedUser?.userName).toBe(userName);
    });

    it("should give error due to the existed userName", async () => {
        const response = await request(app)
            .put("/api/user/userName")
            .send({ userName: existUser.userName });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Username is already taken");
    });

    it("should give error due to the empty userName", async () => {
        const response = await request(app)
            .put("/api/user/userName")
            .send({ userName: "" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Username is required");
    });

});
