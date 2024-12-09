import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import chatsRouter from "./chat.routes";
import userAuth from "@middlewares/auth.middleware";
import mediaRouter from "@routes/media.routes";
import messagesRouter from "@routes/message.routes";
import stickersRouter from "@routes/sticker.routes";
import encryptionRouter from "@routes/encryption.routes";
import notificationRouter from "@routes/notifications.routes";
const router: Router = Router();

router.use("/auth", authenticationRouter);
router.use(userAuth);
router.use("/user", userRouter);
router.use("/media", mediaRouter);
router.use("/chats", chatsRouter);
router.use("/messages", messagesRouter);
router.use("/stickers", stickersRouter);
router.use("/encrypt", encryptionRouter);
router.use("/notifications", notificationRouter);

export default router;
