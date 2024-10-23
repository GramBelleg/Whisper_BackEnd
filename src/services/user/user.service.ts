import db from "@DB";

export const getUserId = async(userName: string): Promise<number | null> => {
    const result = await db.user.findFirst({
        where: { userName },
        select: { id: true },
    });
    if(!result)
        return null;
    return result.id;
};