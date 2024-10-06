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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const messaging_service_1 = require("@services/messaging-service");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderID, receiverID, message } = req.body;
    const formattedMessage = JSON.stringify({
        senderID: senderID,
        receiverID: receiverID,
        content: message,
        timestamp: new Date(),
    });
    yield (0, messaging_service_1.saveMessage)(formattedMessage);
});
exports.sendMessage = sendMessage;
exports.default = exports.sendMessage;
