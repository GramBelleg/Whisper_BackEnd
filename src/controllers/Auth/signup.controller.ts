import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import {
    findEmail,
    findPhoneNumber,
    findUserName,
    verifyRobotToken,
} from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/confirmation.service";
import RedisOperation from "@src/@types/redis.operation";
import { DuplicateUserInfo, UserInfo } from "@models/user.models";
import DuplicateUserError from "@src/errors/DuplicateUserError";

const isUniqueUser = async (email: string, userName: string, phoneNumber: string) => {
    const duplicate: DuplicateUserInfo = {};
    if (await findEmail(email)) duplicate.email = "Email already exists ";
    if (await findUserName(userName)) duplicate.userName = "Username already exists";
    if (await findPhoneNumber(phoneNumber)) duplicate.phoneNumber = "Phone number already exists";

    throw new DuplicateUserError("User already exists", 409, duplicate);
};

const signup = async (req: Request, res: Response): Promise<void> => {
    const user: UserInfo = req.body;
    user.email = user.email?.trim().toLowerCase();
    user.userName = user.userName?.trim().toLowerCase();

    validateSingUp(user);

    await isUniqueUser(user.email, user.userName, user.phoneNumber);

    // await verifyRobotToken(req.body.robotToken);

    const code = await createCode(user, RedisOperation.ConfirmEmail);
    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(user.email, emailSubject, emailBody);

    res.status(200).json({
        status: "success",
        user,
    });
};

export default signup;
