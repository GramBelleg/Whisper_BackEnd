import request from "supertest";
import { faker } from "@faker-js/faker";
import { app, closeApp } from "@src/app";
import { getAccessToken, getUserData } from "@services/auth/facebook.auth.service"; // You'll need to create this service
import { upsertUser } from "@services/auth/prisma/update.create.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";

jest.mock("@services/auth/facebook.auth.service");
jest.mock("@services/auth/prisma/update.create.service");
jest.mock("@services/auth/token.service");

afterAll(async () => {
    await closeApp();
});

describe("test facebook auth controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should authenticate user successfully", async () => {
        const userData = {
            id: 1,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            userName: faker.internet.userName(),
        };

        (getAccessToken as jest.Mock).mockResolvedValue("access_token");
        (getUserData as jest.Mock).mockResolvedValue(userData);
        (upsertUser as jest.Mock).mockResolvedValue(userData);
        (createAddToken as jest.Mock).mockResolvedValue("token");
        (createTokenCookie as jest.Mock).mockReturnValue(undefined);

        const response = await request(app).post("/api/auth/facebook").send({ code: "code" });

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            user: {
                id: userData.id,
                name: userData.name,
                userName: userData.userName,
                email: userData.email,
            },
            userToken: "token",
        });
        expect(getAccessToken).toHaveBeenCalled();
        expect(getAccessToken).toHaveBeenCalledWith("code");
        expect(getUserData).toHaveBeenCalled();
        expect(getUserData).toHaveBeenCalledWith("access_token");
        expect(upsertUser).toHaveBeenCalled();
        expect(upsertUser).toHaveBeenCalledWith(userData);
        expect(createAddToken).toHaveBeenCalled();
        expect(createAddToken).toHaveBeenCalledWith(userData.id);
        expect(createTokenCookie).toHaveBeenCalled();
    });

    it("should return 400 if code is missing", async () => {
        const response = await request(app).post("/api/auth/facebook").send({});
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Authorization code is missing",
        });
        expect(getAccessToken).not.toHaveBeenCalled();
        expect(getUserData).not.toHaveBeenCalled();
        expect(upsertUser).not.toHaveBeenCalled();
        expect(createAddToken).not.toHaveBeenCalled();
        expect(createTokenCookie).not.toHaveBeenCalled();
    });

    it("should return 400 if access token is invalid", async () => {
        (getAccessToken as jest.Mock).mockResolvedValue("access_token");
        (getUserData as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app).post("/api/auth/facebook").send({ code: "code" });
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid Access Token",
        });
        expect(getAccessToken).toHaveBeenCalled();
        expect(getUserData).toHaveBeenCalled();
        expect(upsertUser).not.toHaveBeenCalled();
        expect(createAddToken).not.toHaveBeenCalled();
        expect(createTokenCookie).not.toHaveBeenCalled();
    });

});
