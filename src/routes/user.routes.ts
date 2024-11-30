import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as userController from "@controllers/user/user.controller";
import * as storyController from "@controllers/story/story.controller";
import { getBlockedUsers, handleUserBlocks } from "@controllers/user/block.controller";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";
import { userInfo } from "@services/user/user.service";

const router: Router = Router();

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const user = await userInfo(req.userId);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({
            id: req.userId,
            ...userWithoutPassword,
        });
    })
);

// Wrapping each controller function in asyncHandler
router.put("/name", asyncHandler(userController.updateName));
router.put("/bio", asyncHandler(userController.updateBio));
router.get("/info", asyncHandler(userController.userInfo));
router.put("/email", asyncHandler(userController.updateEmail));
router.post("/emailcode", asyncHandler(userController.emailCode));
router.put("/phoneNumber", asyncHandler(userController.updatePhone));
router.put("/phoneNumber", asyncHandler(userController.updatePhone));
router.put("/profilepic", asyncHandler(userController.changePic)); // Use media route "/write" first to upload image
router.put("/userName", asyncHandler(userController.changeUserName));
router.post("/readReceipts", asyncHandler(userController.changeReadReceipt));
router.get("/blocked", asyncHandler(getBlockedUsers));
router.put("/block", asyncHandler(handleUserBlocks));
router.put("/setAutoDownloadSize", asyncHandler(userController.changeAutoDownloadSize));
router.put("/lastSeen/privacy", asyncHandler(userController.changeLastSeenPrivacy));
router.put("/pfp/privacy", asyncHandler(userController.changePfpPrivacy));
router.put("/story/:storyId/privacy", asyncHandler(storyController.changeStoryPrivacy));
router.put("/story/privacy", asyncHandler(userController.changeStoryPrivacy));
router.post("/contact", asyncHandler(userController.addContact));
router.get("/logoutOne", asyncHandler(logoutOne));
router.get("/logoutAll", asyncHandler(logoutAll));
router.get("/sotryArchive", asyncHandler(userController.getStoryArchive));
router.get("/story", asyncHandler(userController.getStoryUsers));
router.get("/story/:userId", asyncHandler(userController.getUserStories));
router.get("/story/getViews/:storyId", asyncHandler(userController.getStoryViews));
router.get("/sotryArchive", asyncHandler(userController.getStoryArchive));
router.get("/story", asyncHandler(userController.getStoryUsers));
router.get("/story/:userId", asyncHandler(userController.getUserStories));
router.get("/story/getViews/:storyId", asyncHandler(userController.getStoryViews));

export default router;
