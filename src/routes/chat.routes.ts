import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat/get.chats";
import { handleCreateChat } from "@controllers/chat/create.chat";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats)).post(asyncHandler(handleCreateChat));

export default router;
