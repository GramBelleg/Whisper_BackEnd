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
exports.upsertUser = exports.findUser = void 0;
const _DB_1 = __importDefault(require("@DB"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const findUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const found_user = yield _DB_1.default.user.findUnique({
        where: { email },
    });
    if (found_user && found_user.email_status === "Activated") {
        throw new Error("Email is already found");
    }
});
exports.findUser = findUser;
const upsertUser = (name, email, password, verification_code) => __awaiter(void 0, void 0, void 0, function* () {
    yield _DB_1.default.user.upsert({
        where: { email },
        update: {
            name,
            password: bcrypt_1.default.hashSync(password, 10),
            verfication_code: {
                update: {
                    code: verification_code,
                },
            },
        },
        create: {
            name,
            email,
            password: bcrypt_1.default.hashSync(password, 10),
            verfication_code: {
                create: {
                    code: verification_code,
                },
            },
        },
    });
});
exports.upsertUser = upsertUser;
