import { validateSingUp, validateLogIn, validatePhone } from "@src/validators/user";
import { checkPhoneNumber } from "@src/validators/phone";
import HttpError from "@src/errors/HttpError";

jest.mock("@src/validators/phone");

describe("test validateSingUp", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (checkPhoneNumber as jest.Mock).mockReturnValue("+201234567890");
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should validate a correct user", () => {
        const user = {
            name: "John Doe",
            userName: "john_doe",
            email: "john.doe@example.com",
            phoneNumber: "+1234567890",
            password: "password123",
            confirmPassword: "password123",
            robotToken: "robot123"
        };
        expect(() => validateSingUp(user)).not.toThrow();
    });

    it("should throw an error if name is missing", () => {
        const user = {
            userName: "john_doe",
            email: "john.doe@example.com",
            phoneNumber: "+1234567890",
            password: "password123",
            confirmPassword: "password123",
            robotToken: "robot123"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("name is required");
        }
    });

    it("should be an invalid user as name is invalid", () => {
        const user = {
            name: "name",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234567890",
            robotToken: "robot123"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("name must be at least 6 characters");
        }
    });

    it("should be an invalid user as user name is invalid", () => {
        const user = {
            name: "namename",
            userName: "test",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("user name must be at least 6 characters");
        }
    });
    it("should be an invalid user as email is invalid", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email must be a valid email");
        }
    });
    it("should be an invalid user as phone number is invalid", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "01234567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("phone number structure is not valid");
        }
    });
    it("should be an invalid user as phone number is invalid", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234f567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("phone number structure is not valid");
        }
    });
    it("should be an invalid user as password is invalid", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@gmail.com",
            password: "pass",
            confirmPassword: "pass",
            phoneNumber: "+201234567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password must be at least 6 characters");
        }
    });
    it("should be an invalid user as confirm password is invalid", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "passwordd",
            phoneNumber: "+201234567890",
            robotToken: "token"
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("passwords don't match");
        }
    });
    it("should be an invalid user as robot token is not exist", () => {
        const user = {
            name: "namename",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234567890",
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("robot token is required");
        }
    });
});

describe("test validateLogIn", () => {
    it("should validate a correct login request", () => {
        const requestBody = {
            email: "john.doe@example.com",
            password: "password123"
        };
        expect(() => validateLogIn(requestBody)).not.toThrow();
    });

    it("should throw an error if email is missing", () => {
        const requestBody = {
            password: "password123"
        };
        try {
            validateLogIn(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email is required");
        }
    });

    it("should be an invalid login data as email is invalid", () => {
        const user = {
            email: "omargmail.com",
            password: "password"
        };
        try {
            validateLogIn(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("email must be a valid email");
        }
    });


    it("should throw an error if password is missing", () => {
        const requestBody = {
            email: "john.doe@example.com"
        };
        try {
            validateLogIn(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password is required");
        }
    });

    it("should be an invalid user as password is invalid", () => {
        const user = {
            email: "omar@gmail.com",
            password: "  88f"
        };
        try {
            validateLogIn(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("password must be at least 6 characters");
        }
    });

});

describe("test validatePhone", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (checkPhoneNumber as jest.Mock).mockReturnValue("+201234567890");
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should validate a correct phone number", () => {
        const requestBody = {
            phoneNumber: "+201234567890"
        };
        expect(() => validatePhone(requestBody)).not.toThrow();
    });

    it("should throw an error if phone number is missing", () => {
        const requestBody = {};
        try {
            validatePhone(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("phone number is required");
        }
    });

    it("should throw an error if phone number is invalid", () => {
        const requestBody = {
            phoneNumber: "1234567890"
        };
        try {
            validatePhone(requestBody);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("phone number structure is not valid");
        }
    });

    it("should be an invalid user as phone number is invalid", () => {
        const user = {
            phoneNumber: "+201234f567890",
        };
        try {
            validatePhone(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("phone number structure is not valid");
        }
    });

});
