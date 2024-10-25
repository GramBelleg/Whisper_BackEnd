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
 */

import { Router, Request, Response } from "express";
import * as userController from "@controllers/user/user.controller";
import * as storyController from "@controllers/user/story.controller";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";
const router: Router = Router();

//router.put("/user", userController.updateUser);
router.put("/name", userController.updateName);
router.put("/bio", userController.updateBio);
router.get("", userController.UserInfo);
router.put("/email", userController.updateEmail);
router.post("/emailcode", userController.emailCode);
router.put("/phone", userController.updatePhone);
router.put("/profilepic", userController.changePic); //Use media route "/write" first to upload image
router.put("/username", userController.changeUserName);
router.post("/story", storyController.setStory);
router.delete("/story", storyController.deleteStory);
router.get("/logoutOne", logoutOne);
router.get("/logoutAll", logoutAll);
export default router;
