import { validateEmail, validateResetCode } from "@validators/confirm.reset";
import { Request, Response } from "express";
import { updatePassword } from "@services/auth/reset.password.service";
import RedisOperation from "@src/@types/redis.operation";
import { User } from "@prisma/client";
import { checkEmailExistDB } from "@services/auth/login.service";
import { sendCode, verifyCode } from "@services/auth/confirmation.service";
import { createAddToken, createTokenCookie } from "@services/auth/token.service";
import { createCode } from "@services/user/user.service";

async function sendResetCode(req: Request, res: Response) {
    try {
        req.body.email = req.body.email?.trim().toLowerCase();
        const { email } = req.body as Record<string, string>;
        validateEmail(email);

        await checkEmailExistDB(email);

        const code = await createCode(email, RedisOperation.ResetPassword);
        const emailSubject = "Password reset";
        const emailBody = `<h3>Hello, </h3> <p>Use this code: <b>${code}</b> for reset your password</p>`;
        await sendCode(email, emailSubject, emailBody);

        res.status(200).json({
            status: "success",
        });
    } catch (err: any) {
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

async function resetPassword(req: Request, res: Response) {
    try {
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
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
}

export { sendResetCode, resetPassword };
