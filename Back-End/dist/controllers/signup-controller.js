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
const randomstring_1 = __importDefault(require("randomstring"));
const send_email_service_1 = __importDefault(require("@services/send-email-service"));
const user_1 = require("@validators/user");
const signup_service_1 = require("@services/signup-service");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //validate user data recieved from request body
        const { name, email, password, confirm_pass } = req.body;
        (0, user_1.validateSingUp)(name, email, password, confirm_pass);
        //check if user is found in database
        yield (0, signup_service_1.findUser)(email, password);
        //send verification code to email
        const verification_code = randomstring_1.default.generate(8);
        const info = yield (0, send_email_service_1.default)(verification_code, email);
        if (!info) {
            throw new Error("Error in sending email");
        }
        //upsert user in db
        yield (0, signup_service_1.upsertUser)(name, email, password, verification_code);
        res.status(200).json({
            status: "success",
            user_data: {
                name,
                email,
            },
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
exports.default = signup;
