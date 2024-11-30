import request from "supertest";
import app from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

describe("PUT /name Route", () => {
    let user: User;
    const name = "This is my new name";

    beforeAll(async () => {
        user = await db.user.findUnique({ where: { id: 1 } }) as User;
    });

    afterAll(async () => {
        await db.user.update({ where: { id: user.id }, data: { name: "tested" } });
        await db.$disconnect();
    });

    afterEach(async () => {
        await db.user.update({
            where: { id: user.id },
            data: { name: "tested" },
        });
    });

    it("should update the name and return success response", async () => {
        const response = await request(app)
            .put("/api/user/name")
            .send({ name });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(name);
        expect(updatedUser?.name).toBe(name);
    });

    it("should fail to update the name", async () => {
        const response = await request(app)
            .put("/api/user/name")
            .send({ name: "" });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Name is required");
    });
});
