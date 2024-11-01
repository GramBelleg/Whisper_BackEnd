import { Router } from "express";
import asyncHandler from "express-async-handler";
import login from "@controllers/auth/login.controller";
import signup from "@controllers/auth/signup.controller";
import { resendConfirmCode, confirmEmail } from "@controllers/auth/confirmation.controller";
import { googleAuth, googleRedirect } from "@controllers/auth/google.auth.controller";
import { githubAuth } from "@controllers/auth/github.auth.controller";
import { facebookAuth } from "@controllers/auth/facebook.auth.controller";
import { resetPassword, sendResetCode } from "@controllers/auth/reset.password.controller";

const router: Router = Router();

router.post("/login", asyncHandler(login));
router.post("/signup", asyncHandler(signup));
router.post("/resendConfirmCode", asyncHandler(resendConfirmCode));
router.post("/confirmEmail", asyncHandler(confirmEmail));
router.post("/sendResetCode", asyncHandler(sendResetCode));
router.post("/resetPassword", asyncHandler(resetPassword));
router.post("/google", asyncHandler(googleAuth));
router.get("/google/redirect", asyncHandler(googleRedirect));
router.post("/facebook", asyncHandler(facebookAuth));
router.post("/github", asyncHandler(githubAuth));

export default router;
