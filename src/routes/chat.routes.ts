import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat/get.chats";
import { handleCreateChat } from "@controllers/chat/create.chat";
import { handleGetChatMembers } from "@controllers/chat/chat.participants";
import { handleMuteChat } from "@controllers/chat/edit.chat";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats)).post(asyncHandler(handleCreateChat));
router.route("/:chatId/getMembers").get(asyncHandler(handleGetChatMembers));
router.route("/:chatId/muteChat").post(asyncHandler(handleMuteChat));

export default router;
