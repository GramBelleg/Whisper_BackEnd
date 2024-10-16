/**
 * @swagger
 * paths:
 *  /apis/user/:
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
 */

import { Router, Request, Response } from "express";

const router: Router = Router();

router.route("/").get((req: Request, res: Response) => {
    res.status(200).json({ status: 'success' });
});

export default router;
