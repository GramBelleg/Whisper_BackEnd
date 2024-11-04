import db from "@DB";
import HttpError from "@src/errors/HttpError";

async function deleteUserToken(userId: number, userToken: string) {
    try {
        await db.userToken.delete({
            where: {
                userId_token: {
                    userId,
                    token: userToken,
                },
            }
        });
    } catch (err: any) {
        throw new HttpError("User token deletion failed as user id or token is wrong", 409);
    }
}

async function deleteAllUserTokens(userId: number) {
    try {
        await db.userToken.deleteMany({
            where: {
                userId,
            },
        });
    } catch (err: any) {
        throw new HttpError("Deletion of all user tokens of the user failed as user id is wrong", 409);
    }
}

async function deleteExpiredTokens() {
    try {
        await db.userToken.deleteMany({
            where: {
                expireAt: {
                    lte: new Date(),
                },
            },
        });
    } catch (err: any) {
        console.log("Expired tokens deletion failed");
    }
}

export { deleteUserToken, deleteAllUserTokens, deleteExpiredTokens };