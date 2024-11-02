import db from "@DB";


const findUserByEmail = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, userName: true, password: true },
    });
    return user;
};

const findUserByUserName = async (userName: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { userName },
        select: { userName: true },
    });
    return user ? user.userName : null;
};

const findUserByPhoneNumber = async (phoneNumber: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { phoneNumber },
        select: { phoneNumber: true },
    });
    return user ? user.phoneNumber : null;
};

const findUserByUserToken = async (userId: number, userToken: string) => {
    const user = await db.user.findUnique({
        where: {
            id: userId,
            tokens: {
                some: {
                    token: userToken,
                },
            },
        },
        select: { id: true, email: true, name: true, userName: true },
    });
    return user;
}

export { findUserByEmail, findUserByPhoneNumber, findUserByUserName, findUserByUserToken };