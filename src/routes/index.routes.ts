import { Router } from "express";
import authenticationRouter from "./authentication.routes";
import userRouter from "./user.routes";
import userAuth from "@middlewares/auth.middleware";

const router: Router = Router();

router.use("/", authenticationRouter);
router.use(userAuth);
router.use("/", userRouter);

export default router;
