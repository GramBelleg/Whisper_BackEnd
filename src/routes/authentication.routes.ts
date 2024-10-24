import { Router } from "express";
import login from "@controllers/auth/login.controller";
import signup from "@controllers/auth/signup.controller";
import { resendConfirmCode, confirmEmail } from "@controllers/auth/confirmation.controller";
import googleAuth from "@controllers/auth/google.auth.controller";
import { githubAuth } from "@controllers/auth/github.auth.controller";
import { facebookAuth } from "@controllers/auth/facebook.auth.controller";
import { resetPassword, sendResetCode } from "@controllers/auth/reset.password.controller";

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
