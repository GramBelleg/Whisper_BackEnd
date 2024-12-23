import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { getStoryViews } from "@services/story/story.service";

jest.mock("@services/story/story.service");

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

describe("get user/story/getViews/:storyId", () => {
    it("should return the views of a specific story", async () => {
        const storyId = 2;
        const views = [
            {
              "id": 2,
              "userName": "haven_runte26",
              "profilePic": null,
              "liked": false
            },
            {
              "id": 3,
              "userName": "david7",
              "profilePic": null,
              "liked": true
            }
          ];
        (getStoryViews as jest.Mock).mockResolvedValue(views);
        const response = await request(app).get(`/api/user/story/getViews/${storyId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({users: views});
    });
});