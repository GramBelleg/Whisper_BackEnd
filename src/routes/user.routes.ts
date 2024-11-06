import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as userController from "@controllers/user/user.controller";
import * as storyController from "@controllers/story/story.controller";
import { getBlockedUsers, handleUserBlocks } from "@controllers/user/block.controller";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";

const router: Router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ userId: req.userId });
});

// Wrapping each controller function in asyncHandler
router.put("/name", asyncHandler(userController.updateName));
router.put("/bio", asyncHandler(userController.updateBio));
router.get("/info", asyncHandler(userController.userInfo));
router.put("/email", asyncHandler(userController.updateEmail));
router.post("/emailcode", asyncHandler(userController.emailCode));
router.put("/phoneNumber", asyncHandler(userController.updatePhone));
router.put("/profilepic", asyncHandler(userController.changePic)); // Use media route "/write" first to upload image
router.put("/username", asyncHandler(userController.changeUserName));
router.post("/readReceipts", asyncHandler(userController.changeReadReceipt));
router.get("/blocked", asyncHandler(getBlockedUsers));
router.put("/block", asyncHandler(handleUserBlocks));
router.put("/setAutoDownloadSize", asyncHandler(userController.changeAutoDownloadSize));
router.put("/lastSeen/privacy", asyncHandler(userController.changeLastSeenPrivacy));
router.put("/pfp/privacy", asyncHandler(userController.changePfpPrivacy));
router.post("/contact", asyncHandler(userController.addContact));
router.get("/logoutOne", asyncHandler(logoutOne));
router.get("/logoutAll", asyncHandler(logoutAll));
router.get("/sotryArchive", asyncHandler(userController.getStoryArchive));
router.get("/story", asyncHandler(userController.getStoryUsers));
router.get("/story/:userId", asyncHandler(userController.getStoryUsers));

export default router;
