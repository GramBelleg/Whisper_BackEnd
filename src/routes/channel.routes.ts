import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as channelController from "@controllers/chat/channel";

const router: Router = Router();

router
    .route("/:chatId/:userId/permissions")
    .get(asyncHandler(channelController.getPermissions))
    .post(asyncHandler(channelController.setPermissions));

router.route("/invite").get(asyncHandler(channelController.invite));
export default router;
