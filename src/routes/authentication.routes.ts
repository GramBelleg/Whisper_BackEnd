/**
 * @swagger
 * paths:
 *  /api/auth/login:
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
 *         required:
 *          - email
 *          - password
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          password:
 *           type: string
 *           format: password
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                userToken:
 *                 type: string
 *                user:
 *                 type: object
 *                 properties:
 *                  id:
 *                   type: integer
 *                  name:
 *                   type: string
 *                  userName:
 *                   type: string
 *                  email:
 *                   type: string
 *                   format: email
 *
 *  /api/auth/signup:
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
 *         required:
 *          - name
 *          - userName
 *          - email
 *          - phoneNumber
 *          - password
 *          - confirmPassword
 *          - robotToken
 *         properties:
 *          name:
 *           type: string
 *           pattern: /^[a-zA-Z\s]+$/
 *           description: allow only english characters and white spaces
 *          userName:
 *           type: string
 *           description: allow only english characters and numbers
 *          email:
 *           type: string
 *           format: email
 *          phoneNumber:
 *           type: string
 *           pattern: /^\+[0-9\-\s]+$/
 *           description: start with + and allow only numbers and - and white spaces
 *          password:
 *           type: string
 *           format: password
 *          confirmPassword:
 *           type: string
 *           format: password
 *           description: the same password for confirmation
 *          robotToken:
 *           type: string
 *           description: the token from recaptcha (I am not robot)
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                userData:
 *                 type: object
 *                 properties:
 *                  name:
 *                   type: string
 *                  email:
 *                   type: string
 *                   format: email
 *
 *  /api/auth/resendConfirmCode:
 *   post:
 *     summary: Generate and resend confirmation code to confirm user's email to add new account
 *     operationID: Send Confrimation Code
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - email
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 *  /api/auth/confirmEmail:
 *   post:
 *     summary: Verify code to confirm user's email
 *     operationID: Confirm Email
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - email
 *          - code
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          code:
 *           type: string
 *           length: 8
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 *  /api/auth/sendResetCode:
 *   post:
 *     summary: Generate and send reset code to change user's password
 *     operationID: Send Reset Code
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - email
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 *  /api/auth/resetPassword:
 *   post:
 *     summary: Verify code to change user's password
 *     operationID: Change Password
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - email
 *          - password
 *          - confirmPassword
 *          - code
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          password:
 *           type: string
 *           format: password
 *          confirmPassword:
 *           type: string
 *           format: password
 *           description: the same password for confirmation
 *          code:
 *           type: string
 *           length: 8
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *
 *  /api/auth/google:
 *   post:
 *     summary: Login option using google api
 *     operationID: Google login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - authCode
 *         properties:
 *          authCode:
 *           type: string
 *           description: resulted code from google login in client-side
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
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
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 *  /api/auth/facebook:
 *   get:
 *     summary: Login option using facebook api
 *     operationID: Facebook login
 *     tags:
 *      - Authentication - Registration
 *     responses:
 *       302:
 *         description: redirection client to page of facebook login
 *
 *  /api/auth/facebook/callback:
 *   get:
 *     summary: Authenticate facebook login
 *     operationID: Facebook Authentication
 *     tags:
 *      - Authentication - Registration
 *     parameters:
 *      - in: query
 *        name: code
 *        schema:
 *         type: string
 *        description: code which is got after facebook login api
 *      - in: query
 *        name: state
 *        schema:
 *         type: string
 *        description: state which is got after facebook login api
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
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
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 *  /api/auth/github:
 *   get:
 *     summary: Login option using github api
 *     operationID: Github login
 *     tags:
 *      - Authentication - Registration
 *     responses:
 *       302:
 *         description: redirection client to page of github login
 *
 *  /api/auth/github/callback:
 *   get:
 *     summary: Authenticate github login
 *     operationID: Github Authentication
 *     tags:
 *      - Authentication - Registration
 *     parameters:
 *      - in: query
 *        name: authCode
 *        schema:
 *         type: string
 *        description: authCode which is got after github login api
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
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
 *                  format: email
 *              userToken:
 *               type: string
 *               description: token which will be used in authentication inside application
 *
 *  /api/auth/logoutOne:
 *   get:
 *    summary: Logout from current device and delete token cookie of current device
 *    operationID: Logout One
 *    security:
 *     - cookieAuth: []
 *    tags:
 *     - Authentication - Registration
 *    responses:
 *      401:
 *       $ref: "#/components/responses/requestError"
 *      400:
 *       $ref: "#/components/responses/requestError"
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
 *  /api/auth/logoutAll:
 *   get:
 *    summary: Logout from all devices of this user and delete token cookie of current device
 *    operationID: Logout All
 *    security:
 *     - cookieAuth: []
 *    tags:
 *     - Authentication - Registration
 *    responses:
 *      401:
 *       $ref: "#/components/responses/requestError"
 *      400:
 *       $ref: "#/components/responses/requestError"
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
import login from "@controllers/auth/login.controller";
import signup from "@controllers/auth/signup.controller";
import { resendConfirmCode, confirmEmail } from "@controllers/auth/confirmation.controller";
import googleAuth from "@controllers/auth/google.auth.controller";
import { githubAuth, githubRedirect } from "@controllers/auth/github.auth.controller";
import { facebookAuth, facebookRedirect } from "@controllers/auth/facebook.auth.controller";
import userAuth from "@middlewares/auth.middleware";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";
import { resetPassword, sendResetCode } from "@controllers/auth/reset.password.controller";

const router: Router = Router();

router.post("/login", login);

router.post("/signup", signup);
router.post("/resendConfirmCode", resendConfirmCode);
router.post("/confirmEmail", confirmEmail);

router.post("/sendResetCode", sendResetCode);
router.post("/resetPassword", resetPassword);

router.post("/google", googleAuth);
router.get("/facebook", facebookRedirect);
router.get("/facebook/callback", facebookAuth);
router.get("/github", githubRedirect);
router.get("/github/callback", githubAuth);

export default router;
