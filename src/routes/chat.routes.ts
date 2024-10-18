import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/Chat/get.chats";
import { handleGetAllMessages } from "@controllers/Chat/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats));
router.route("/:chatId").get(asyncHandler(handleGetAllMessages));

export default router;
