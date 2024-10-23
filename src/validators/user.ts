import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import { phone } from "phone";

// TODO: uncomment robotToken when integration

const validateSingUp = (requestBody: Record<string, string>) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string()
            .regex(/^[a-zA-Z\s]+$/) // allow only english characters and white spaces
            .min(6)
            .max(30)
            .required(),
        userName: Joi.string().alphanum().min(6).max(30).required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string()
            .pattern(/^\+[0-9\-\s]+$/) // start with + and allow only numbers and - and white spaces
            .required(),
        password: Joi.string().min(6).max(50).required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
        //robotToken: Joi.string().required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
    // get country of phoneNumber and check structure and format of phoneNumber
    const { countryIso3 } = phone(requestBody.phoneNumber);
    if (!countryIso3) {
        throw new Error("Phone number structure is not valid");
    }
    const phoneValidate = phone(requestBody.phoneNumber, { country: countryIso3 });
    if (!phoneValidate.isValid) {
        throw new Error("Phone number structure is not valid");
    }
    return phoneValidate.phoneNumber;
};

const validatePhone = (requestBody: Record<string, string>) => {
    const schema: ObjectSchema = Joi.object({
        phoneNumber: Joi.string()
            .pattern(/^\+[0-9\-\s]+$/) // start with + and allow only numbers and - and white spaces
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
    const { countryIso3 } = phone(requestBody.phoneNumber);
    if (!countryIso3) {
        throw new Error("Phone number structure is not valid");
    }
    const phoneValidate = phone(requestBody.phoneNumber, { country: countryIso3 });
    if (!phoneValidate.isValid) {
        throw new Error("Phone number structure is not valid");
    }
    return phoneValidate.phoneNumber;
};

const validateLogIn = (requestBody: Record<string, string>) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(50).required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};

export { validateSingUp, validateLogIn, validatePhone };
