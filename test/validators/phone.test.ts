import { checkPhoneNumber } from "@src/validators/phone";
import HttpError from "@src/errors/HttpError";


describe("test check phone number function", () => {
    it("should be a valid phone number", () => {
        const phoneNumber = "+201234567890";
        const checkedPhoneNumber = checkPhoneNumber(phoneNumber);
        expect(checkedPhoneNumber).toEqual(phoneNumber);
    });
    it("should be an invalid phone number as there is not country code", () => {
        expect(() => checkPhoneNumber("01234567890")).toThrow(new HttpError("Phone number structure is not valid", 422));
    });
    it("should be an invalid phone number as structure is not valid", () => {
        expect(() => checkPhoneNumber("+2012345e67890")).toThrow(new HttpError("Phone number structure is not valid", 422));
    });
    it("should be an invalid phone number as structure is not valid", () => {
        expect(() => checkPhoneNumber("+2012345678901")).toThrow(new HttpError("Phone number structure is not valid", 422));
    });
    it("should be an invalid phone number as structure is not valid", () => {
        expect(() => checkPhoneNumber("+20123456789")).toThrow(new HttpError("Phone number structure is not valid", 422));
    });
});