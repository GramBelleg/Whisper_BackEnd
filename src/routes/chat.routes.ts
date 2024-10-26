import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat/get.chats";
import { handleCreateChat } from "@controllers/chat/create.chat";
import { deleteMessagesForCurrentUser } from "@controllers/chat/delete.message";
import { handleGetAllMessages, handleGetLastMessage } from "@controllers/chat/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats)).post(asyncHandler(handleCreateChat));
router.route("/:chatId").get(asyncHandler(handleGetAllMessages));
router.route("/:chatId/deleteForMe").delete(asyncHandler(deleteMessagesForCurrentUser));
router.route("/:chatId/getLastMessage").get(asyncHandler(handleGetLastMessage));

export default router;
