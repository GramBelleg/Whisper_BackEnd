"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * This is the configuration of object which send emails on gmail
 */
const transporter = nodemailer_1.default.createTransport({
    host: process.env.HOST_EMAIL,
    port: parseInt(process.env.PORT_EMAIL, 10),
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});
exports.default = transporter;
