import { Router } from "express";
import sendMessage from "@controllers/message-controller/send-message";

const router: Router = Router();

router.route("/send").post(sendMessage);

export default router;
