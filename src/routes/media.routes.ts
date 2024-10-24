import { Router, Request, Response } from "express";
import { writeBlob, readBlob } from "@controllers/media/blob.controller";

const router: Router = Router();
router.post("/write", writeBlob);
router.post("/read", readBlob);
export default router;
