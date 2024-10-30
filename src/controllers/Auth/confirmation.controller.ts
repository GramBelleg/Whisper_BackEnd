import { Request, Response } from "express";
import { validateEmail, validateConfirmCode } from "@validators/confirm.reset";

import RedisOperation from "@src/@types/redis.operation";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { isUniqueUser } from "@services/auth/signup.service";
import {
    addUser,
    createCode,
    getCachedUser,
    sendCode,
    verifyCode,
} from "@services/auth/confirmation.service";
import phone from "phone";

const resendConfirmCode = async (req: Request, res: Response): Promise<void> => {
    let { email } = req.body as Record<string, string>;
    email = email?.trim().toLowerCase();
    validateEmail(email);

    const cachedUser = await getCachedUser(email);
    await isUniqueUser(email, cachedUser.userName, cachedUser.phoneNumber);

    const code = await createCode(email, RedisOperation.ConfirmEmail);
    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(email, emailSubject, emailBody);

    res.status(200).json({
        status: "success",
    });
};

const confirmEmail = async (req: Request, res: Response): Promise<void> => {
    let { email, code } = req.body as Record<string, string>;
    email = email?.trim().toLowerCase();
    code = code?.trim();

    validateConfirmCode(email, code);

    const cachedUser = await getCachedUser(email);
    await isUniqueUser(email, cachedUser.userName, cachedUser.phoneNumber);

    await verifyCode(email, code, RedisOperation.ConfirmEmail);

    const user = await addUser(email);

    const userToken: string = await createAddToken(user.id);
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
};

export { resendConfirmCode, confirmEmail };
