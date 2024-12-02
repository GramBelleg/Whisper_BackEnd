import db from "@DB";
import HttpError from "@src/errors/HttpError";

const createRelates = async (userId: number, users: number[], isBlocked: boolean, isContacted: boolean) => {
    try {
        await db.relates.createMany({
            data: users.map((user) => {
                return {
                    relatingId: userId,
                    relatedById: user,
                    isBlocked: isBlocked,
                    isContact: isContacted
                }
            }),
            skipDuplicates: true
        });
    } catch (err) {
        throw new HttpError("Relates creating failed", 409);
    }
}

export { createRelates };