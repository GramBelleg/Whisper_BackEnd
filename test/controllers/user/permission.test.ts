import request from "supertest";
import { app, closeApp } from "@src/app"; // Assuming app is your Express app
import userAuth from "@middlewares/auth.middleware";
import { updateAddPermission } from "@services/user/user.service";


jest.mock("@services/user/user.service");

// jest.mock("@src/middlewares/auth.middleware", () => {
//     return jest.fn((req, res, next) => {
//         req.userId = 1;
//         next();
//     });
// });
jest.mock("@src/middlewares/auth.middleware");

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await closeApp();
});


describe("post /addPermission", () => {
    it ("should throw error due to Unauthorized user", async () => {
        (userAuth as jest.Mock).mockImplementation((req, res, next) => {
            req.userId = null;
            next();
        });   
        const response = await request(app).post("/api/user/addPermission");
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized User");
    });
    it ("should throw error due to undefined permission", async () => {
        (userAuth as jest.Mock).mockImplementation((req, res, next) => {
            req.userId = 1;
            next();
        });   
        const response = await request(app).post("/api/user/addPermission");
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("addPermission missing");
    });

    it ("should throw error due to invalid permission", async () => {
        (userAuth as jest.Mock).mockImplementation((req, res, next) => {
            req.userId = 1;
            next();
        });
        const response = await request(app).post("/api/user/addPermission").send({ addPermission: "assdad" });
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Invalid addPermission");
    });
    
    it ("should return success message", async () => {
        (userAuth as jest.Mock).mockImplementation((req, res, next) => {
            req.userId = 1;
            next();
        });
        (updateAddPermission as jest.Mock).mockResolvedValue(undefined);   
        const response = await request(app).post("/api/user/addPermission").send({ addPermission: true });
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Add To Group Permission Updated Successfully");
    });

});