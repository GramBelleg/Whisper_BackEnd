import { Request, Response } from "express";
import * as authValidator from "@validators/auth";
import { isUniqueUser, verifyRobotToken } from "@services/auth/signup.service";
import { createCode, sendCode } from "@services/auth/code.service";
import RedisOperation from "@src/@types/redis.operation";
import bcrypt from "bcrypt";
import { cacheData, setExpiration } from "@services/auth/redis.service";

const signup = async (req: Request, res: Response): Promise<void> => {
    const user = req.body;
    user.email = user.email?.trim().toLowerCase();
    user.userName = user.userName?.trim().toLowerCase();
    user.phoneNumber = user.phoneNumber?.trim();
    authValidator.validateName(user.name);
    authValidator.validateUserName(user.userName);
    authValidator.validateEmail(user.email);
    user.phoneNumber = authValidator.validatePhoneNumber(user);
    authValidator.validatePassword(user.password);
    authValidator.validateConfirmPassword(user.password, user.confirmPassword);
    authValidator.validateRobotToken(user.robotToken);

    user.password = bcrypt.hashSync(user.password, 10);

    await isUniqueUser(user.email, user.userName, user.phoneNumber);

    // await verifyRobotToken(user.robotToken);

    //cache code with user email
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
