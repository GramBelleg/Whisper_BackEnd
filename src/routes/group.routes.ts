import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as groupController from "@controllers/chat/group.chat";

const router: Router = Router();

router
    .route("/:chatId/:userId/permissions")
    .get(asyncHandler(groupController.getPermissions))
    .post(asyncHandler(groupController.setPermissions));

router.route("/:chatId/size/:maxSize").put(asyncHandler(groupController.setSizeLimit));
router.route("/:chatId/settings").get(asyncHandler(groupController.getSettings));

export default router;
