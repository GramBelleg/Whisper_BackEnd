import { Request, Response } from "express";
import { User } from "@prisma/client";
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateCode,
} from "@validators/auth";
import { updatePassword } from "@services/auth/prisma/update.service";
import { checkEmailExistDB } from "@services/auth/login.service";
import { createCode, sendCode, verifyCode } from "@services/auth/code.service";
import { createAddToken, createTokenCookie } from "@services/auth/token.service";
import RedisOperation from "@src/@types/redis.operation";

async function sendResetCode(req: Request, res: Response) {
    req.body.email = req.body.email?.trim().toLowerCase();
    const { email } = req.body as Record<string, string>;
    validateEmail(email);

    await checkEmailExistDB(email);

    const codeExpiry = parseInt(process.env.CODE_EXPIRES_IN as string);
    const code = await createCode(email, RedisOperation.ResetPassword, codeExpiry);

    const emailSubject = "Password reset";
    const emailBody = `<h3>Hello, </h3> <p>Use this code: <b>${code}</b> for reset your password</p>`;
    await sendCode(email, emailSubject, emailBody);

    res.status(200).json({
        status: "success",
    });
}

async function resetPassword(req: Request, res: Response) {
    req.body.email = req.body.email?.trim().toLowerCase();
    req.body.code = req.body.code?.trim();
    const { email, password, code } = req.body as Record<string, any>;
    validateEmail(email);
    validatePassword(password);
    validateConfirmPassword(password, req.body.confirmPassword);
    validateCode(code);

    await checkEmailExistDB(email);

    await verifyCode(email, code, RedisOperation.ResetPassword);

    const user: User = await updatePassword(email, password);
    const { password: userPassword, ...userWithoutPassword } = user;

    const userToken = await createAddToken(user.id, user.role);
    createTokenCookie(res, userToken);

    res.status(200).json({
        status: "success",
        user: userWithoutPassword,
        userToken,
    });
}

export { sendResetCode, resetPassword };
