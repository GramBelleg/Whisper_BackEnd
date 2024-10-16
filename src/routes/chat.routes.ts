import { Router } from "express";
import asyncHandler from "express-async-handler";
import { getAllChats } from "@controllers/chat-controller/get.chats";
import { getAllMessages } from "@controllers/chat-controller/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(getAllChats));
router.route("/:chatId").get(asyncHandler(getAllMessages));

export default router;
