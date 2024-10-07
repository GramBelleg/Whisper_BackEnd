"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_auth_routes_1 = __importDefault(require("./google-auth-routes"));
const authentication_routes_1 = __importDefault(require("./authentication-routes"));
const user_routes_1 = __importDefault(require("./user-routes"));
const auth_middleware_1 = __importDefault(require("@middlewares/auth-middleware"));
const router = (0, express_1.Router)();
router.use("/", google_auth_routes_1.default);
router.use("/", authentication_routes_1.default);
router.use(auth_middleware_1.default);
router.use("/", user_routes_1.default);
exports.default = router;
