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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = null;
        if (req.signedCookies.token) {
            token = req.signedCookies.token;
        }
        else if (req.headers.authorization) {
            token = req.headers.authorization.replace("Bearer ", "");
        }
        else {
            throw new Error("Token is not found");
        }
        const id = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        req.userId = id;
        next();
    }
    catch (e) {
        console.log(e.message);
        let message = e.message;
        if (e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            message = "Expired Token. Login again";
        }
        res.status(401).json({
            status: "failed",
            message,
        });
    }
});
exports.default = userAuth;
