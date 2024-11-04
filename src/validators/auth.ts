import HttpError from "@src/errors/HttpError";
import Joi, { ObjectSchema, ValidationError } from "joi";
import { checkPhoneNumber } from "./phone";

const validateName = (name: any) => {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().min(6).max(50)
            .messages({
                "string.base": "name must be a string",
                "string.empty": "name cannot be empty",
                "string.min": "name must be at least 6 characters",
                "string.max": "name must be at most 50 characters",
                "any.required": "name is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { name },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateUserName = (userName: any) => {
    const schema: ObjectSchema = Joi.object({
        userName: Joi.string().min(6).max(50)
            .messages({
                "string.base": "user name must be a string",
                "string.empty": "user name cannot be empty",
                "string.min": "user name must be at least 6 characters",
                "string.max": "user name must be at most 50 characters",
                "any.required": "user name is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { userName },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateEmail = (email: any) => {
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

const validatePhoneNumber = (phoneNumber: any) => {
    const schema: ObjectSchema = Joi.object({
        phoneNumber: Joi.string()
            .pattern(/^\+[0-9\-\s]+$/) // start with + and allow only numbers and - and white spaces
            .messages({
                "string.base": "phone number must be a string",
                "string.empty": "phone number cannot be empty",
                "string.pattern.base": "phone number structure is not valid",
                "any.required": "phone number is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate({ phoneNumber }, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
    return checkPhoneNumber(phoneNumber);
};

const validatePassword = (password: any) => {
    const schema: ObjectSchema = Joi.object({
        password: Joi.string().min(6).max(50)
            .messages({
                "string.base": "password must be a string",
                "string.empty": "password cannot be empty",
                "string.min": "password must be at least 6 characters",
                "string.max": "password must be at most 50 characters",
                "any.required": "password is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { password },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateConfirmPassword = (password: any, confirmPassword: any) => {
    const schema: ObjectSchema = Joi.object({
        password: Joi.string().required()
            .messages({
                "string.base": "password must be a string",
                "string.empty": "password cannot be empty",
                "any.required": "password is required",
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "passwords don't match",
                "string.base": "confirm password must be a string",
                "string.empty": "confirm password cannot be empty",
                "any.required": "confirm password is required",
            }),
    });
    const error: ValidationError | undefined = schema.validate(
        { password, confirmPassword },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateRobotToken = (robotToken: any) => {
    const schema: ObjectSchema = Joi.object({
        robotToken: Joi.string()
            .messages({
                "string.base": "robot token must be a string",
                "string.empty": "robot token cannot be empty",
                "any.required": "robot token is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(
        { robotToken },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};

const validateCode = (code: any) => {
    const schema: ObjectSchema = Joi.object({
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
        { code },
        { abortEarly: false }
    ).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
}

export {
    validateName,
    validateUserName,
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    validateConfirmPassword,
    validateRobotToken,
    validateCode,
};