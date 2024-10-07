"use strict";
/**
 * @swagger
 * paths:
 *  /googleToken:
 *   post:
 *    summary: Decode token from google sign-up of login service to get user's data
 *    operationID: Google Token
 *    tags:
 *     - Authentication - Registration
 *    requestBody:
 *     required: true
 *     content:
 *      applicatoin/json:
 *       schema:
 *        type: object
 *        properties:
 *         token:
 *          type: string
 *    responses:
 *      200:
 *        description: data of user
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *               status:
 *                type: string
 *               user:
 *                type: object
 *                properties:
 *                 id:
 *                  type: integer
 *                 name:
 *                  type: string
 *                 email:
 *                  type: string
 *               user_token:
 *                type: string
 *
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_controller_1 = __importDefault(require("@controllers/google-auth-controller"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/googleToken", google_auth_controller_1.default);
exports.default = router;
