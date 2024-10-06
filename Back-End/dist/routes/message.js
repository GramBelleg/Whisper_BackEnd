"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const send_message_1 = __importDefault(require("@controllers/message-controller/send-message"));
const router = (0, express_1.Router)();
router.route("/send").post(send_message_1.default);
exports.default = router;
