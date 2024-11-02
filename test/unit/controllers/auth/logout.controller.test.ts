import request from "supertest";
import { clearTokenCookie } from "@services/auth/token.service";
import { deleteUserToken, deleteAllUserTokens } from "@services/prisma/auth/delete.service";
import { getToken } from "@services/auth.service";
import app from "@src/app";

jest.mock("@services/auth.service");
jest.mock("@services/prisma/auth/delete.service");
jest.mock("@services/auth/token.service");

beforeAll(() => {
    app.listen(5557);
});
describe("test logout from one device controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should logout one be successfully", async () => {
        (getToken as jest.Mock).mockReturnValue("token");
        (deleteUserToken as jest.Mock).mockResolvedValue(undefined);
        (clearTokenCookie as jest.Mock).mockReturnValue(undefined);
        const response = await request(app)
            .get("/api/user/logoutOne")
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Logged out from this device",
        });
    });
    it("should logout one be unsuccessfully", async () => {
        (getToken as jest.Mock).mockReturnValue("token");
        (deleteUserToken as jest.Mock).mockRejectedValue(new Error("Error in delete user token"));
        (clearTokenCookie as jest.Mock).mockReturnValue(undefined);
        const response = await request(app)
            .get("/api/user/logoutOne")
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Error in delete user token",
            stack: undefined,
        });
    });
});

describe("test logout from all devices controller", () => {
    afterAll(() => {
        jest.clearAllMocks();
    });
    it("should logout all be successfully", async () => {
        (getToken as jest.Mock).mockReturnValue("token");
        (deleteAllUserTokens as jest.Mock).mockResolvedValue(undefined);
        (clearTokenCookie as jest.Mock).mockReturnValue(undefined);
        const response = await request(app)
            .get("/api/user/logoutAll")
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            status: "success",
            message: "Logged out from all devices",
        });
    });
    it("should logout one be unsuccessfully", async () => {
        (getToken as jest.Mock).mockReturnValue("token");
        (deleteAllUserTokens as jest.Mock).mockResolvedValue(undefined);
        (clearTokenCookie as jest.Mock).mockImplementation(() => { throw new Error("Clearing the token cookie") });
        const response = await request(app)
            .get("/api/user/logoutAll")
        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
            success: false,
            message: "Clearing the token cookie",
            stack: undefined,
        });
    });
});