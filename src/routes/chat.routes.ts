import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat/get.chats";
import { handleCreateChat } from "@controllers/chat/create.chat";
import { handleGetChatMembers } from "@controllers/chat/chat.participants";
import { handleMuteChat, handleUnmuteChat } from "@controllers/chat/edit.chat";
import { handleSetChatPrivacy } from "@controllers/chat/chat.privacy";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats));
router.route("/:chatId/getMembers").get(asyncHandler(handleGetChatMembers));
router.route("/:chatId/muteChat").post(asyncHandler(handleMuteChat));
router.route("/:chatId/unmuteChat").post(asyncHandler(handleUnmuteChat));
router.route("/:chatId/privacy").post(asyncHandler(handleSetChatPrivacy)); //TODO: implement when search for chats

export default router;
