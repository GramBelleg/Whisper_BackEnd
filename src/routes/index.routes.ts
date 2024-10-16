import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import chatsRouter from "./chat.routes";
import userAuth from "@middlewares/auth.middleware";

const router: Router = Router();

router.use("/", authenticationRouter);
router.use(userAuth);
router.use("/", userRouter);
router.use("/chats", chatsRouter);

export default router;
