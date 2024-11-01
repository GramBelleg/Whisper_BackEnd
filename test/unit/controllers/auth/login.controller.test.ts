import request from "supertest";
import { faker } from "@faker-js/faker";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { checkEmailExistDB, checkPasswordCorrect } from "@services/auth/login.service";
import { validateLogIn } from "@validators/user";
import HttpError from "@src/errors/HttpError";
import app from "@src/app";

jest.mock("@validators/user");
jest.mock("@services/auth/login.service");
jest.mock("@services/auth/token.service");


describe("test login controller", () => {
    const testData = {
        id: 555,
        email: faker.internet.email().toLowerCase(),
        userName: faker.internet.username().toLowerCase(),
        name: faker.person.fullName().toLowerCase(),
        password: '123456789',
    };
    beforeAll(() => {
        app.listen(5555);
    });
    beforeEach(() => {
        (createTokenCookie as jest.Mock).mockReturnValue(undefined);
        (createAddToken as jest.Mock).mockResolvedValue("token");
        (checkEmailExistDB as jest.Mock).mockResolvedValue({
            id: testData.id,
            name: testData.name,
            userName: testData.userName,
            email: testData.email,
            password: testData.password,
        });
        (checkPasswordCorrect as jest.Mock).mockReturnValue(undefined);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should login be successfully", async () => {
        (validateLogIn as jest.Mock).mockReturnValue(undefined);
        const response = await request(app)
            .post("/api/auth/login")
            .send(testData);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            user: {
                id: testData.id,
                name: testData.name,
                userName: testData.userName,
                email: testData.email,
            },
            userToken: "token",
        });
    });
    it("should login be unsuccessfully", async () => {
        (validateLogIn as jest.Mock).mockImplementation(() => { throw new HttpError("Error in validating login data", 422) });
        const response = await request(app)
            .post("/api/auth/login")
            .send(testData);
        expect(response.status).toEqual(422);
        expect(response.body).toEqual({
            success: false,
            message: "Error in validating login data",
            stack: undefined,
        });
    });
});