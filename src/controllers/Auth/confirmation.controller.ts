import { Request, Response } from "express";
import { validateEmail, validateConfirmCode } from "@validators/confirm.reset";
import {
    checkEmailExist,
    verifyCode,
    confirmAddUser,
    createCode,
    sendCode,
} from "@services/Auth/confirmation.service";
import { checkEmailNotExist } from "@services/Auth/signup.service";
import RedisOperation from "@src/@types/redis.operation";

const resendConfirmCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body as Record<string, string>;
        validateEmail(email);

        //in DB
        await checkEmailNotExist(email);

        //in redis
        await checkEmailExist(email);

        const code = await createCode(email, RedisOperation.ConfirmEmail);
        const emailSubject = "Email confirmation";
        const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
        await sendCode(email, emailSubject, emailBody);

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
};

const confirmEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, code } = req.body as Record<string, string>;
        validateConfirmCode(email, code);

        //in DB
        await checkEmailNotExist(email);

        await verifyCode(email, code, RedisOperation.ConfirmEmail);

        await confirmAddUser(email);

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
};

export { resendConfirmCode, confirmEmail };
