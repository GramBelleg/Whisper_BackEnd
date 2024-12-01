import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
    handleAssociateParticipantKey,
    handleCreateKey,
    handleGetKey,
    handleGetOtherUserKey,
} from "@controllers/chat/encryption_key";

const router: Router = Router();

router.route("/").post(asyncHandler(handleCreateKey)).get(asyncHandler(handleGetKey));
router
    .route("/:chatId")
    .get(asyncHandler(handleGetOtherUserKey))
    .put(asyncHandler(handleAssociateParticipantKey));

export default router;
