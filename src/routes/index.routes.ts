import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import chatsRouter from "./chat.routes";
import userAuth from "@middlewares/auth.middleware";
import mediaRouter from "@routes/media.routes";
import messagesRouter from "@routes/message.routes";
import stickersRouter from "@routes/sticker.routes";
import encryptionRouter from "@routes/encryption.routes";
import groupRouter from "@routes/group.routes";
import channelRouter from "@routes/channel.routes";
import commentRouter from "@routes/comment.routes";
import apiAuth from "@middlewares/api.middleware";
const router: Router = Router();

// router.use(apiAuth);
router.use("/auth", authenticationRouter);
router.use(userAuth);
router.use("/user", userRouter);
router.use("/media", mediaRouter);
router.use("/chats", chatsRouter);
router.use("/groups", groupRouter);
router.use("/comments", commentRouter);
router.use("/channels", channelRouter);
router.use("/messages", messagesRouter);
router.use("/stickers", stickersRouter);
router.use("/encrypt", encryptionRouter);

export default router;
