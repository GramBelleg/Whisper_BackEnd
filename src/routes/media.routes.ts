import { Router, Request, Response } from "express";
import { writeBlob, readBlob } from "@controllers/media/blob.controller";
import asyncHandler from "express-async-handler";

const router: Router = Router();
router.post("/write", asyncHandler(writeBlob));
router.post("/read", asyncHandler(readBlob));
export default router;
