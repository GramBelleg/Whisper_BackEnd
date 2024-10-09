import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import userAuth from "@middlewares/auth.middleware";
import messageRouter from "./message.routes";

const router: Router = Router();

router.use("/", authenticationRouter);
//router.use(userAuth);
router.use("/", userRouter);
router.use("/message", messageRouter);

export default router;
