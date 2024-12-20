import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { getStoriesByUserId } from "@services/story/story.service";

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

describe("get /story/:userId", () => {
    it("should return all stories of a specific user", async () => {
        const userId = 2;
        const stories = [
            {
              "id": 4,
              "userId": 2,
              "date": "2024-12-14T00:17:36.392Z",
              "isArchived": false,
              "content": "content",
              "media": "media",
              "type": "VIDEO",
              "views": 0,
              "likes": 0,
              "privacy": "Everyone"
            },
            {
              "id": 5,
              "userId": 2,
              "date": "2024-12-14T00:17:36.393Z",
              "isArchived": false,
              "content": "content",
              "media": "media",
              "type": "VIDEO",
              "views": 0,
              "likes": 0,
              "privacy": "Everyone"
            },
            {
              "id": 6,
              "userId": 2,
              "date": "2024-12-14T00:17:36.396Z",
              "isArchived": false,
              "content": "content",
              "media": "media",
              "type": "VIDEO",
              "views": 0,
              "likes": 0,
              "privacy": "Everyone"
            }
        ];
        (getStoriesByUserId as jest.Mock).mockResolvedValue(stories);
        const response = await request(app).get(`/api/user/story/${userId}`);
        expect(getStoriesByUserId).toHaveBeenCalledWith(1, userId);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({stories: stories});
    });
});