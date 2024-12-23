import request from "supertest";
import { faker } from "@faker-js/faker";
import { app, closeApp } from "@src/app";
import { getAccessToken, getUserData } from "@services/auth/github.auth.service";
import { upsertUser } from "@services/auth/prisma/update.create.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";

jest.mock("@services/auth/github.auth.service");
jest.mock("@services/auth/prisma/update.create.service");
jest.mock("@services/auth/token.service");

afterAll(async () => {
    await closeApp();
});

describe("test github auth controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should github auth be successfully", async () => {
        const userData = {
            id: 1,
            email: faker.internet.email(),
            name: faker.person.fullName(),
            userName: faker.internet.username(),
            avatar: faker.image.avatar(),
        };
        (getAccessToken as jest.Mock).mockResolvedValue("access_token");
        (getUserData as jest.Mock).mockResolvedValue(userData);
        (upsertUser as jest.Mock).mockResolvedValue(userData);
        (createAddToken as jest.Mock).mockResolvedValue("token");
        (createTokenCookie as jest.Mock).mockReturnValue(undefined);

        const response = await request(app).post("/api/auth/github").send({ code: "code" });

        expect(response.status).toEqual(200);
        expect(response.body.userToken).toEqual("token");
        expect(response.body.user.id).toEqual(userData.id);
        expect(response.body.user.email).toEqual(userData.email);
        expect(response.body.user.name).toEqual(userData.name);
        expect(response.body.user.userName).toEqual(userData.userName);
        expect(getAccessToken).toHaveBeenCalledWith("code");
        expect(getUserData).toHaveBeenCalledWith("access_token");
        expect(upsertUser).toHaveBeenCalledWith(userData);
        expect(createAddToken).toHaveBeenCalledWith(userData.id, undefined);
    });

    it("should github auth be unsuccessfully", async () => {
        (getAccessToken as jest.Mock).mockResolvedValue("access_token");
        (getUserData as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app).post("/api/auth/github").send({ code: "code" });

        expect(response.status).toEqual(500);
        expect(response.body.message).toEqual("No User Data retrieved");
    });

    it("should github auth be unsuccessfully", async () => {
        const response = await request(app).post("/api/auth/github").send({});

        expect(response.status).toEqual(500);
        expect(response.body.message).toEqual("There is no Authorization Code");
    });
});