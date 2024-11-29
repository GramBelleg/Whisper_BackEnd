import { Router } from "express";
import asyncHandler from "express-async-handler";
import { deleteMessagesForCurrentUser } from "@controllers/messages/delete.message";
import {
    handleGetAllMessages,
    handleGetLastMessage,
    handleGetMessage,
} from "@controllers/messages/get.messages";
import { handleGetMessageStatus } from "@controllers/messages/edit.message";
import { handleSearchMessages } from "@controllers/messages/search.messages";
import { handleDraftMessage, handleGetDraftedMessage } from "@controllers/messages/draft.message";

const router: Router = Router();

router.route("/:chatId").get(asyncHandler(handleGetAllMessages));
router.route("/:chatId/deleteForMe").delete(asyncHandler(deleteMessagesForCurrentUser));
router.route("/:chatId/lastMessage").get(asyncHandler(handleGetLastMessage));
router.route("/:messageId/getMessage").get(asyncHandler(handleGetMessage));
router.route("/:chatId/searchMessages").get(asyncHandler(handleSearchMessages));
router.route("/:messageId/getMessageStatus").get(asyncHandler(handleGetMessageStatus));
router.route("/:chatId/draftMessage").post(asyncHandler(handleDraftMessage)).get(asyncHandler(handleGetDraftedMessage));

export default router;
