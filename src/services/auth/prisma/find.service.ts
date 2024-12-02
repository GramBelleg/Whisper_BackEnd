import db from "@DB";

const findUserByEmail = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email },
    });
    return user;
};

const findUserByUserName = async (userName: string): Promise<number | null> => {
    const user = await db.user.findUnique({
        where: { userName },
        select: { id: true },
    });
    return user ? user.id : null;
};

const findUserByPhoneNumber = async (phoneNumber: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { phoneNumber },
        select: { phoneNumber: true },
    });
    return user ? user.phoneNumber : null;
};

const findTokenByUserIdToken = async (userId: number, userToken: string) => {
    const user = await db.userToken.findUnique({
        where: {
            userId_token: {
                userId,
                token: userToken,
            },
        },
        select: { userId: true, token: true },
    });
    return user;
};

export { findUserByEmail, findUserByPhoneNumber, findUserByUserName, findTokenByUserIdToken };
