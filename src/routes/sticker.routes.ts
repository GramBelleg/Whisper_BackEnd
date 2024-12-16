import { Router } from "express";
import getStickers from "@controllers/stickers/get.stickers.controller";
import addSticker from "@controllers/stickers/add.sticker.controller";
import asyncHandler from "express-async-handler";

const router: Router = Router();
router.get("/", asyncHandler(getStickers));
router.post("/add", asyncHandler(addSticker));
export default router;
