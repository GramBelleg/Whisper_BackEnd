import HttpError from "@src/errors/HttpError";
import Joi, { ObjectSchema } from "joi";
import { ValidationError } from "joi";
import { checkPhoneNumber } from "./phone";

const validateSingUp = (user: Record<string, any>) => {
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
        userName: Joi.string().min(6).max(50)
            .messages({
                "string.base": "user name must be a string",
                "string.empty": "user name cannot be empty",
                "string.min": "user name must be at least 6 characters",
                "string.max": "user name must be at most 50 characters",
                "any.required": "user name is required",
            })
            .required(),
        email: Joi.string().email()
            .messages({
                "string.base": "email must be a string",
                "string.empty": "email cannot be empty",
                "string.email": "email must be a valid email",
                "any.required": "email is required",
            })
            .required(),
        phoneNumber: Joi.string()
            .pattern(/^\+[0-9\-\s]+$/) // start with + and allow only numbers and - and white spaces
            .messages({
                "string.base": "phone number must be a string",
                "string.empty": "phone number cannot be empty",
                "string.pattern.base": "phone number structure is not valid",
                "any.required": "phone number is required",
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
        robotToken: Joi.string()
            .messages({
                "string.base": "robot token must be a string",
                "string.empty": "robot token cannot be empty",
                "any.required": "robot token is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(user, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
    return checkPhoneNumber(user.phoneNumber);
};

const validatePhone = (requestBody: Record<string, any>) => {
    const schema: ObjectSchema = Joi.object({
        phoneNumber: Joi.string()
            .pattern(/^\+[0-9\-\s]+$/)
            .messages({
                "string.base": "phone number must be a string",
                "string.empty": "phone number cannot be empty",
                "string.pattern.base": "phone number structure is not valid",
                "any.required": "phone number is required",
            })
            .required(),
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
    return checkPhoneNumber(requestBody.phoneNumber);
};

const validateLogIn = (requestBody: Record<string, any>) => {
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
    });
    const error: ValidationError | undefined = schema.validate(requestBody, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
};



export { validateSingUp, validateLogIn, validatePhone };
