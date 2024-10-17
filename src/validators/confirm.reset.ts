import Joi, { ObjectSchema, string } from "joi";
import { ValidationError } from "joi";

const validateEmail = (email: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { email },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};

const validateConfirmCode = (email: string, code: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().length(8).required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { email, code },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};

const validateResetCode = (requestBody: Record<string, string>) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(50).required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
        code: Joi.string().length(8).required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};
export { validateEmail, validateConfirmCode, validateResetCode };
