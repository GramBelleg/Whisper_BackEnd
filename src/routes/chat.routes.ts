import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat1/get.chats";
import { handleCreateChat } from "@controllers/chat1/create.chat";
import { deleteMessagesForCurrentUser } from "@controllers/chat1/delete.message";
import { handleGetAllMessages, handleGetLastMessage } from "@controllers/chat1/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats)).post(asyncHandler(handleCreateChat));
router.route("/:chatId").get(asyncHandler(handleGetAllMessages));
router.route("/:chatId/deleteForMe").delete(asyncHandler(deleteMessagesForCurrentUser));
router.route("/:chatId/getLastMessage").get(asyncHandler(handleGetLastMessage));

export default router;
