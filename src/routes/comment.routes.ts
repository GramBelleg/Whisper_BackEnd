import { handleGetComments, handleGetReplies } from "@controllers/messages/get.messages";
import { Router } from "express";
import asyncHandler from "express-async-handler";
const router: Router = Router();

router.route("/:messageId/comments").get(asyncHandler(handleGetComments));
router.route("/:messageId/comments/:commentId").get(asyncHandler(handleGetReplies));
