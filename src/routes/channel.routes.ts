import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as channelController from "@controllers/chat/channel";
import { invite } from "@controllers/chat/invite.controller";

const router: Router = Router();

router
    .route("/:chatId/:userId/permissions")
    .get(asyncHandler(channelController.getPermissions))
    .post(asyncHandler(channelController.setPermissions));

router.route("/invite").get(asyncHandler(invite));
router.route("/:chatId/settings").get(asyncHandler(channelController.getSettings));
export default router;
