import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as userController from "@controllers/user/user.controller";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";

const router: Router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ status: "success" });
});

// Wrapping each controller function in asyncHandler
router.put("/name", asyncHandler(userController.updateName));
router.put("/bio", asyncHandler(userController.updateBio));
router.get("/info", asyncHandler(userController.userInfo));
router.put("/email", asyncHandler(userController.updateEmail));
router.post("/emailcode", asyncHandler(userController.emailCode));
router.put("/phone", asyncHandler(userController.updatePhone));
router.put("/profilepic", asyncHandler(userController.changePic)); // Use media route "/write" first to upload image
router.put("/username", asyncHandler(userController.changeUserName));
router.get("/logoutOne", asyncHandler(logoutOne));
router.get("/logoutAll", asyncHandler(logoutAll));

export default router;
