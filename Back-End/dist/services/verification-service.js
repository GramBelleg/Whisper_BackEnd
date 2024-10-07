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
exports.updateVerifiedUser = exports.findVerifiedUser = exports.updateUser = exports.findUser = void 0;
const PrismaClient_1 = __importDefault(require("src/prisma/PrismaClient"));
const findUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const found_user = yield PrismaClient_1.default.user.findUnique({
        where: { email },
    });
    if (!found_user) {
        throw new Error("Email is not found");
    }
});
exports.findUser = findUser;
const findVerifiedUser = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield PrismaClient_1.default.verification.findUnique({
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
});
exports.findVerifiedUser = findVerifiedUser;
const updateUser = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    yield PrismaClient_1.default.user.update({
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
});
exports.updateUser = updateUser;
const updateVerifiedUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    yield PrismaClient_1.default.user.update({
        where: { email },
        data: { email_status: "Activated" },
    });
});
exports.updateVerifiedUser = updateVerifiedUser;
