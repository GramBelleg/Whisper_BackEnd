import { validateSingUp, validateLogIn, validatePhone } from "@src/validators/user";
import { checkPhoneNumber } from "@src/validators/phone";

jest.mock("@src/validators/phone");

describe("test validate signup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (checkPhoneNumber as jest.Mock).mockReturnValue("+201234567890");
    });
    it("should be a valid user", () => {
        const user = {
            name: "name name",
            userName: "userName",
            email: "o@gmail.com",
            password: "password",
            confirmPassword: "password",
            phoneNumber: "+201234567890",
            robotToken: "token"
        };
        const checkedPhoneNumber = validateSingUp(user);
        expect(checkedPhoneNumber).toEqual("+201234567890");
    });
    it("should be an invalid user as name is invalid", () => {
        const user = {
            name: "name",
            userName: "userName",
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
            robotToken: undefined
        };
        try {
            validateSingUp(user);
        } catch (err: any) {
            expect(err.status).toEqual(422);
            expect(err.message).toEqual("robot token is required");
        }
    });
});

describe("test validate phone number", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (checkPhoneNumber as jest.Mock).mockReturnValue("+201234567890");
    });
    it("should be a valid user (phone number)", () => {
        const user = {
            phoneNumber: "+201234567890",
        };
        const checkedPhoneNumber = validatePhone(user);
        expect(checkedPhoneNumber).toEqual("+201234567890");
    });
    it("should be an invalid user as phone number is invalid", () => {
        const user = {
            phoneNumber: "01234567890",
        };
        try {
            validatePhone(user);
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

describe("test validate login", () => {
    it("should be a valid login data", () => {
        const user = {
            email: "omar@gmail.com",
            password: "password"
        };
        const check = validateLogIn(user);
        expect(check).toBeUndefined();
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