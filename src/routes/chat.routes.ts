import { Router } from "express";
import asyncHandler from "express-async-handler";
import { getAddableUsers, handleGetAllChats } from "@controllers/chat/get.chats";
import { handleSelfDestruct } from "@controllers/chat/edit.chat";
import { handleGetChatMembers } from "@controllers/chat/chat.participants";
import { handleMuteChat, handleUnmuteChat } from "@controllers/chat/edit.chat";
import { handleSetChatPrivacy } from "@controllers/chat/chat.privacy";
import { handleSearchAllChats, handleSearchMembers } from "@controllers/chat/search";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats));
router.route("/:chatId/getMembers").get(asyncHandler(handleGetChatMembers));
router.route("/:chatId/addableUsers").get(asyncHandler(getAddableUsers));
router.route("/:chatId/muteChat").post(asyncHandler(handleMuteChat));
router.route("/:chatId/unmuteChat").post(asyncHandler(handleUnmuteChat));
router.route("/:chatId/privacy").post(asyncHandler(handleSetChatPrivacy)); //TODO: implement when search for chats
router.route("/:chatId/searchMembers").get(asyncHandler(handleSearchMembers)); //TODO: implement when search for chats
router.route("/globalSearch").get(asyncHandler(handleSearchAllChats)); //TODO: implement when search for chats
router.route("/:chatId/selfDestruct").put(asyncHandler(handleSelfDestruct));

export default router;
