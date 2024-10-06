"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogIn = exports.validateSingUp = void 0;
const joi_1 = __importDefault(require("joi"));
const validateSingUp = (name, email, password, confirm_pass) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().alphanum().min(3).max(30).required(),
        email: joi_1.default.string()
            .email()
            .pattern(/@gmail\.com$/)
            .required(),
        password: joi_1.default.string().min(3).max(50).required(),
        confirm_pass: joi_1.default.string()
            .valid(joi_1.default.ref("password"))
            .required()
            .messages({ "any.only": "Passwords don't match" }),
    });
    const error = schema.validate({ name, email, password, confirm_pass }, { abortEarly: false }).error;
    if (error) {
        throw new Error(error.details[0].message);
    }
};
exports.validateSingUp = validateSingUp;
const validateLogIn = (email, password) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(3).max(50).required(),
    });
};
exports.validateLogIn = validateLogIn;
