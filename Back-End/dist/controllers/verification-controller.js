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
exports.verifyCode = exports.generateCode = void 0;
const randomstring_1 = __importDefault(require("randomstring"));
const send_email_service_1 = __importDefault(require("@services/send-email-service"));
const verification_1 = require("@validators/verification");
const verification_service_1 = require("@services/verification-service");
const generateCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //validate email from req body
        const { email } = req.body;
        (0, verification_1.validateEmail)(email);
        //find user in db
        yield (0, verification_service_1.findUser)(email);
        //send verification email
        const code = randomstring_1.default.generate(8); // verification code length is exact 8
        const info = yield (0, send_email_service_1.default)(code, email);
        if (!info) {
            throw new Error("Error in sending email");
        }
        //update user with verification code
        yield (0, verification_service_1.updateUser)(email, code);
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
});
exports.generateCode = generateCode;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //validate email and code from req body
        const { email, code } = req.body;
        (0, verification_1.validateCode)(email, code);
        //find user and verification code in db
        yield (0, verification_service_1.findVerifiedUser)(email, code);
        //update user email as activated
        yield (0, verification_service_1.updateVerifiedUser)(email);
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
});
exports.verifyCode = verifyCode;
