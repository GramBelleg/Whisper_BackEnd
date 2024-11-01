import { Request, Response } from "express";
import { validateSingUp } from "@validators/user";
import {
    findEmail,
    findPhoneNumber,
    findUserName,
    verifyRobotToken,
} from "@services/auth/signup.service";
import {
    cacheData,
    createCode,
    sendCode,
    setExpiration,
} from "@services/auth/confirmation.service";
import RedisOperation from "@src/@types/redis.operation";
import { DuplicateUserInfo, UserInfo } from "@models/user.models";
import DuplicateUserError from "@src/errors/DuplicateUserError";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const isUniqueUser = async (email: string, userName: string, phoneNumber: string) => {
    const duplicate: DuplicateUserInfo = {};
    if (await findEmail(email)) duplicate.email = "Email already exists ";
    if (await findUserName(userName)) duplicate.userName = "Username already exists";
    if (await findPhoneNumber(phoneNumber)) duplicate.phoneNumber = "Phone number already exists";
    if (Object.keys(duplicate).length != 0)
        throw new DuplicateUserError("User already exists", 409, duplicate);
};

const signup = async (req: Request, res: Response): Promise<void> => {
    const user = req.body;
    user.email = user.email?.trim().toLowerCase();
    user.userName = user.userName?.trim().toLowerCase();
    validateSingUp(user);

    user.password = bcrypt.hashSync(user.password, 10);

    await isUniqueUser(user.email, user.userName, user.phoneNumber);

    // await verifyRobotToken(user.robotToken);

    const codeExpiry = parseInt(process.env.CODE_EXPIRES_IN as string);
    const code = await createCode(user.email, RedisOperation.ConfirmEmail, codeExpiry);

    const emailSubject = "Email confirmation";
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(user.email, emailSubject, emailBody);

    const userExpiry = parseInt(process.env.USER_EXPIRES_IN as string);
    const { confirmPassword, robotToken, ...cachedUser } = user;

    await cacheData(RedisOperation.AddNewUser, user.email, cachedUser);
    await setExpiration(RedisOperation.AddNewUser, user.email, userExpiry);

    res.status(200).json({
        status: "success",
        userData: {
            email: user.email,
            name: user.name,
        },
    });
};

export default signup;
