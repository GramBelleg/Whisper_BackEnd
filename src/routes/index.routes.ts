import { Router } from "express";
import authenticationRouter from "@routes/authentication.routes";

const router: Router = Router();

router.use("/", authenticationRouter);

export default router;
