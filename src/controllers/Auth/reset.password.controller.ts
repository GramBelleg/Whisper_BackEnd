import { validateEmail, validateResetCode } from "@validators/confirm.reset";
import { Request, Response } from "express";
import { updatePassword } from "@services/auth/reset.password.service";
import { verifyCode, createCode, sendCode } from "@services/auth/confirmation.service";
import { checkEmailExist } from "@services/auth/login.service";
import RedisOperation from "src/@types/redis.operation";

async function sendResetCode(req: Request, res: Response) {
    try {
        const { email } = req.body as Record<string, string>;
        validateEmail(email);

        //in DB
        await checkEmailExist(email);

        const code = await createCode(email, RedisOperation.ResetPassword);
        const emailSubject = "Password reset"
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
        const { email, password, code } = req.body as Record<string, string>;
        validateResetCode(req.body);

        //in DB
        await checkEmailExist(email);

        await verifyCode(email, code, RedisOperation.ResetPassword);

        updatePassword(email, password);

        res.status(200).json({
            status: "success",
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
