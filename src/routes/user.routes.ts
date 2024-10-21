/**
 * @swagger
 * paths:
 *  /:
 *   get:
 *    summary: Authenticate token cookie
 *    operationID: Authenticate Token
 *    security:
 *     - cookieAuth: []
 *    tags:
 *     - User
 *    responses:
 *      200:
 *        description: Declare that user is autheticated
 *
 *
 *  /logout:
 *   get:
 *    summary: Logout and delete token cookie
 *    operationID: Logout
 *    tags:
 *     - User
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

import { Router, Request, Response } from "express";
import * as userController from "@controllers/Profile/user.controller";
const router: Router = Router();


//router.put("/user", userController.updateUser);
router.put("/name", userController.updateName);
router.put("/bio", userController.updateBio);
router.get("", userController.UserInfo);
router.put("/email", userController.updateEmail);
router.post("/emailcode", userController.emailCode);
router.put("/phone", userController.updatePhone);
router.put("/profilepic", userController.changePic); //Use media route "/write" first to upload image
router.post("/story", userController.setStory);
router.delete("/story", userController.deleteStory);
export default router;
