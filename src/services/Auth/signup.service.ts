import DuplicateUserError from "@src/errors/DuplicateUserError";
import { findEmail, findPhoneNumber, findUserName } from "@services/prisma/find.service";
import { DuplicateUserInfo } from "@models/user.models";
import { fetchRobotTokenData } from "@services/auth/fetch.apis.service";



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
    if (await findEmail(email)) duplicate.email = "Email already exists ";
    if (await findUserName(userName)) duplicate.userName = "Username already exists";
    if (await findPhoneNumber(phoneNumber)) duplicate.phoneNumber = "Phone number already exists";

    if (Object.keys(duplicate).length != 0)
        throw new DuplicateUserError("User already exists", 409, duplicate);
};

export { verifyRobotToken, isUniqueUser };
