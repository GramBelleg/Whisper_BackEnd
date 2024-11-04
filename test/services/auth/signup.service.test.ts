import {
    findUserByEmail,
    findUserByPhoneNumber,
    findUserByUserName,
} from "@src/services/auth/prisma/find.service";
import {
    fetchRobotTokenData,
    verifyRobotToken,
    isUniqueUser,
} from "@src/services/auth/signup.service";

// Cast automatically all functions in `fetch.apis.service` as Jest mocks in this test file only
jest.mock("@src/services/auth/signup.service");

// Cast `findUserByEmail`, `findUserByPhoneNumber`, and `findUserByUserName` as Jest mocks in this test file only
jest.mock("@src/services/auth/prisma/find.service", () => ({
    findUserByEmail: jest.fn(),
    findUserByPhoneNumber: jest.fn(),
    findUserByUserName: jest.fn(),
}));

afterAll(() => {
    jest.clearAllMocks();
});

describe("test verifyRobotToken function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should verify the robot token", async () => {
        (fetchRobotTokenData as jest.Mock).mockResolvedValue({
            success: true,
        });
        const verification = await verifyRobotToken("robotToken");
        expect(verification).toBeUndefined();
    });

    it("should not verify the robot token", async () => {
        (fetchRobotTokenData as jest.Mock).mockResolvedValue({
            success: false,
        });
        try {
            await verifyRobotToken("robotToken");
        } catch (err: any) {
            expect(err.message).toEqual("Invalid robot token");
        }
    });

    it("should be invalid robot token", async () => {
        (fetchRobotTokenData as jest.Mock).mockRejectedValue(undefined);
        try {
            await verifyRobotToken("robotToken");
        } catch (err: any) {
            expect(err.message).toEqual("Invalid robot token");
        }
    });
});

describe("test isUniqueUser function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should be unique user", async () => {
        (findUserByEmail as jest.Mock).mockResolvedValue(null);
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue(null);
        (findUserByUserName as jest.Mock).mockResolvedValue(null);
        const uniqueUser = await isUniqueUser("email", "userName", "phoneNumber");
        expect(uniqueUser).toBeUndefined();
    });
    it("should email be duplicated", async () => {
        (findUserByEmail as jest.Mock).mockResolvedValue("email");
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue(null);
        (findUserByUserName as jest.Mock).mockResolvedValue(null);
        try {
            await isUniqueUser("email", "userName", "phoneNumber");
        } catch (err: any) {
            expect(err.message).toEqual("User already exists");
            expect(err.status).toEqual(409);
            expect(err.duplicate.email).toEqual("Email already exists ");
        }
    });
    it("should phone number be duplicated", async () => {
        (findUserByEmail as jest.Mock).mockResolvedValue(null);
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue("phoneNumber");
        (findUserByUserName as jest.Mock).mockResolvedValue(null);
        try {
            await isUniqueUser("email", "userName", "phoneNumber");
        } catch (err: any) {
            expect(err.message).toEqual("User already exists");
            expect(err.status).toEqual(409);
            expect(err.duplicate.phoneNumber).toEqual("Phone number already exists");
        }
    });
    it("should user name be duplicated", async () => {
        (findUserByEmail as jest.Mock).mockResolvedValue(null);
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue(null);
        (findUserByUserName as jest.Mock).mockResolvedValue("userName");
        try {
            await isUniqueUser("email", "userName", "phoneNumber");
        } catch (err: any) {
            expect(err.message).toEqual("User already exists");
            expect(err.status).toEqual(409);
            expect(err.duplicate.userName).toEqual("Username already exists");
        }
    });
});
