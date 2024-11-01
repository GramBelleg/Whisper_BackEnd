import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import { verifyRobotToken, isUniqueUser } from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/confirmation.service";
import RedisOperation from "@src/@types/redis.operation";
import { UserInfo } from "@models/user.models";



const signup = async (req: Request, res: Response): Promise<void> => {
    const user: UserInfo = req.body;
    user.email = user.email?.trim().toLowerCase();
    user.userName = user.userName?.trim().toLowerCase();
    user.phoneNumber = user.phoneNumber?.trim();

    validateSingUp(user);

    await isUniqueUser(user.email, user.userName, user.phoneNumber);

    await verifyRobotToken(req.body.robotToken);

    const expiresIn = parseInt(process.env.EXPIRES_IN as string);
    const code = await createCode(user, RedisOperation.ConfirmEmail, expiresIn);

    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(user.email, emailSubject, emailBody);

    res.status(200).json({
        status: "success",
    });
};

export default signup;
