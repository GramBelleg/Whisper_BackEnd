"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCode = exports.validateEmail = void 0;
const joi_1 = __importDefault(require("joi"));
const validateEmail = (email) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .pattern(/@gmail\.com$/)
            .required(),
    });
    const error = schema.validate({ email }, { abortEarly: false }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};
exports.validateEmail = validateEmail;
const validateCode = (email, code) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .pattern(/@gmail\.com$/)
            .required(),
        code: joi_1.default.string().required(),
    });
    const error = schema.validate({ email, code }, { abortEarly: false }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};
exports.validateCode = validateCode;
