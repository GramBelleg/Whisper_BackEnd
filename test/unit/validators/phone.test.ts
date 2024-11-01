import { checkPhoneNumber } from "@src/validators/phone";


describe("test check phone number function", () => {
    it("should be a valid phone number", () => {
        const phoneNumber = "+201234567890";
        const checkedPhoneNumber = checkPhoneNumber(phoneNumber);
        expect(checkedPhoneNumber).toEqual(phoneNumber);
    });
    it("should be an invalid phone number as there is not country code", () => {
        const phoneNumber = "01234567890";
        try {
            checkPhoneNumber(phoneNumber);
        } catch (err: any) {
            expect(err.message).toEqual("Phone number structure is not valid");
        }
    });
    it("should be an invalid phone number as structure is not valid", () => {
        const phoneNumber = "+2012345e67890";
        try {
            checkPhoneNumber(phoneNumber);
        } catch (err: any) {
            expect(err.message).toEqual("Phone number structure is not valid");
        }
    });
    it("should be an invalid phone number as structure is not valid", () => {
        const phoneNumber = "+2012345678901";
        try {
            checkPhoneNumber(phoneNumber);
        } catch (err: any) {
            expect(err.message).toEqual("Phone number structure is not valid");
        }
    });
    it("should be an invalid phone number as structure is not valid", () => {
        const phoneNumber = "+20123456789";
        try {
            checkPhoneNumber(phoneNumber);
        } catch (err: any) {
            expect(err.message).toEqual("Phone number structure is not valid");
        }
    });
});