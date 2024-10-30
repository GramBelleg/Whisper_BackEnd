import { Router } from "express";
import login from "@controllers/auth1/login.controller";
import signup from "@controllers/auth1/signup.controller";
import { resendConfirmCode, confirmEmail } from "@controllers/auth1/confirmation.controller";
import googleAuth from "@controllers/auth1/google.auth.controller";
import { githubAuth } from "@controllers/auth1/github.auth.controller";
import { facebookAuth } from "@controllers/auth1/facebook.auth.controller";
import { resetPassword, sendResetCode } from "@controllers/auth1/reset.password.controller";

const router: Router = Router();

router.post("/login", login);

router.post("/signup", signup);
router.post("/resendConfirmCode", resendConfirmCode);
router.post("/confirmEmail", confirmEmail);

router.post("/sendResetCode", sendResetCode);
router.post("/resetPassword", resetPassword);

router.post("/google", googleAuth);
router.post("/facebook", facebookAuth);
router.post("/github", githubAuth);

export default router;
