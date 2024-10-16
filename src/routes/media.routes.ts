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
import { streamAudio, uploadAudio } from "@controllers/Media/audio.controller";
import upload from "@config/multer.config";

const router: Router = Router();
router.post("/upload", upload.single("audio"), uploadAudio);
router.get("/stream/:blobName", streamAudio);
export default router;
