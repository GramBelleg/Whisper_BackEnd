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
        res.status(200).json({
            id: req.userId,
            userName: user.userName,
            name: user.name,
            profilePic: user.profilePic,
            email: user.email,
            readReceipts: user.readReceipts,
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
router.get("/story/:userId", asyncHandler(userController.getUserStories));
router.get("/story/getViews/:storyId", asyncHandler(userController.getStoryViews));

export default router;
