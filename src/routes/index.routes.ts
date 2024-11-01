import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import chatsRouter from "./chat.routes";
import userAuth from "@middlewares/auth.middleware";
import mediaRouter from "@routes/media.routes";
import messagesRouter from "@routes/message.routes";
const router: Router = Router();

router.use("/auth", authenticationRouter);
router.use(userAuth);
router.use("/user", userRouter);
router.use("/media", mediaRouter);
router.use("/chats", chatsRouter);
router.use("/messages", messagesRouter);

export default router;
