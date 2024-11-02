import { validateEmail, validateConfirmCode, validateResetCode } from "@src/validators/confirm.reset";
import HttpError from "@src/errors/HttpError";

describe("test validateEmail", () => {
    it("should pass with a valid email", () => {
        expect(() => validateEmail("test@example.com")).not.toThrow();
    });

    it("should throw an error if email is empty", () => {
        try {
            validateEmail("");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email cannot be empty");
        }
    });

    it("should throw an error if email is invalid", () => {
        try {
            validateEmail("invalid-email");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email must be a valid email");
        }
    });
});

describe("test validateConfirmCode", () => {
    it("should pass with a valid email and code", () => {
        expect(() => validateConfirmCode("test@example.com", "12345678")).not.toThrow();
    });

    it("should throw an error if email is empty", () => {
        try {
            validateConfirmCode("", "12345678");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email cannot be empty");
        }
    });

    it("should throw an error if email is invalid", () => {
        try {
            validateConfirmCode("invalid-email", "12345678");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email must be a valid email");
        }
    });

    it("should throw an error if code is empty", () => {
        try {
            validateConfirmCode("test@example.com", "");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("code cannot be empty");
        }
    });

    it("should throw an error if code is not 8 characters", () => {
        try {
            validateConfirmCode("test@example.com", "1234");
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("code must be 8 characters");
        }
    });
});

describe("test validateResetCode", () => {
    it("should pass with a valid request body", () => {
        const requestBody = {
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
            code: "12345678"
        };
        expect(() => validateResetCode(requestBody)).not.toThrow();
    });

    it("should throw an error if email is empty", () => {
        const requestBody = {
            password: "password123",
            confirmPassword: "password123",
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email is required");
        }
    });

    it("should throw an error if email is invalid", () => {
        const requestBody = {
            email: "invalid-email",
            password: "password123",
            confirmPassword: "password123",
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email must be a valid email");
        }
    });

    it("should throw an error if password is empty", () => {
        const requestBody = {
            email: "test@example.com",
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password is required");
        }
    });

    it("should throw an error if password is less than 6 characters", () => {
        const requestBody = {
            email: "test@example.com",
            password: "123",
            confirmPassword: "123",
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password must be at least 6 characters");
        }
    });

    it("should throw an error if password is more than 50 characters", () => {
        const requestBody = {
            email: "test@example.com",
            password: "a".repeat(51),
            confirmPassword: "a".repeat(51),
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password must be at most 50 characters");
        }
    });

    it("should throw an error if passwords do not match", () => {
        const requestBody = {
            email: "test@example.com",
            password: "password123",
            confirmPassword: "differentPassword",
            code: "12345678"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("passwords don't match");
        }
    });

    it("should throw an error if code is empty", () => {
        const requestBody = {
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("code is required");
        }
    });

    it("should throw an error if code is not 8 characters", () => {
        const requestBody = {
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
            code: "1234"
        };
        try {
            validateResetCode(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("code must be 8 characters");
        }
    });
});
