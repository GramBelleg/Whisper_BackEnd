import { Router } from "express";
import { getAllChats } from "@controllers/chat-controller/get.chats";
import { getAllMessages } from "@controllers/chat-controller/get.messages";

const router: Router = Router();

router.route("/").get(getAllChats);
router.route("/:chatId").get(getAllMessages);

export default router;
