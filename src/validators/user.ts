import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import { phone } from "phone";

const validateSingUp = (
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().min(3).max(50).required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
    });
    const error: ValidationError | undefined = schema.validate(
        { name, email, phoneNumber, password, confirmPassword },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
    //check structure and format of phoneNumber
    const validateNumber = phone(phoneNumber);
    if (!validateNumber.isValid) {
        throw new Error("Phone number structure is not valid");
    }
    return validateNumber.phoneNumber;
};

const validateLogIn = (email: string, password: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(50).required(),
    });
};

export { validateSingUp, validateLogIn };

