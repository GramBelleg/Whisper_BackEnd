import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";

const validateSingUp = (name: string, email: string, password: string, confirm_pass: string) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string()
            .email()
            .pattern(/@gmail\.com$/)
            .required(),
        password: Joi.string().min(3).max(50).required(),
        confirm_pass: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
    });
    const error: ValidationError | undefined = schema.validate(
        { name, email, password, confirm_pass },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};

const validateLogIn = (email: string, password: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(50).required(),
    });
};

export { validateSingUp, validateLogIn };
