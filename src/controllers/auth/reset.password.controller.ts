import { Request, Response } from "express";
import { User } from "@prisma/client";
import { validateEmail, validateResetCode } from "@validators/confirm.reset";
import { updatePassword } from "@services/prisma/auth/update.service";
import { checkEmailExistDB } from "@services/auth/login.service";
import { createCode, sendCode, verifyCode } from "@services/auth/confirmation.service";
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
    validateResetCode(req.body);

    await checkEmailExistDB(email);

    await verifyCode(email, code, RedisOperation.ResetPassword);

    const user: User = await updatePassword(email, password);

    const userToken = await createAddToken(user.id);
    createTokenCookie(res, userToken);

    res.status(200).json({
        status: "success",
        user: {
            id: user.id,
            name: user.name,
            userName: user.userName,
            email: user.email,
        },
        userToken,
    });
}

export { sendResetCode, resetPassword };
