import { Request, Response } from "express";
import { validateEmail, validateConfirmCode } from "@validators/confirm.reset";

import RedisOperation from "@src/@types/redis.operation";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
import {
    addUser,
    createCode,
    getCachedData,
    sendCode,
    verifyCode,
} from "@services/auth/confirmation.service";
import { UserInfo } from "@models/user.models";
import HttpError from "@src/errors/HttpError";

const resendConfirmCode = async (req: Request, res: Response): Promise<void> => {
    let email = req.body.email;
    email = email?.trim().toLowerCase();
    validateEmail(email);

    const expiresIn = parseInt(process.env.CODE_EXPIRES_IN as string);
    const code = await createCode(email, RedisOperation.ConfirmEmail, expiresIn);

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

    await verifyCode(email, code, RedisOperation.ConfirmEmail);

    const foundUser = (await getCachedData(RedisOperation.AddNewUser, email)) as UserInfo;
    if (Object.keys(foundUser).length === 0)
        throw new HttpError("Email verification took too long, Please Sign up again");

    const user = await addUser(foundUser);

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
