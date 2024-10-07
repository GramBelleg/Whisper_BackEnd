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
 *           format: email
 *          password:
 *           type: string
 *           format: password
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
 *           format: email
 *          phone_number:
 *           type: string
 *           pattern: /^(011|010|012|015)\d{8}$/
 *          password:
 *           type: string
 *           format: password
 *          confirm_pass:
 *           type: string
 *           format: password
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
 *  /logout:
 *   get:
 *    summary: Logout and delete token cookie
 *    operationID: Logout
 *    tags:
 *     - Authentication - Registration
 *    responses:
 *      200:
 *        content:
 *         application/json:
 *          schema:
 *           type: object
 *           properties:
 *            status:
 *             type: string
 *            message:
 *             type: string
 *
 */

import { Router } from "express";
import login from "@controllers/AuthenRegist/login.controller";
import signup from "@controllers/AuthenRegist/signup.controller";
import { generateCode, verifyCode } from "@controllers/AuthenRegist/verification.controller";
import googleAuth from "@controllers/AuthenRegist/google.auth.controller";
import logout from "@controllers/AuthenRegist/logout.controller";
import userAuth from "@middlewares/auth.middleware";


const router: Router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/generateCode", generateCode);
router.post("/verifyCode", verifyCode);
router.post("/googleToken", googleAuth);

router.get("/logout", userAuth, logout);


export default router;
