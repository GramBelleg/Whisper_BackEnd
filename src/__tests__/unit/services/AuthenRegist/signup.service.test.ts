import { User } from "@prisma/client";
import { prismaMock } from "@prisma/PrismaMock";
import bcrypt from "bcrypt";
import { findUser, upsertUser } from "@services/AuthenRegist/signup.service"; // Adjust the path to your user service

jest.mock("@DB");
jest.mock("bcrypt");

describe("User Service", () => {
    const mockUser: User = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        phoneNumber: "1234567890",
        password: "hashed_password",
        emailStatus: "Activated",
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear previous mock calls
    });

    describe("findUser", () => {
        it("should throw an error if the email is already found", async () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // Simulate user found

            await expect(findUser(mockUser.email, "anyPassword")).rejects.toThrow(
                "Email is already found"
            );
        });

        it("should not throw an error if the user is not found", async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null); // Simulate user not found

            await expect(findUser("nonexistent@example.com", "anyPassword")).resolves.not.toThrow();
        });
    });

    describe("upsertUser", () => {
        it("should create a new user when they do not exist", async () => {
            prismaMock.user.upsert.mockResolvedValueOnce(mockUser); // Simulate successful upsert

            (bcrypt.hashSync as jest.Mock).mockReturnValueOnce("hashed_password"); // Simulate hashing

            await upsertUser(
                mockUser.name,
                mockUser.email,
                mockUser.phoneNumber,
                "plain_password",
                "123456"
            );

            expect(prismaMock.user.upsert).toHaveBeenCalledWith({
                where: { email: mockUser.email },
                update: expect.anything(),
                create: expect.objectContaining({
                    name: mockUser.name,
                    email: mockUser.email,
                    phoneNumber: mockUser.phoneNumber,
                    password: "hashed_password",
                    verificationCode: {
                        create: {
                            code: "123456",
                        },
                    },
                }),
            });
        });

        it("should update an existing user when they already exist", async () => {
            prismaMock.user.upsert.mockResolvedValueOnce(mockUser); // Simulate successful upsert

            (bcrypt.hashSync as jest.Mock).mockReturnValueOnce("hashed_password"); // Simulate hashing

            await upsertUser(
                mockUser.name,
                mockUser.email,
                mockUser.phoneNumber,
                "plain_password",
                "123456"
            );

            expect(prismaMock.user.upsert).toHaveBeenCalledWith({
                where: { email: mockUser.email },
                update: expect.objectContaining({
                    name: mockUser.name,
                    phoneNumber: mockUser.phoneNumber,
                    password: "hashed_password",
                    verificationCode: {
                        update: {
                            code: "123456",
                        },
                    },
                }),
                create: expect.anything(),
            });
        });
    });
});
