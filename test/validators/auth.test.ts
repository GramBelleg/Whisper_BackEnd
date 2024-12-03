import * as authValidator from "@validators/auth";
import { checkPhoneNumber } from "@src/validators/phone";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/validators/phone");

describe("test validateName", () => {
    it("should throw an error if name is not a string", () => {
        expect(() => authValidator.validateName(123)).toThrow(
            new HttpError("name must be a string", 422)
        );
    });

    it("should throw an error if name is not found", () => {
        expect(() => authValidator.validateName(undefined)).toThrow(
            new HttpError("name is required", 422)
        );
    });
    it("should throw an error if name is empty", () => {
        expect(() => authValidator.validateName("")).toThrow(
            new HttpError("name cannot be empty", 422)
        );
    });

    it("should throw an error if name is less than 6 characters", () => {
        expect(() => authValidator.validateName("abc")).toThrow(
            new HttpError("name must be at least 6 characters", 422)
        );
    });

    it("should throw an error if name is more than 50 characters", () => {
        expect(() => authValidator.validateName("a".repeat(51))).toThrow(
            new HttpError("name must be at most 50 characters", 422)
        );
    });

    it("should not throw an error if name is valid", () => {
        expect(() => authValidator.validateName("validName")).not.toThrow();
    });
});

describe("test validateUserName", () => {
    it("should throw an error if userName is not a string", () => {
        expect(() => authValidator.validateUserName(123)).toThrow(
            new HttpError("user name must be a string", 422)
        );
    });

    it("should throw an error if userName is not found", () => {
        expect(() => authValidator.validateUserName(undefined)).toThrow(
            new HttpError("user name is required", 422)
        );
    });

    it("should throw an error if userName is empty", () => {
        expect(() => authValidator.validateUserName("")).toThrow(
            new HttpError("user name cannot be empty", 422)
        );
    });

    it("should throw an error if userName has no characters", () => {
        expect(() => authValidator.validateUserName("abc")).toThrow(
            new HttpError("user name must be at least 6 character", 422)
        );
    });

    it("should throw an error if userName is more than 50 characters", () => {
        expect(() => authValidator.validateUserName("a".repeat(51))).toThrow(
            new HttpError("user name must be at most 50 characters", 422)
        );
    });

    it("should not throw an error if userName is valid", () => {
        expect(() => authValidator.validateUserName("validUserName")).not.toThrow();
    });
});

describe("test validateEmail", () => {
    it("should throw an error if email is not a string", () => {
        expect(() => authValidator.validateEmail(123)).toThrow(
            new HttpError("email must be a string", 422)
        );
    });

    it("should throw an error if email is not found", () => {
        expect(() => authValidator.validateEmail(undefined)).toThrow(
            new HttpError("email is required", 422)
        );
    });

    it("should throw an error if email is empty", () => {
        expect(() => authValidator.validateEmail("")).toThrow(
            new HttpError("email cannot be empty", 422)
        );
    });

    it("should throw an error if email is not a valid email", () => {
        expect(() => authValidator.validateEmail("invalidEmail")).toThrow(
            new HttpError("email must be a valid email", 422)
        );
    });

    it("should not throw an error if email is valid", () => {
        expect(() => authValidator.validateEmail("valid@example.com")).not.toThrow();
    });
});

describe("test validatePhoneNumber", () => {
    it("should throw an error if phone number is not a string", () => {
        expect(() => authValidator.validatePhoneNumber(12345)).toThrow(
            new HttpError("phone number must be a string", 422)
        );
    });

    it("should throw an error if phone number is empty", () => {
        expect(() => authValidator.validatePhoneNumber("")).toThrow(
            new HttpError("phone number cannot be empty", 422)
        );
    });

    it("should throw an error if phone number is not provided", () => {
        expect(() => authValidator.validatePhoneNumber(undefined)).toThrow(
            new HttpError("phone number is required", 422)
        );
    });

    it("should throw an error if phone number structure is not valid", () => {
        expect(() => authValidator.validatePhoneNumber("1234567890")).toThrow(
            new HttpError("phone number structure is not valid", 422)
        );
    });

    it("should throw an error if phone number structure is not valid", () => {
        expect(() => authValidator.validatePhoneNumber("+201234f567890")).toThrow(
            new HttpError("phone number structure is not valid", 422)
        );
    });

    it("should call checkPhoneNumber if phone number is valid", () => {
        const validPhoneNumber = "+201234567890";
        (checkPhoneNumber as jest.Mock).mockReturnValue("+201234567890");
        const result = authValidator.validatePhoneNumber(validPhoneNumber);
        expect(checkPhoneNumber).toHaveBeenCalledWith(validPhoneNumber);
        expect(result).toBe("+201234567890");
    });
});

describe("test validatePassword", () => {
    it("should throw an error if password is not a string", () => {
        expect(() => authValidator.validatePassword(123)).toThrow(
            new HttpError("password must be a string", 422)
        );
    });

    it("should throw an error if password is empty", () => {
        expect(() => authValidator.validatePassword("")).toThrow(
            new HttpError("password cannot be empty", 422)
        );
    });

    it("should throw an error if password is not provided", () => {
        expect(() => authValidator.validatePassword(undefined)).toThrow(
            new HttpError("password is required", 422)
        );
    });

    it("should throw an error if password is less than 6 characters", () => {
        expect(() => authValidator.validatePassword("12345")).toThrow(
            new HttpError("password must be at least 6 characters", 422)
        );
    });

    it("should throw an error if password is more than 50 characters", () => {
        expect(() => authValidator.validatePassword("a".repeat(51))).toThrow(
            new HttpError("password must be at most 50 characters", 422)
        );
    });

    it("should not throw an error if password is between 6 and 50 characters", () => {
        expect(() => authValidator.validatePassword("validPassword123")).not.toThrow();
    });
});

describe("test validateConfirmPassword", () => {
    it("should throw an error if password is empty", () => {
        expect(() => authValidator.validateConfirmPassword("", "password123")).toThrow(
            new HttpError("password cannot be empty", 422)
        );
    });

    it("should throw an error if password is not provided", () => {
        expect(() => authValidator.validateConfirmPassword(undefined, "password123")).toThrow(
            new HttpError("password is required", 422)
        );
    });

    it("should throw an error if confirmPassword is not provided", () => {
        expect(() => authValidator.validateConfirmPassword("password123", undefined)).toThrow(
            new HttpError("confirm password is required", 422)
        );
    });

    it("should throw an error if password is not a string", () => {
        expect(() => authValidator.validateConfirmPassword(123, "password123")).toThrow(
            new HttpError("password must be a string", 422)
        );
    });

    it("should throw an error if confirmPassword do not match", () => {
        expect(() => authValidator.validateConfirmPassword("password123", "")).toThrow(
            new HttpError("passwords don't match", 422)
        );
    });

    it("should throw an error if confirmPassword do not match", () => {
        expect(() => authValidator.validateConfirmPassword("password123", 123)).toThrow(
            new HttpError("passwords don't match", 422)
        );
    });

    it("should throw an error if passwords do not match", () => {
        expect(() => authValidator.validateConfirmPassword("password123", "password321")).toThrow(
            new HttpError("passwords don't match", 422)
        );
    });

    it("should not throw an error if passwords match", () => {
        expect(() =>
            authValidator.validateConfirmPassword("password123", "password123")
        ).not.toThrow();
    });
});

describe("test validateRobotToken", () => {
    it("should throw an error if robotToken is not a string", () => {
        expect(() => authValidator.validateRobotToken(123)).toThrow(
            new HttpError("robot token must be a string", 422)
        );
    });

    it("should throw an error if robotToken is empty", () => {
        expect(() => authValidator.validateRobotToken("")).toThrow(
            new HttpError("robot token cannot be empty", 422)
        );
    });

    it("should throw an error if robotToken is not provided", () => {
        expect(() => authValidator.validateRobotToken(undefined)).toThrow(
            new HttpError("robot token is required", 422)
        );
    });

    it("should not throw an error if robotToken is valid", () => {
        expect(() => authValidator.validateRobotToken("validToken")).not.toThrow();
    });
});

describe("test validateCode", () => {
    it("should throw an error if code is not a string", () => {
        expect(() => authValidator.validateCode(12345678)).toThrow(
            new HttpError("code must be a string", 422)
        );
    });

    it("should throw an error if code is empty", () => {
        expect(() => authValidator.validateCode("")).toThrow(
            new HttpError("code cannot be empty", 422)
        );
    });

    it("should throw an error if code is not 8 characters long", () => {
        expect(() => authValidator.validateCode("123")).toThrow(
            new HttpError("code must be 8 characters", 422)
        );
    });

    it("should throw an error if code is not provided", () => {
        expect(() => authValidator.validateCode(undefined)).toThrow(
            new HttpError("code is required", 422)
        );
    });

    it("should not throw an error if code is valid", () => {
        expect(() => authValidator.validateCode("12345678")).not.toThrow();
    });
});
