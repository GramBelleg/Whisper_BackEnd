import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleUpdateFCMToken } from '@controllers/notifications/registerFCMToken.controller';

const router: Router = Router();

router.route("/registerFCMToken").post(asyncHandler(handleUpdateFCMToken));

export default router;