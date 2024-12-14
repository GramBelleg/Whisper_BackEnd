import { handleGetComments, handleGetReplies } from "@controllers/messages/get.messages";
import { Router } from "express";
import asyncHandler from "express-async-handler";
const router: Router = Router();

router.route("/:messageId").get(asyncHandler(handleGetComments));
router.route("/:commentId/replies").get(asyncHandler(handleGetReplies));
export default router;
