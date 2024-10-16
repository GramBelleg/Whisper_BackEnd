import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import { phone } from "phone";

const validateSingUp = (requestBody: Record<string, string>) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string()
            .email()
            .required(),
        phoneNumber: Joi.string()
            .required(),
        password: Joi.string().min(6).max(50).required(),
        confirmPass: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
        robotToken: Joi.string()
            .required()
    });
    const error: ValidationError | undefined = schema.validate(
        requestBody,
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
    //check structure and format of phone_number
    const phoneValidate = phone(requestBody.phoneNumber);
    if (!phoneValidate.isValid) {
        throw new Error('Phone number structure is not valid');
    }
    return phoneValidate.phoneNumber;
};

const validateLogIn = (email: string, password: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(50).required(),
    });
};

export { validateSingUp, validateLogIn };
