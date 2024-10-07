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
const google_auth_service_1 = require("@services/google-auth-service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_service_1 = __importDefault(require("@services/cookie-service"));
function googleAuth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // google token after sign-up or login using google service
            const token = req.body.token;
            if (!token) {
                throw new Error("There is no token");
            }
            //get user info using googleApi
            const data = yield (0, google_auth_service_1.getUserData)(token);
            if (!data) {
                throw new Error("Invalid token");
            }
            //upsert user into db
            const user = yield (0, google_auth_service_1.upsertUser)(data);
            //create a jwt and store it in a cookie
            const user_token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            });
            (0, cookie_service_1.default)(res, user_token);
            res.status(200).json({
                status: "success",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                user_token,
            });
        }
        catch (err) {
            console.log(err.message);
            res.status(400).json({
                status: "failed",
                message: err.message,
            });
        }
    });
}
exports.default = googleAuth;
