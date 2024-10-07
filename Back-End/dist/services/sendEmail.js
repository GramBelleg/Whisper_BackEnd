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
const emailConfig_1 = __importDefault(require("@config/emailConfig"));
function sendEmail(code, email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email_body = `<h3>Hello from Omar,</h3>
            <p>Thanks for joining our family. Use this code: <b>   ${code}     </b> for verifing your email</p>`;
            const info = yield emailConfig_1.default.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Email verfication",
                html: email_body,
            });
            return info;
        }
        catch (e) {
            console.log(e.message);
            return undefined;
        }
    });
}
// module.exports = sendEmail;
exports.default = sendEmail;
