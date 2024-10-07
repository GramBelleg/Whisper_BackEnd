import { Router } from "express";
import googleAuth from "./google.auth.routes";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import userAuth from "@middlewares/auth.middleware";
import messageRouter from "./message.routes";

const router: Router = Router();

router.use("/", googleAuth);
router.use("/", authenticationRouter);
//router.use(userAuth);
router.use("/", userRouter);
router.use("/message", messageRouter);

export default router;
