import Joi, { ObjectSchema, ValidationError } from 'joi';
import HttpError from "@src/errors/HttpError";

const validateBlockData = (users: number[], blocked: boolean) => {
    const schema: ObjectSchema = Joi.object({
        users: Joi.array()
            .items(Joi.number())
            .min(1)
            .messages({
                "any.required": "Users are required",
                "array.base": "Users must be an array",
                "array.min": "At least one user is required",
                "number.base": "User must be a number",
            })
            .required(),
        blocked: Joi.boolean().required().messages({
            "any.required": "Block is required",
            "boolean.base": "Block must be a boolean",
        }),
    });
    const error: ValidationError | undefined = schema.validate({ users, blocked }, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
}

const validateReadReceipt = (readReceipts: boolean) => {
    const schema: ObjectSchema = Joi.object({
        readReceipts: Joi.boolean().strict().required().messages({
            "any.required": "Read receipts is required",
            "boolean.base": "Read receipts must be a boolean",
        }),
    });
    const error: ValidationError | undefined = schema.validate({ readReceipts }, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
}

const validateFCMToken = (fcmToken: string) => {
    const schema: ObjectSchema = Joi.object({
        fcmToken: Joi.string().required().messages({
            "any.required": "FCM token is required",
            "string.base": "FCM token must be a string",
        }),
    });
    const error: ValidationError | undefined = schema.validate({ fcmToken }, {
        abortEarly: false,
    }).error;
    if (error) {
        throw new HttpError(error.details[0].message, 422);
    }
}

export { validateBlockData, validateReadReceipt, validateFCMToken };