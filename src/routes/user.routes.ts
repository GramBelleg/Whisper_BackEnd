import { Router, Request, Response } from "express";
import * as userController from "@controllers/profile/user.controller";
import { logoutAll, logoutOne } from "@controllers/auth/logout.controller";
const router: Router = Router();


router.get("/", (req, res) => {
    res.status(200).json({ status: 'success' });
});

//router.put("/user", userController.updateUser);
router.put("/name", userController.updateName);
router.put("/bio", userController.updateBio);
router.get("", userController.UserInfo);
router.put("/email", userController.updateEmail);
router.post("/emailcode", userController.emailCode);
router.put("/phone", userController.updatePhone);
router.post("/story", userController.setStory);
router.delete("/story", userController.deleteStory);
router.get("/logoutOne", logoutOne);
router.get("/logoutAll", logoutAll);
export default router;
