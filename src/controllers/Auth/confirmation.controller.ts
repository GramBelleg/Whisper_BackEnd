import { Request, Response } from "express";
import { validateEmail, validateConfirmCode } from "@validators/confirm.reset";

import RedisOperation from "@src/@types/redis.operation";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import { addUser, createCode, sendCode, verifyCode } from "@services/auth/confirmation.service";
import { UserInfo } from "@models/user.models";

const resendConfirmCode = async (req: Request, res: Response): Promise<void> => {
    const user = req.body;
    user.email = user.email?.trim().toLowerCase();
    validateEmail(user.email);

    const expiresIn = parseInt(process.env.EXPIRES_IN as string);
    const code = await createCode(user, RedisOperation.ConfirmEmail, expiresIn);

    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(user.email, emailSubject, emailBody);

    res.status(200).json({
        status: "success",
    });
};

const confirmEmail = async (req: Request, res: Response): Promise<void> => {
    let { email, code } = req.body as Record<string, string>;
    email = email?.trim().toLowerCase();
    code = code?.trim();

    validateConfirmCode(email, code);

    const cachedUser: UserInfo = await verifyCode(email, code, RedisOperation.ConfirmEmail);

    const user = await addUser(cachedUser);

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
