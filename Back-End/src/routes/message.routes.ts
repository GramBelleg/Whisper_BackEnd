import { Router } from "express";
import sendMessage from "@controllers/message-controller/send.message";
import editMessage from "@controllers/message-controller/edit.message";
import deleteMessage from "@controllers/message-controller/delete.message";


const router: Router = Router();

router.route("/send").post(sendMessage);
router.route("/edit").patch(editMessage);
router.route("/delete").delete(deleteMessage);


export default router;
