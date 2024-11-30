import request from "supertest";
import app from "@src/app";
import db from "@src/prisma/PrismaClient";
import { User } from "@prisma/client";
import { reset } from "module-alias";
import { mock } from "node:test";

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1; // Mock the authenticated user ID
        next();
    });
});

describe("PUT /bio Route", () => {
    let user: User;
    const bio = "This is my new bio";

    beforeAll(async () => {
        // Create a test user
        user = await db.user.findUnique({ where: { id: 1 } }) as User;
    });

    afterAll(async () => {
        // Clean up test user
        await db.user.update({ where: { id: user.id }, data: { bio: user.bio } });
        await db.$disconnect();
    });

    afterEach(async () => {
        // Reset bio after each test
        await db.user.update({
            where: { id: user.id },
            data: { bio: user.bio },
        });
    });

    it("should update the bio and return success response", async () => {
        const response = await request(app)
            .put("/api/user/bio")
            .send({ bio });

        const updatedUser = await db.user.findUnique({ where: { id: user.id } });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toBe(bio);
        expect(updatedUser?.bio).toBe(bio);
    });
});
