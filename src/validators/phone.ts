import { phone } from "phone";
import HttpError from "@src/errors/HttpError";

function checkPhoneNumber(phoneNumber: string) {
    const regx = /^\+[0-9\-\s]+$/;
    if (!regx.test(phoneNumber)) {
        throw new HttpError("Phone number structure is not valid", 422);
    }
    const { countryIso3 } = phone(phoneNumber);
    if (!countryIso3) {
        throw new HttpError("Phone number structure is not valid", 422);
    }
    const phoneValidate = phone(phoneNumber, { country: countryIso3 });
    if (!phoneValidate.isValid) {
        throw new HttpError("Phone number structure is not valid", 422);
    }
    return phoneValidate.phoneNumber;
}

export { checkPhoneNumber };