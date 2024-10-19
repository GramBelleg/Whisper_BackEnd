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
 */

import { Router, Request, Response } from "express";
import { writeBlob, readBlob } from "@controllers/media/blob.controller";

const router: Router = Router();
router.post("/write", writeBlob);
router.get("/read", readBlob);
export default router;
