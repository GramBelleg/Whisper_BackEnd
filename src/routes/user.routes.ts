/**
 * @swagger
 * paths:
 *  /:
 *   get:
 *    summary: Authenticate token cookie
 *    operationID: Authenticate Token
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

router.route("/").get((req: Request, res: Response) => {
    res.sendStatus(200);
});
router.put("/user", userController.updateUser);
router.get("/user", userController.getUserInfo);
router.post("/story", userController.setStory);
router.delete("/story", userController.deleteStory);
export default router;
