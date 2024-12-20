import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import { getContacts } from "@services/user/user.service";


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


describe("get /contcat", () => {
    it("should return all contacts", async () => {
        const users = [
            {
                id: 1,
                userName: "test1",
                email: "test1@test.com"
            },
            {
                id: 2,
                userName: "test2",
                email: "test2@test.com"
            }
        ];
        (getContacts as jest.Mock).mockResolvedValue({ users });
        const response = await request(app).get("/api/user/contact");
        expect(getContacts).toHaveBeenCalledWith(1);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            users: {
                users: [
                    { email: "test1@test.com", id: 1, userName: "test1" },
                    { email: "test2@test.com", id: 2, userName: "test2" }
                ]
            }
        });
    });
});