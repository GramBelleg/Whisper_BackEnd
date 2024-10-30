import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import { isUniqueUser, cacheUser, verifyRobotToken } from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/confirmation.service";
import RedisOperation from "@src/@types/redis.operation";

const signup = async (req: Request, res: Response): Promise<void> => {
    let { name, userName, email, password }: Record<string, string> = req.body;
    email = email?.trim().toLowerCase();
    userName = userName?.trim().toLowerCase();

    const phoneNumber = validateSingUp(req.body);

    //first need to check that user isn't in redis either
    await isUniqueUser(email, userName, phoneNumber);

    // await verifyRobotToken(req.body.robotToken);

    const code = await createCode(email, RedisOperation.ConfirmEmail);
    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(email, emailSubject, emailBody);

    await cacheUser(name, userName, email, phoneNumber, password);

    res.status(200).json({
        status: "success",
        userData: {
            name,
            email,
        },
    });
};

export default signup;
