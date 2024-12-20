import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { getStoryUsers } from "@services/story/story.service";

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

describe("get /story", () => {
    it("should return all story users", async () => {
        const users = [
            {
              "id": 2,
              "userName": "haven_runte26",
              "profilePic": null
            },
            {
              "id": 3,
              "userName": "david7",
              "profilePic": null
            }
        ];

        (getStoryUsers as jest.Mock).mockResolvedValue({ users });
        const response = await request(app).get("/api/user/story");
        expect(getStoryUsers).toHaveBeenCalledWith(1);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            users:{
                users: [
                    { id: 2, userName: "haven_runte26", profilePic: null },
                    { id: 3, userName: "david7", profilePic: null }
                ]
        }
        });
    });
});



        
        
