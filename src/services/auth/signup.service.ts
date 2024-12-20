import DuplicateUserError from "@src/errors/DuplicateUserError";
import {
    findUserByEmail,
    findUserByPhoneNumber,
    findUserByUserName,
} from "@services/auth/prisma/find.service";
import { DuplicateUserInfo } from "@models/user.models";
import axios from "axios";

async function fetchRobotTokenData(robotToken: string) {
    let reCAPTCHA_SECRET;
    if (process.env.NODE_ENV != "production") reCAPTCHA_SECRET = process.env.test_reCAPTCHA_SECRET;
    else reCAPTCHA_SECRET = process.env.reCAPTCHA_SECRET;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHA_SECRET}&response=${robotToken}`;
    const response = await axios.post(verificationURL);
    return response.data;
}

async function verifyRobotToken(robotToken: string) {
    try {
        const responseData = await fetchRobotTokenData(robotToken);
        if (!responseData || !responseData.success) {
            throw new Error();
        }
    } catch (err) {
        throw new Error("Invalid robot token");
    }
}

const isUniqueUser = async (email: string, userName: string, phoneNumber: string) => {
    const duplicate: DuplicateUserInfo = {};
    if (await findUserByEmail(email)) duplicate.email = "Email already exists ";
    if (await findUserByUserName(userName)) duplicate.userName = "Username already exists";
    if (await findUserByPhoneNumber(phoneNumber))
        duplicate.phoneNumber = "Phone number already exists";

    if (Object.keys(duplicate).length != 0)
        throw new DuplicateUserError("User already exists", 409, duplicate);
};

export { verifyRobotToken, isUniqueUser, fetchRobotTokenData };
