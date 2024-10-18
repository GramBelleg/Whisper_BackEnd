import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import { checkEmailNotExist, saveUserData, verifyRobotToken } from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/confirmation.service";
import RedisOperation from "src/@types/redis.operation";

const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, userName, email, password }: Record<string, string> = req.body;
        const phoneNumber = validateSingUp(req.body);
        // in DB
        await checkEmailNotExist(email);

        await verifyRobotToken(req.body.robotToken);

        const code = await createCode(email, RedisOperation.ConfirmEmail);
        const emailSubject = "Email confirmation";
        const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
        await sendCode(email, emailSubject, emailBody);

        await saveUserData(name, userName, email, phoneNumber, password);

        res.status(200).json({
            status: "success",
            userData: {
                name,
                email,
            },
        });
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export default signup;
