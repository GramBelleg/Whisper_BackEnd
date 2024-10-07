"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const randomstring_1 = __importDefault(require("randomstring"));
const sendEmail_1 = __importDefault(require("@services/sendEmail"));
const _DB_1 = __importDefault(require("@DB"));
const verfication_code = {
    generateCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .pattern(/@gmail\.com$/)
                    .required(),
            });
            const { email } = req.body;
            const error = schema.validate({ email }, { abortEarly: false }).error;
            if (error) {
                throw new Error(error.details[0].message);
            }
            const found_user = yield _DB_1.default.user.findUnique({
                where: { email },
            });
            if (!found_user) {
                throw new Error("Email is not found");
            }
            const code = randomstring_1.default.generate(8); // verification code length is exact 8
            const info = yield (0, sendEmail_1.default)(code, email);
            if (!info) {
                throw new Error("Error in sending email");
            }
            yield _DB_1.default.user.update({
                where: { email },
                data: {
                    verfication_code: {
                        upsert: {
                            update: { code },
                            create: { code },
                        },
                    },
                },
            });
            res.status(200).json({
                status: "success",
            });
        }
        catch (e) {
            console.log(e.message);
            res.status(400).json({
                status: "failed",
                message: e.message,
            });
        }
    }),
    verifyCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .pattern(/@gmail\.com$/)
                    .required(),
                code: joi_1.default.string().required(),
            });
            const { email, code } = req.body;
            const error = schema.validate({ email, code }, { abortEarly: false }).error;
            if (error) {
                throw new Error(error.details[0].message);
            }
            const data = yield _DB_1.default.verification.findUnique({
                where: {
                    code,
                    user: {
                        is: {
                            email,
                        },
                    },
                },
            });
            if (!data) {
                throw new Error("Invalid code");
            }
            let expire_date = new Date();
            expire_date.setDate(expire_date.getDate() - 1);
            if (expire_date > data.created_at) {
                throw new Error("Expried code");
            }
            yield _DB_1.default.user.update({
                where: { email },
                data: { email_status: "Activated" },
            });
            res.status(200).json({
                status: "success",
            });
        }
        catch (e) {
            console.log(e.message);
            res.status(400).json({
                status: "failed",
                message: e.message,
            });
        }
    }),
};
exports.default = verfication_code;
