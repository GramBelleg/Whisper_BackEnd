import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import { phone } from 'phone';

const validateSingUp = (name: string, email: string, phone_number: string, password: string, confirm_pass: string) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string()
            .email()
            .required(),
        phone_number: Joi.string()
            .required(),
        password: Joi.string().min(3).max(50).required(),
        confirm_pass: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
    });
    const error: ValidationError | undefined = schema.validate(
        { name, email, phone_number, password, confirm_pass },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
    //check structure and format of phone_number
    const { isValid, phoneNumber } = phone(phone_number);
    if (!isValid) {
        throw new Error('Phone number structure is not valid');
    }
    return phoneNumber;
};

const validateLogIn = (email: string, password: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(50).required(),
    });
};

export { validateSingUp, validateLogIn };
