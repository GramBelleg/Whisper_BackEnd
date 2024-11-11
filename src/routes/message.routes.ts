import { Router } from "express";
import asyncHandler from "express-async-handler";
import { deleteMessagesForCurrentUser } from "@controllers/messages/delete.message";
import {
    handleGetAllMessages,
    handleGetLastMessage,
    handleGetMessage,
} from "@controllers/messages/get.messages";
import { handleSearchMessages } from "@controllers/messages/search.messages";

const router: Router = Router();

router.route("/:chatId").get(asyncHandler(handleGetAllMessages));
router.route("/:chatId/deleteForMe").delete(asyncHandler(deleteMessagesForCurrentUser));
router.route("/:chatId/lastMessage").get(asyncHandler(handleGetLastMessage));
router.route("/:messageId/getMessage").get(asyncHandler(handleGetMessage));
router.route("/:chatId/searchMessages").get(asyncHandler(handleSearchMessages));

export default router;
