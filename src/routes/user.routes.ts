import { Router, Request, Response } from "express";
import * as userController from "@controllers/user1/user.controller";
import { logoutAll, logoutOne } from "@controllers/auth1/logout.controller";
const router: Router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ status: "success" });
});

//router.put("/user", userController.updateUser);
router.put("/name", userController.updateName);
router.put("/bio", userController.updateBio);
router.get("/info", userController.UserInfo);
router.put("/email", userController.updateEmail);
router.post("/emailcode", userController.emailCode);
router.put("/phone", userController.updatePhone);
router.put("/profilepic", userController.changePic); //Use media route "/write" first to upload image
router.put("/username", userController.changeUserName);
router.get("/logoutOne", logoutOne);
router.get("/logoutAll", logoutAll);
export default router;
