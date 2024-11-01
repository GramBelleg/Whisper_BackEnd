import db from "@DB";

async function deleteUserToken(userId: number, userToken: string) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                tokens: {
                    deleteMany: {
                        token: userToken,
                    },
                },
            },
        });
    } catch (err) {
        throw new Error("Error in deleting token");
    }
}

async function deleteAllUserTokens(userId: number) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                tokens: {
                    deleteMany: {},
                },
            },
        });
    } catch (err) {
        throw new Error("Error in deleting all tokens of user");
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
        console.log("Error in deleting expired tokens on database");
    }
}

export { deleteUserToken, deleteAllUserTokens, deleteExpiredTokens };