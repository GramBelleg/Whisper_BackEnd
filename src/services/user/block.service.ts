import { findUsersByIds } from "@services/prisma/user/find.service";
import HttpError from "@src/errors/HttpError";

const checkUsersExistDB = async (users: number[]) => {
    const foundUsers = await findUsersByIds(users);
    if (foundUsers.length !== users.length) {
        throw new HttpError("Some users do not exist", 404);
    }
}

// check if user is trying to block or unblock himself
const checkUserExistUsers = (userId: number, users: number[]) => {
    if (users.includes(userId)) {
        throw new HttpError("User cannot block or unblock himself", 409);
    }
}

export { checkUsersExistDB, checkUserExistUsers };