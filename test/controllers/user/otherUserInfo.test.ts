import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import {partialUserInfo } from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";


// Mocking the services and utility functions
jest.mock("@services/user/user.service");

jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeApp();
});


describe("get /:userId/info", () => {
    it("should return user info", async () => {
        const userInfo = {
            "userName": "david7",
            "phoneNumber": "+17066786487",
            "bio": "Odit charisma adhaero curo adsuesco patior utrum crinis uxor delectatio.",
            "profilePic": null,
            "lastSeen": "2024-12-14T00:17:35.990Z",
            "status": "Online",
            "hasStory": false
        };
        const userId = 2;
        (partialUserInfo as jest.Mock).mockResolvedValue(userInfo);
        const response = await request(app).get(`/api/user/${userId}/info`);
        expect(partialUserInfo).toHaveBeenCalledWith(1, userId);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(userInfo);
    });

    it("should throw an error due to invalid userId", async () => {
        const userId = "abc";
        const response = await request(app).get(`/api/user/${userId}/info`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false,  message: "Invalid userId" });
    });

    it("should throw an error due to id not found", async () => {
        const userId = 99;
        (partialUserInfo as jest.Mock).mockImplementation(() => {
            throw new HttpError("user not found", 404);
        });
        const response = await request(app).get(`/api/user/${userId}/info`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ success: false, message: "user not found" });
    });
});