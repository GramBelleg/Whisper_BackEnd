import db from "@DB";

export const getMembers = async (chatId: number, query: string) => {
    const users = await db.$queryRaw`SELECT * FROM "User" WHERE "userName" % ${query};`;
    return users;
};
