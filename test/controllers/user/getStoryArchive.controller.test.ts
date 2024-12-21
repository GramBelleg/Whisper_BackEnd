import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { getStoryArchive } from "@services/story/story.service";

// Mocking authentication middleware to set userId
jest.mock("@src/middlewares/auth.middleware", () => {
    return jest.fn((req, res, next) => {
        req.userId = 1;
        next();
    });
});

// Mocking story service
jest.mock("@services/story/story.service");

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeApp();
});

describe("GET /storyArchive", () => {
    it("should return all archived stories", async () => {
        const stories = [
            {
                id: 1,
                userId: 1,
                date: "2024-12-20T12:00:00Z",
                isArchived: true,
                content: "Story content 1",
                media: "media1",
                type: "image",
                views: 10,
                likes: 5,
                privacy: "Everyone",
            },
            {
                id: 2,
                userId: 1,
                date: "2024-12-19T12:00:00Z",
                isArchived: true,
                content: "Story content 2",
                media: "media2",
                type: "video",
                views: 20,
                likes: 15,
                privacy: "Everyone",
            },
        ];

        // Mock the service to return the expected stories
        (getStoryArchive as jest.Mock).mockResolvedValue({ stories });

        const response = await request(app).get("/api/user/storyArchive");

        // Verify service call and response
        expect(getStoryArchive).toHaveBeenCalledWith(1);
        expect(response.status).toBe(200);
        expect(response.body.stories.stories).toEqual(stories);
    });
});
