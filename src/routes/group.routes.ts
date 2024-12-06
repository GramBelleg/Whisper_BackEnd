import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as groupController from "@controllers/chat/group.chat";

const router: Router = Router();

router
    .route("/:chatId/:userId/permissions")
    .get(asyncHandler(groupController.getPermissions))
    .post(asyncHandler(groupController.setPermissions));

export default router;
