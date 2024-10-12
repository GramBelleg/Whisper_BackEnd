import Randomstring from "randomstring";
import { Request, Response } from "express";
import sendEmail from "@services/AuthenRegist/send.email.service";
import { validateEmail, validateCode } from "@validators/verification";
import {
    findUser,
    findVerifiedUser,
    updateUser,
    updateVerifiedUser,
} from "@services/AuthenRegist/verification.service";

const generateCode = async (req: Request, res: Response): Promise<void> => {
    try {
        //validate email from req body
        const { email } = req.body as Record<string, string>;
        validateEmail(email);

        //find user in db
        await findUser(email);

        //send verification email
        const code: string = Randomstring.generate(8); // verification code length is exact 8
        const info: string | undefined = await sendEmail(code, email);
        if (!info) {
            throw new Error("Error in sending email");
        }

        //update user with verification code
        await updateUser(email, code);

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

const verifyCode = async (req: Request, res: Response): Promise<void> => {
    try {
        //validate email and code from req body
        const { email, code } = req.body as Record<string, string>;
        validateCode(email, code);

        //find user and verification code in db
        await findVerifiedUser(email, code);

        //update user email as activated
        await updateVerifiedUser(email);

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

export { generateCode, verifyCode };
