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

import googleAuth from "@controllers/google.auth.controller";
import { Router } from "express";

const router: Router = Router();

router.post("/googleToken", googleAuth);

export default router;
