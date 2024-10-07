/**
 * @swagger
 * paths:
 *  /login:
 *   post:
 *     summary: Try to login the application
 *     operationID: Login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          email:
 *           type: string
 *          password:
 *           type: string
 *     responses:
 *       200:
 *         description: data of user
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                user_token:
 *                 type: string
 *                user:
 *                 type: object
 *                 properties:
 *                  id:
 *                   type: integer
 *                  name:
 *                   type: string
 *                  email:
 *                   type: string
 *
 *  /signup:
 *   post:
 *     summary: Try to signup new user in the application
 *     operationID: SignUp
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          name:
 *           type: string
 *          email:
 *           type: string
 *          password:
 *           type: string
 *          confirm_pass:
 *           type: string
 *           description: the same password for confirmation
 *
 *     responses:
 *       200:
 *         description: data of user
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                user_data:
 *                 type: object
 *                 properties:
 *                  name:
 *                   type: string
 *                  email:
 *                   type: string
 *
 *  /generateCode:
 *   post:
 *     summary: Generate Code for verify user's email
 *     operationID: Generate Code
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          email:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: data of user
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 *  /verifyCode:
 *   post:
 *     summary: Verify Code to activate user's email
 *     operationID: Verify Code
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          email:
 *           type: string
 *          code:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: data of user
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 */

import { Router } from "express";
import login from "@controllers/login.controller";
import signup from "@controllers/signup.controller";
import { generateCode, verifyCode } from "@controllers/verification.controller";
const router: Router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/generateCode", generateCode);
router.post("/verifyCode", verifyCode);

export default router;
