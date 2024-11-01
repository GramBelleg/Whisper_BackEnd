import db from "@DB";


const findEmail = async (email: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { email },
        select: { email: true },
    });
    return user ? user.email : null;
};


const findUserName = async (userName: string): Promise<string | null> => {
    const user = await db.user.findUnique({
        where: { userName },
        select: { userName: true },
    });
    return user ? user.userName : null;
};

const findPhoneNumber = async (phoneNumber: string): Promise<string | null> => {
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
    });
    return user;
}

export { findEmail, findPhoneNumber, findUserName, findUserByUserToken };