import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import HttpError from "@src/errors/HttpError";

const validateEmail = (email: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email()
            .messages({
                "string.base": "email must be a string",
                "string.empty": "email cannot be empty",
                "string.email": "email must be a valid email",
                "any.required": "email is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { email },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateConfirmCode = (email: string, code: string) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email()
            .messages({
                "string.base": "email must be a string",
                "string.empty": "email cannot be empty",
                "string.email": "email must be a valid email",
                "any.required": "email is required",
            })
            .required(),
        code: Joi.string().length(8)
            .messages({
                "string.base": "code must be a string",
                "string.empty": "code cannot be empty",
                "string.length": "code must be 8 characters",
                "any.required": "code is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { email, code },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateResetCode = (requestBody: Record<string, any>) => {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email()
            .messages({
                "string.base": "email must be a string",
                "string.empty": "email cannot be empty",
                "string.email": "email must be a valid email",
                "any.required": "email is required",
            })
            .required(),
        password: Joi.string().min(6).max(50)
            .messages({
                "string.base": "password must be a string",
                "string.empty": "password cannot be empty",
                "string.min": "password must be at least 6 characters",
                "string.max": "password must be at most 50 characters",
                "any.required": "password is required",
            })
            .required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "passwords don't match",
                "string.base": "confirm password must be a string",
                "string.empty": "confirm password cannot be empty",
                "any.required": "confirm password is required",
            }),
        code: Joi.string().length(8)
            .messages({
                "string.base": "code must be a string",
                "string.empty": "code cannot be empty",
                "string.length": "code must be 8 characters",
                "any.required": "code is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};
export { validateEmail, validateConfirmCode, validateResetCode };
