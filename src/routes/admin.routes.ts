import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
    handleGetAllUsers,
    handleGetAllGroups,
    handleBanUser,
    handleFilterGroup,
} from "@controllers/admin/admin.controller";

const router: Router = Router();

router.route("/users").get(asyncHandler(handleGetAllUsers));
router.route("/groups").get(asyncHandler(handleGetAllGroups));
router.route("/ban/:ban/user/:userId").put(asyncHandler(handleBanUser));
router.route("/filter/:filter/group/:groupId").put(asyncHandler(handleFilterGroup));

export default router;
