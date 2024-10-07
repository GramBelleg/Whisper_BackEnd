import { Router } from "express";
import googleAuth from "./google-auth-routes";
import authenticationRouter from "./authentication-routes";
import userRouter from "./user-routes";
import userAuth from "@middlewares/auth-middleware";

const router: Router = Router();

router.use("/", googleAuth);
router.use("/", authenticationRouter);
router.use(userAuth);
router.use("/", userRouter);

export default router;
