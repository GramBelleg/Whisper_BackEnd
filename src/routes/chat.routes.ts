import { Router } from "express";
import asyncHandler from "express-async-handler";
import { getAllChats } from "@controllers/Chat/get.chats";
import { getAllMessages } from "@controllers/Chat/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(getAllChats));
router.route("/:chatId").get(asyncHandler(getAllMessages));

export default router;
