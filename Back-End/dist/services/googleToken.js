"use strict";
/**
 * This is a service for making a request to get user data of google account based on specified scopes using google token
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserData = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const data = yield response.json();
        return data;
    }
    catch (err) {
        console.log(err.message);
        return undefined;
    }
});
exports.default = getUserData;
